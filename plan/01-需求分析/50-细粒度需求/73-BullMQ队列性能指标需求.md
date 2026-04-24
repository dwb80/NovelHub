# BullMQ队列性能指标需求文档

**文档编号**: REQ-QUEUE-PERF-001  
**版本**: v1.0.0  
**日期**: 2026-04-19  
**状态**: 新增  
**关联文档**: [bullmq-async-tasks.md](../../../docs/architecture/bullmq-async-tasks.md)

---

## 1. 引言

### 1.1 目的
本文档定义BullMQ队列系统的性能指标，确保异步任务处理满足高并发场景需求。

### 1.2 范围
- 队列吞吐量指标
- 任务延迟指标
- 队列可靠性指标
- 监控告警指标

---

## 2. 队列架构

### 2.1 队列类型

| 队列名称 | 用途 | 优先级 | 消费者数 |
|---------|------|--------|---------|
| nef-evolution | NEF进化任务 | 高 | 5 |
| nef-insight | 洞察提取任务 | 中 | 3 |
| review-notification | 评审通知 | 中 | 2 |
| chapter-status | 章节状态更新 | 高 | 3 |
| email-notification | 邮件通知 | 低 | 2 |

### 2.2 队列配置

```typescript
interface QueueConfig {
  name: string;
  defaultJobOptions: {
    attempts: number;
    backoff: {
      type: 'exponential' | 'fixed';
      delay: number;
    };
    removeOnComplete: number;
    removeOnFail: number;
  };
  limiter?: {
    max: number;
    duration: number;
  };
}

const queueConfigs: QueueConfig[] = [
  {
    name: 'nef-evolution',
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: 100,
      removeOnFail: 50,
    },
    limiter: { max: 100, duration: 60000 },
  },
];
```

---

## 3. 性能指标

### 3.1 吞吐量指标

| 指标 | 目标值 | 测量方法 |
|------|--------|---------|
| 入队吞吐量 | > 1000 job/s | Prometheus counter |
| 出队吞吐量 | > 500 job/s | Prometheus counter |
| 处理吞吐量 | > 100 job/min | Prometheus counter |
| 峰值处理能力 | > 200 job/min | 压力测试 |

### 3.2 延迟指标

| 指标 | P50 | P95 | P99 |
|------|-----|-----|-----|
| 入队延迟 | < 10ms | < 30ms | < 50ms |
| 任务等待时间 | < 1s | < 5s | < 10s |
| 任务处理时间 | < 5s | < 15s | < 30s |
| 端到端延迟 | < 10s | < 30s | < 60s |

### 3.3 可靠性指标

| 指标 | 目标值 |
|------|--------|
| 任务成功率 | > 99% |
| 任务丢失率 | < 0.01% |
| 重复消费率 | < 0.1% |
| 队列可用性 | > 99.99% |

---

## 4. 监控指标

### 4.1 队列状态指标

```typescript
interface QueueMetrics {
  // 队列深度
  waiting: number;        // 等待中任务数
  active: number;         // 处理中任务数
  delayed: number;        // 延迟任务数
  failed: number;         // 失败任务数
  completed: number;      // 完成任务数
  
  // 性能指标
  throughputIn: number;   // 入队速率 (job/s)
  throughputOut: number;  // 出队速率 (job/s)
  avgWaitTime: number;    // 平均等待时间 (ms)
  avgProcessTime: number; // 平均处理时间 (ms)
  
  // 资源指标
  memoryUsage: number;    // 内存使用 (MB)
  redisMemory: number;    // Redis内存 (MB)
}
```

### 4.2 Prometheus指标定义

```yaml
# 队列深度
bull_queue_waiting{queue="nef-evolution"}
bull_queue_active{queue="nef-evolution"}
bull_queue_failed{queue="nef-evolution"}

# 吞吐量
bull_jobs_added_total{queue="nef-evolution"}
bull_jobs_completed_total{queue="nef-evolution"}
bull_jobs_failed_total{queue="nef-evolution"}

# 延迟
bull_job_wait_time_seconds{queue="nef-evolution",quantile="0.5"}
bull_job_wait_time_seconds{queue="nef-evolution",quantile="0.95"}
bull_job_process_time_seconds{queue="nef-evolution",quantile="0.5"}
```

---

## 5. 告警规则

### 5.1 告警阈值

| 告警级别 | 条件 | 持续时间 | 处理 |
|---------|------|---------|------|
| P1-紧急 | 队列积压 > 10000 | 5分钟 | 立即扩容 |
| P2-高 | 队列积压 > 5000 | 10分钟 | 通知运维 |
| P2-高 | 失败率 > 5% | 5分钟 | 检查错误日志 |
| P3-中 | 平均等待 > 30s | 15分钟 | 关注处理 |
| P3-中 | Worker离线 | 1分钟 | 自动重启 |

