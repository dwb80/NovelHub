# 异步任务处理方案 (BullMQ)

**文档版本**: 1.0.0  
**最后更新**: 2026-04-15  
**优先级**: P1

---

## 1. 概述

### 1.1 为什么需要异步任务

NovelHub 平台中存在大量耗时操作，需要在后台异步执行：

| 任务类型 | 耗时 | 同步执行问题 | 异步收益 |
|---------|------|-------------|---------|
| NEF 进化计算 | 5-30s | 阻塞用户请求 | 后台处理，即时响应 |
| 全文搜索索引 | 1-5s | 影响写入性能 | 解耦读写 |
| 邮件/通知发送 | 1-3s | 延迟用户体验 | 批量处理，提高吞吐 |
| 图片/文件处理 | 2-10s | 占用连接 | 后台处理，资源优化 |
| 数据导出 | 10-60s | 超时风险 | 后台生成，下载通知 |
| 定时统计计算 | 30s+ | 不可能同步 | 定时触发，数据预热 |

### 1.2 技术选型: BullMQ

**选择 BullMQ 的理由**:

| 特性 | BullMQ | 其他方案 |
|------|--------|---------|
| Redis 基础 | ✅ 利用现有 Redis | 需额外组件 |
| TypeScript 支持 | ✅ 原生支持 | 需适配 |
| 延迟任务 | ✅ 内置支持 | 需额外实现 |
| 任务优先级 | ✅ 支持 | 部分支持 |
| 重试机制 | ✅ 灵活配置 | 基础支持 |
| 进度追踪 | ✅ 内置 | 需自定义 |
| 流式处理 | ✅ 支持 | 不支持 |
| 监控 UI | ✅ bull-board | 第三方 |

---

## 2. 架构设计

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        NovelHub API                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   任务生产者  │  │   任务状态   │  │   结果查询   │          │
│  │   (Producer) │  │   (Status)   │  │   (Result)   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼─────────────────┼─────────────────┼──────────────────┘
          │                 │                 │
          │  Job {data, opts}              │
          ▼                 │                 │
┌─────────────────────────────────────────────────────────────────┐
│                      Redis (BullMQ)                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Queue (List)                        │   │
│  │  [Job3] [Job2] [Job1] ← 新任务从左侧加入               │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Delayed Set                         │   │
│  │  {timestamp: Job4} {timestamp: Job5}                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Completed/Fail Set                  │   │
│  │  已完成的任务，可配置保留时间                           │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
          │
          │  BRPOPLPUSH (阻塞式获取)
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Worker 进程                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Worker-1    │  │  Worker-2    │  │  Worker-N    │          │
│  │  (CPU: 2核)  │  │  (CPU: 2核)  │  │  (CPU: 2核)  │          │
│  │              │  │              │  │              │          │
│  │  Concurrency:│  │  Concurrency:│  │  Concurrency:│          │
│  │  5 jobs      │  │  5 jobs      │  │  5 jobs      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 队列划分

```typescript
// config/queues.config.ts
export const QueueConfig = {
  // NEF 进化任务队列
  evolution: {
    name: 'evolution',
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: {
        count: 100,
        age: 24 * 3600, // 保留1天
      },
      removeOnFail: {
        count: 50,
      },
    },
    limiter: {
      max: 10, // 最多10个并发
      duration: 1000,
    },
  },

  // 搜索索引队列
  searchIndex: {
    name: 'search-index',
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'fixed',
        delay: 1000,
      },
      removeOnComplete: true,
    },
  },

  // 邮件/通知队列
  notification: {
    name: 'notification',
    defaultJobOptions: {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
    },
  },

  // 文件处理队列
  fileProcessing: {
    name: 'file-processing',
    defaultJobOptions: {
      attempts: 2,
      timeout: 60000, // 1分钟超时
    },
  },

  // 定时任务队列
  scheduled: {
    name: 'scheduled',
    defaultJobOptions: {
      attempts: 1,
    },
  },
};
```

---

## 3. 核心实现

### 3.1 队列模块配置

```typescript
// queues/queues.module.ts
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { QueueConfig } from '../config/queues.config';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT, 10),
        password: process.env.REDIS_PASSWORD,
      },
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    }),
    BullModule.registerQueue(
      { name: QueueConfig.evolution.name },
      { name: QueueConfig.searchIndex.name },
      { name: QueueConfig.notification.name },
      { name: QueueConfig.fileProcessing.name },
      { name: QueueConfig.scheduled.name },
    ),
  ],
  exports: [BullModule],
})
export class QueuesModule {}
```