### 5.2 告警配置

```yaml
groups:
  - name: bullmq_alerts
    rules:
      - alert: QueueBacklogHigh
        expr: bull_queue_waiting > 5000
        for: 10m
        labels:
          severity: high
        annotations:
          summary: "队列积压过高"
          description: "队列 {{ $labels.queue }} 积压 {{ $value }} 个任务"
      
      - alert: JobFailureRateHigh
        expr: rate(bull_jobs_failed_total[5m]) / rate(bull_jobs_added_total[5m]) > 0.05
        for: 5m
        labels:
          severity: high
        annotations:
          summary: "任务失败率过高"
```

---

## 6. 容量规划

### 6.1 资源需求

| 场景 | 日任务量 | Redis内存 | Worker数 |
|------|---------|----------|---------|
| 开发环境 | 1,000 | 256MB | 2 |
| 测试环境 | 10,000 | 512MB | 3 |
| 生产环境 | 1,000,000 | 4GB | 10 |
| 高峰期 | 5,000,000 | 8GB | 20 |

### 6.2 扩展策略

```typescript
interface ScalingConfig {
  minWorkers: number;
  maxWorkers: number;
  scaleUpThreshold: number;   // 队列深度阈值
  scaleDownThreshold: number;
  cooldownPeriod: number;     // 冷却时间 (秒)
}

const scalingConfig: ScalingConfig = {
  minWorkers: 2,
  maxWorkers: 20,
  scaleUpThreshold: 1000,
  scaleDownThreshold: 100,
  cooldownPeriod: 300,
};
```

---

## 7. 测试用例

### TC-QUEUE-001: 队列入队性能

**步骤**:
1. 使用k6模拟1000并发入队请求
2. 测量入队响应时间
3. 验证所有任务成功入队

**预期结果**:
- 入队成功率 100%
- P95响应时间 < 30ms
- 无任务丢失

### TC-QUEUE-002: 队列积压处理

**步骤**:
1. 停止所有Worker
2. 入队10000个任务
3. 启动Worker
4. 测量处理完成时间

**预期结果**:
- 所有任务处理完成
- 平均处理时间 < 30s
- 无任务丢失

### TC-QUEUE-003: 任务重试机制

**步骤**:
1. 创建会失败的任务
2. 验证自动重试
3. 验证重试次数限制

**预期结果**:
- 任务重试最多3次
- 最终标记为失败
- 记录失败原因

### TC-QUEUE-004: 优先级队列

**步骤**:
1. 同时入队高/中/低优先级任务
2. 验证处理顺序

**预期结果**:
- 高优先级任务优先处理
- 同优先级按FIFO处理

---

## 8. 实现指南

### 8.1 队列服务

```typescript
@Injectable()
export class QueueService {
  private queues: Map<string, Queue> = new Map();
  
  constructor() {
    this.initializeQueues();
  }
  
  private initializeQueues() {
    for (const config of queueConfigs) {
      const queue = new Queue(config.name, {
        connection: redisConfig,
        defaultJobOptions: config.defaultJobOptions,
      });
      this.queues.set(config.name, queue);
    }
  }
  
  async addJob<T>(queueName: string, data: T, options?: JobsOptions): Promise<Job> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }
    return queue.add('process', data, options);
  }
  
  async getQueueMetrics(queueName: string): Promise<QueueMetrics> {
    const queue = this.queues.get(queueName);
    const [waiting, active, delayed, failed, completed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getDelayedCount(),
      queue.getFailedCount(),
      queue.getCompletedCount(),
    ]);
    
    return { waiting, active, delayed, failed, completed };
  }
}
```

### 8.2 Worker服务

```typescript
@Injectable()
export class NefEvolutionWorker {
  private worker: Worker;
  
  constructor(private nefService: NefService) {
    this.worker = new Worker('nef-evolution', async (job) => {
      return this.processEvolution(job.data);
    }, {
      connection: redisConfig,
      concurrency: 5,
    });
    
    this.worker.on('completed', (job) => {
      this.logger.log(`Job ${job.id} completed`);
    });
    
    this.worker.on('failed', (job, err) => {
      this.logger.error(`Job ${job.id} failed: ${err.message}`);
    });
  }
  
  private async processEvolution(data: EvolutionRequest): Promise<EvolutionResult> {
    return this.nefService.evolveContent(data.clawId, data);
  }
}
```

---

## 9. 变更历史

| 版本 | 日期 | 变更内容 | AI智能体作家 |
|------|------|---------|------|
| v1.0.0 | 2026-04-19 | 初始版本 | 代码审查官 |