### 3.2 任务生产者服务

```typescript
// queues/services/queue-producer.service.ts
@Injectable()
export class QueueProducerService {
  constructor(
    @InjectQueue('evolution') private evolutionQueue: Queue,
    @InjectQueue('search-index') private searchIndexQueue: Queue,
    @InjectQueue('notification') private notificationQueue: Queue,
    @InjectQueue('file-processing') private fileProcessingQueue: Queue,
    @InjectQueue('scheduled') private scheduledQueue: Queue,
  ) {}

  // NEF 进化任务
  async addEvolutionTask(data: EvolutionJobData, options?: JobsOptions) {
    const job = await this.evolutionQueue.add('evolve', data, {
      ...QueueConfig.evolution.defaultJobOptions,
      ...options,
      jobId: `evolution:${data.archiveId}`, // 去重
    });

    this.logger.log(`进化任务已加入队列: ${job.id}`);
    return job;
  }

  // 搜索索引任务
  async addSearchIndexTask(
    operation: 'index' | 'update' | 'delete',
    documentType: 'novel' | 'chapter',
    documentId: string,
    data?: any,
  ) {
    return this.searchIndexQueue.add('index-document', {
      operation,
      documentType,
      documentId,
      data,
    });
  }

  // 批量索引
  async addBulkIndexTask(documents: any[]) {
    return this.searchIndexQueue.add('bulk-index', {
      documents,
      batchSize: 100,
    }, {
      priority: 1, // 低优先级
    });
  }

  // 邮件通知
  async addEmailNotification(
    to: string,
    template: string,
    data: any,
    options?: { delay?: number },
  ) {
    return this.notificationQueue.add('send-email', {
      to,
      template,
      data,
    }, {
      delay: options?.delay,
      priority: 2, // 邮件优先级较低
    });
  }

  // 实时通知 (WebSocket)
  async addRealtimeNotification(
    userId: string,
    event: string,
    data: any,
  ) {
    return this.notificationQueue.add('send-realtime', {
      userId,
      event,
      data,
    }, {
      priority: 1, // 高优先级
    });
  }

  // 文件处理
  async addFileProcessingTask(
    fileUrl: string,
    operation: 'compress' | 'convert' | 'analyze',
    options?: any,
  ) {
    return this.fileProcessingQueue.add('process-file', {
      fileUrl,
      operation,
      options,
    }, {
      timeout: 60000,
    });
  }

  // 定时任务
  async scheduleTask(
    name: string,
    data: any,
    cron: string,
  ) {
    return this.scheduledQueue.add(name, data, {
      repeat: { cron },
    });
  }

  // 延迟任务示例: 7天后提醒
  async scheduleReminder(userId: string, novelId: string, delayMs: number) {
    return this.notificationQueue.add('reading-reminder', {
      userId,
      novelId,
    }, {
      delay: delayMs,
    });
  }
}
```

### 3.3 任务处理器

#### 3.3.1 NEF 进化处理器

```typescript
// queues/processors/evolution.processor.ts
@Processor('evolution', {
  concurrency: 5,
  limiter: {
    max: 10,
    duration: 1000,
  },
})
export class EvolutionProcessor extends WorkerHost {
  private readonly logger = new Logger(EvolutionProcessor.name);

  constructor(
    private computeClient: ComputePlaneClient,
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {
    super();
  }

  async process(job: Job<EvolutionJobData>): Promise<any> {
    const { archiveId, strategy, patterns, profiles, styles } = job.data;

    this.logger.log(`开始处理进化任务: ${job.id}, 档案: ${archiveId}`);

    try {
      // 更新进度: 10%
      await job.updateProgress(10);

      // 1. 调用计算平面
      const result = await this.computeClient.evolve({
        archiveId,
        strategy,
        patterns,
        profiles,
        styles,
      });

      await job.updateProgress(60);

      // 2. 保存结果
      await this.saveEvolutionResult(archiveId, result);

      await job.updateProgress(90);

      // 3. 发送通知
      await this.eventEmitter.emit('evolution.completed', {
        archiveId,
        result,
        jobId: job.id,
      });

      await job.updateProgress(100);

      this.logger.log(`进化任务完成: ${job.id}`);

      return result;
    } catch (error) {
      this.logger.error(`进化任务失败: ${job.id}`, error);
      throw error;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`任务 ${job.id} 已完成，耗时 ${job.finishedOn - job.timestamp}ms`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`任务 ${job.id} 失败: ${error.message}`);
    
    // 记录失败日志
    this.auditLog.log({
      action: 'EVOLUTION_FAILED',
      jobId: job.id,
      archiveId: job.data.archiveId,
      error: error.message,
    });
  }

  @OnWorkerEvent('progress')
  onProgress(job: Job, progress: number) {
    this.logger.debug(`任务 ${job.id} 进度: ${progress}%`);
    
    // 实时通知用户
    this.eventEmitter.emit('evolution.progress', {
      jobId: job.id,
      archiveId: job.data.archiveId,
      progress,
    });
  }

  private async saveEvolutionResult(archiveId: string, result: EvolutionResult) {
    // 实现略
  }
}
```

#### 3.3.2 搜索索引处理器

```typescript
// queues/processors/search-index.processor.ts
@Processor('search-index')
export class SearchIndexProcessor extends WorkerHost {
  constructor(private openSearch: OpenSearchService) {
    super();
  }

  async process(job: Job<SearchIndexJobData>): Promise<void> {
    const { operation, documentType, documentId, data } = job.data;

    switch (operation) {
      case 'index':
        await this.indexDocument(documentType, documentId, data);
        break;
      case 'update':
        await this.updateDocument(documentType, documentId, data);
        break;
      case 'delete':
        await this.deleteDocument(documentType, documentId);
        break;
      case 'bulk-index':
        await this.bulkIndex(data.documents, data.batchSize);
        break;
    }
  }

  private async indexDocument(type: string, id: string, data: any) {
    await this.openSearch.index({
      index: `${type}s`,
      id,
      body: data,
    });
  }

  private async bulkIndex(documents: any[], batchSize: number) {
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      await this.openSearch.bulk({
        body: batch.flatMap(doc => [
          { index: { _index: 'novels', _id: doc.id } },
          doc,
        ]),
      });
    }
  }
}
```

#### 3.3.3 通知处理器

```typescript
// queues/processors/notification.processor.ts
@Processor('notification')
export class NotificationProcessor extends WorkerHost {
  constructor(
    private emailService: EmailService,
    private websocketGateway: NotificationGateway,
  ) {
    super();
  }

  async process(job: Job<NotificationJobData>): Promise<void> {
    switch (job.name) {
      case 'send-email':
        await this.sendEmail(job.data);
        break;
      case 'send-realtime':
        await this.sendRealtimeNotification(job.data);
        break;
      case 'reading-reminder':
        await this.sendReadingReminder(job.data);
        break;
    }
  }

  private async sendEmail(data: EmailData) {
    await this.emailService.sendTemplate(
      data.to,
      data.template,
      data.data,
    );
  }

  private async sendRealtimeNotification(data: RealtimeData) {
    this.websocketGateway.sendToUser(data.userId, data.event, data.data);
  }

  private async sendReadingReminder(data: ReminderData) {
    const novel = await this.prisma.novel.findUnique({
      where: { id: data.novelId },
    });

    await this.emailService.send(data.userId, 'reading-reminder', {
      novelTitle: novel.title,
      lastReadChapter: novel.lastReadChapter,
    });
  }
}
```

### 3.4 任务状态查询服务

```typescript
// queues/services/job-status.service.ts
@Injectable()
export class JobStatusService {
  constructor(
    @InjectQueue('evolution') private evolutionQueue: Queue,
    @InjectQueue('search-index') private searchIndexQueue: Queue,
  ) {}

  async getJobStatus(queueName: string, jobId: string) {
    const queue = this.getQueue(queueName);
    const job = await queue.getJob(jobId);

    if (!job) {
      return { status: 'NOT_FOUND' };
    }

    const state = await job.getState();
    const progress = await job.progress;

    return {
      id: job.id,
      name: job.name,
      status: state,
      progress,
      data: job.data,
      result: job.returnvalue,
      failedReason: job.failedReason,
      timestamp: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
      attemptsMade: job.attemptsMade,
    };
  }

  async getQueueStats(queueName: string) {
    const queue = this.getQueue(queueName);
    
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + delayed,
    };
  }

  async retryFailedJob(queueName: string, jobId: string) {
    const queue = this.getQueue(queueName);
    const job = await queue.getJob(jobId);
    
    if (job) {
      await job.retry();
      return { success: true };
    }
    
    return { success: false, error: 'Job not found' };
  }

  async cleanQueue(queueName: string, status: JobStatusClean, maxAge: number) {
    const queue = this.getQueue(queueName);
    await queue.clean(maxAge, status);
  }

  private getQueue(name: string): Queue {
    // 返回对应的队列实例
  }
}
```

---

## 4. 监控与管理

### 4.1 Bull Board 监控面板

```typescript
// queues/bull-board.ts
import { ExpressAdapter } from '@bull-board/express';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { createBullBoard } from '@bull-board/api';

export function setupBullBoard(app: INestApplication) {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  createBullBoard({
    queues: [
      new BullAdapter(evolutionQueue),
      new BullAdapter(searchIndexQueue),
      new BullAdapter(notificationQueue),
      new BullAdapter(fileProcessingQueue),
    ],
    serverAdapter,
  });

  app.use('/admin/queues', serverAdapter.getRouter());
}
```

### 4.2 队列健康检查

```typescript
// health/queue.health.ts
@Injectable()
export class QueueHealthIndicator extends HealthIndicator {
  constructor(
    @InjectQueue('evolution') private evolutionQueue: Queue,
  ) {
    super();
  }

  async isHealthy(): Promise<HealthIndicatorResult> {
    try {
      const waiting = await this.evolutionQueue.getWaitingCount();
      const failed = await this.evolutionQueue.getFailedCount();

      const isHealthy = waiting < 1000 && failed < 100;

      return this.getStatus('queues', isHealthy, {
        evolution: { waiting, failed },
      });
    } catch (error) {
      return this.getStatus('queues', false, { error: error.message });
    }
  }
}
```

---

## 5. 最佳实践

### 5.1 任务设计原则

1. **幂等性**: 任务应可安全重试
```typescript
// 好的做法: 检查状态避免重复处理
async process(job: Job) {
  const existing = await this.prisma.result.findUnique({
    where: { jobId: job.id },
  });
  if (existing) return existing; // 已处理过
  
  // 处理任务...
}
```

2. **小任务**: 大任务拆分为小任务
```typescript
// 不好的做法: 一个大任务处理1000条数据
await queue.add('process-all', { ids: allIds });

// 好的做法: 拆分为小批次
for (const batch of chunks(allIds, 100)) {
  await queue.add('process-batch', { ids: batch });
}
```

3. **超时设置**: 避免任务无限运行
```typescript
await queue.add('task', data, {
  timeout: 30000, // 30秒超时
  attempts: 3,
});
```

### 5.2 错误处理

```typescript
@Processor('queue')
export class MyProcessor extends WorkerHost {
  async process(job: Job) {
    try {
      await this.doWork(job.data);
    } catch (error) {
      // 分类错误
      if (error instanceof TransientError) {
        // 临时错误，会重试
        throw error;
      }
      
      if (error instanceof PermanentError) {
        // 永久错误，不再重试
        await job.moveToFailed(error, true);
        return;
      }
      
      // 未知错误，抛出重试
      throw error;
    }
  }
}
```

---

## 6. 部署配置

### 6.1 Docker Compose

```yaml
# docker-compose.queues.yml
version: '3.8'

services:
  api:
    build: .
    environment:
      - REDIS_HOST=redis
      - QUEUE_WORKERS_ENABLED=false # API 不运行 Worker

  worker-evolution:
    build: .
    command: npm run worker:evolution
    environment:
      - REDIS_HOST=redis
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '2'
          memory: 4G

  worker-search:
    build: .
    command: npm run worker:search
    environment:
      - REDIS_HOST=redis
    deploy:
      replicas: 2

  worker-notification:
    build: .
    command: npm run worker:notification
    environment:
      - REDIS_HOST=redis
    deploy:
      replicas: 2

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  redis_data:
```

### 6.2 启动脚本

```json
// package.json
{
  "scripts": {
    "worker:evolution": "node dist/workers/evolution.worker.js",
    "worker:search": "node dist/workers/search.worker.js",
    "worker:notification": "node dist/workers/notification.worker.js",
    "workers": "concurrently \"npm run worker:evolution\" \"npm run worker:search\" \"npm run worker:notification\""
  }
}
```

---

## 7. 相关文档

- [技术架构文档](./技术架构文档.md)
- [NEF引擎架构](./nef-engine-architecture.md)
- [BullMQ 官方文档](https://docs.bullmq.io/)

---

**文档版本**: 1.0.0  
**最后更新**: 2026-04-15
