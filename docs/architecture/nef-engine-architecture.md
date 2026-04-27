# NEF 引擎详细架构设计文档

**文档版本**: 1.0.0  
**最后更新**: 2026-04-15  
**优先级**: P0

---

## 1. 架构概述

### 1.1 设计原则

NEF (Novel Evolution Framework) 引擎采用**控制平面 + 计算平面**分离架构：

- **控制平面 (Control Plane)**: NestJS 服务，负责 API 接口、任务调度、结果存储
- **计算平面 (Compute Plane)**: Python/FastAPI 服务，负责进化算法、Prompt 生成、LLM 调用

### 1.2 架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                      控制平面 (NestJS)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   API 网关   │  │  任务调度器   │  │  结果处理器   │          │
│  │              │  │              │  │              │          │
│  │ - 创作档案   │  │ - 任务队列   │  │ - 结果验证   │          │
│  │ - 进化请求   │  │ - 状态管理   │  │ - 数据持久化 │          │
│  │ - 洞察查询   │  │ - 重试机制   │  │ - 事件通知   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼─────────────────┼─────────────────┼──────────────────┘
          │                 │                 │
          │    HTTP/gRPC    │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      计算平面 (Python/FastAPI)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  进化引擎    │  │  Prompt生成器 │  │  LLM 客户端   │          │
│  │              │  │              │  │              │          │
│  │ - 情节分析   │  │ - 模板管理   │  │ - OpenAI API │          │
│  │ - 模式匹配   │  │ - 变量替换   │  │ - Claude API │          │
│  │ - 进化策略   │  │ - 上下文构建 │  │ - 本地模型   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. 控制平面设计 (NestJS)

### 2.1 模块结构

```
backend/src/nef/
├── nef.module.ts                    # NEF 根模块
├── controllers/
│   ├── archive.controller.ts        # 创作档案 API
│   ├── evolution.controller.ts      # 进化任务 API
│   └── insight.controller.ts        # 洞察查询 API
├── services/
│   ├── archive.service.ts           # 档案管理服务
│   ├── evolution.service.ts         # 进化任务服务
│   ├── insight.service.ts           # 洞察处理服务
│   └── task-scheduler.service.ts    # 任务调度服务
├── processors/
│   └── evolution.processor.ts       # Bull 队列处理器
├── clients/
│   └── compute-plane.client.ts      # 计算平面客户端
└── dto/
    ├── archive.dto.ts
    ├── evolution.dto.ts
    └── insight.dto.ts
```

### 2.2 核心服务实现

#### 2.2.1 任务调度服务

```typescript
// services/task-scheduler.service.ts
@Injectable()
export class TaskSchedulerService {
  constructor(
    @InjectQueue('evolution') private evolutionQueue: Queue,
    private prisma: PrismaService,
  ) {}

  async scheduleEvolution(archiveId: string, strategy: EvolutionStrategy) {
    // 1. 验证档案状态
    const archive = await this.prisma.creationArchive.findUnique({
      where: { id: archiveId },
      include: {
        plotPatterns: true,
        characterProfiles: true,
        writingStyles: true,
      },
    });

    if (!archive) {
      throw new NotFoundException('创作档案不存在');
    }

    // 2. 检查是否已有进行中的进化任务
    const existingJob = await this.evolutionQueue.getJob(archiveId);
    if (existingJob && await existingJob.isActive()) {
      throw new ConflictException('该档案已有进行中的进化任务');
    }

    // 3. 创建进化任务
    const job = await this.evolutionQueue.add(
      'evolve',
      {
        archiveId,
        strategy,
        patterns: archive.plotPatterns,
        profiles: archive.characterProfiles,
        styles: archive.writingStyles,
      },
      {
        jobId: archiveId,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: false,
        removeOnFail: false,
      },
    );

    // 4. 更新档案状态
    await this.prisma.creationArchive.update({
      where: { id: archiveId },
      data: {
        evolutionStatus: 'PENDING',
        lastEvolutionAt: new Date(),
      },
    });

    return { jobId: job.id, status: 'PENDING' };
  }

  async getEvolutionStatus(archiveId: string) {
    const job = await this.evolutionQueue.getJob(archiveId);
    if (!job) {
      return { status: 'NOT_FOUND' };
    }

    const state = await job.getState();
    const progress = job.progress;

    return {
      status: state.toUpperCase(),
      progress,
      result: job.returnvalue,
      failedReason: job.failedReason,
    };
  }
}
```

#### 2.2.2 计算平面客户端

```typescript
// clients/compute-plane.client.ts
@Injectable()
export class ComputePlaneClient {
  private readonly httpClient: AxiosInstance;

  constructor(private config: ConfigService) {
    this.httpClient = axios.create({
      baseURL: config.get('COMPUTE_PLANE_URL'),
      timeout: 300000, // 5分钟超时
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.get('COMPUTE_PLANE_API_KEY'),
      },
    });
  }

  async evolve(data: EvolutionRequest): Promise<EvolutionResult> {
    try {
      const response = await this.httpClient.post('/evolve', data);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(
          error.response.data.message || '进化计算失败',
          error.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        '计算平面服务不可用',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async generatePrompt(template: string, variables: Record<string, any>): Promise<string> {
    const response = await this.httpClient.post('/prompt/generate', {
      template,
      variables,
    });
    return response.data.prompt;
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.httpClient.get('/health', { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
}
```

#### 2.2.3 Bull 队列处理器

```typescript
// processors/evolution.processor.ts
@Processor('evolution')
export class EvolutionProcessor {
  private readonly logger = new Logger(EvolutionProcessor.name);

  constructor(
    private computeClient: ComputePlaneClient,
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  @Process('evolve')
  async handleEvolution(job: Job<EvolutionJobData>) {
    const { archiveId, strategy, patterns, profiles, styles } = job.data;

    this.logger.log(`开始处理进化任务: ${archiveId}, 策略: ${strategy}`);

    // 1. 更新进度
    await job.progress(10);

    // 2. 调用计算平面
    try {
      const result = await this.computeClient.evolve({
        archiveId,
        strategy,
        patterns,
        profiles,
        styles,
      });

      await job.progress(80);

      // 3. 保存进化结果
      await this.saveEvolutionResult(archiveId, result);

      await job.progress(100);

      // 4. 发送事件通知
      this.eventEmitter.emit('evolution.completed', {
        archiveId,
        result,
        timestamp: new Date(),
      });

      this.logger.log(`进化任务完成: ${archiveId}`);

      return result;
    } catch (error) {
      this.logger.error(`进化任务失败: ${archiveId}`, error);
      throw error;
    }
  }

  @OnQueueFailed()
  async onFailed(job: Job, error: Error) {
    this.logger.error(`进化任务失败: ${job.id}`, error);

    // 更新档案状态为失败
    await this.prisma.creationArchive.update({
      where: { id: job.data.archiveId },
      data: {
        evolutionStatus: 'FAILED',
        evolutionError: error.message,
      },
    });

    // 发送失败通知
    this.eventEmitter.emit('evolution.failed', {
      archiveId: job.data.archiveId,
      error: error.message,
    });
  }

  private async saveEvolutionResult(archiveId: string, result: EvolutionResult) {
    await this.prisma.$transaction([
      // 更新档案版本
      this.prisma.creationArchive.update({
        where: { id: archiveId },
        data: {
          version: result.newVersion,
          evolutionStatus: 'COMPLETED',
          lastEvolutionAt: new Date(),
        },
      }),

      // 保存进化历史
      this.prisma.evolutionHistory.create({
        data: {
          archiveId,
          strategy: result.strategy,
          changes: result.changes,
          metrics: result.metrics,
          beforeState: result.beforeState,
          afterState: result.afterState,
        },
      }),

      // 更新模式库
      ...result.updatedPatterns.map(pattern =>
        this.prisma.plotPattern.update({
          where: { id: pattern.id },
          data: {
            successRate: pattern.successRate,
            confidence: pattern.confidence,
            useCount: { increment: 1 },
          },
        }),
      ),
    ]);
  }
}
```

---

## 3. 计算平面设计 (Python/FastAPI)

### 3.1 项目结构

```
nef-compute/
├── app/
│   ├── __init__.py
│   ├── main.py                  # FastAPI 应用入口
│   ├── config.py                # 配置管理
│   ├── api/
│   │   ├── __init__.py
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── evolution.py     # 进化 API
│   │   │   ├── prompt.py        # Prompt API
│   │   │   └── health.py        # 健康检查
│   │   └── dependencies.py      # 依赖注入
│   ├── core/
│   │   ├── __init__.py
│   │   ├── evolution_engine.py  # 进化引擎核心
│   │   ├── prompt_generator.py  # Prompt 生成器
│   │   └── llm_client.py        # LLM 客户端
│   ├── strategies/
│   │   ├── __init__.py
│   │   ├── base.py              # 策略基类
│   │   ├── refinement.py        # 精修策略
│   │   ├── restructuring.py     # 重构策略
│   │   └── innovation.py        # 创新策略
│   ├── models/
│   │   ├── __init__.py
│   │   ├── archive.py           # 档案模型
│   │   ├── pattern.py           # 模式模型
│   │   └── evolution.py         # 进化模型
│   └── utils/
│       ├── __init__.py
│       └── text_analysis.py     # 文本分析工具
├── tests/
├── requirements.txt
├── Dockerfile
└── docker-compose.yml
```

### 3.2 核心组件实现

#### 3.2.1 进化引擎

```python
# app/core/evolution_engine.py
from typing import List, Dict, Any
from abc import ABC, abstractmethod
from app.models.archive import CreationArchive
from app.models.evolution import EvolutionResult, EvolutionStrategy

class EvolutionEngine:
    """NEF 进化引擎核心"""

    def __init__(self, llm_client):
        self.llm_client = llm_client
        self.strategies = {}

    def register_strategy(self, name: str, strategy):
        """注册进化策略"""
        self.strategies[name] = strategy

    async def evolve(
        self,
        archive: CreationArchive,
        strategy_type: EvolutionStrategy,
        context: Dict[str, Any]
    ) -> EvolutionResult:
        """
        执行进化计算

        Args:
            archive: 创作档案
            strategy_type: 进化策略类型
            context: 进化上下文（反馈信号、目标等）

        Returns:
            EvolutionResult: 进化结果
        """
        strategy = self.strategies.get(strategy_type)
        if not strategy:
            raise ValueError(f"未知的进化策略: {strategy_type}")

        # 1. 分析当前状态
        current_analysis = await self._analyze_archive(archive)

        # 2. 应用进化策略
        evolution_plan = await strategy.generate_plan(
            archive, current_analysis, context
        )

        # 3. 执行进化
        changes = []
        for step in evolution_plan.steps:
            change = await self._execute_step(step, archive)
            changes.append(change)

        # 4. 验证结果
        validation = await self._validate_changes(archive, changes)

        return EvolutionResult(
            archive_id=archive.id,
            strategy=strategy_type,
            changes=changes,
            metrics=validation.metrics,
            new_version=self._generate_version(archive.version),
            before_state=current_analysis,
            after_state=validation.analysis,
        )

    async def _analyze_archive(self, archive: CreationArchive) -> Dict[str, Any]:
        """分析档案当前状态"""
        return {
            "pattern_count": len(archive.plot_patterns),
            "profile_count": len(archive.character_profiles),
            "style_count": len(archive.writing_styles),
            "avg_success_rate": self._calculate_avg_success_rate(archive),
            "weak_areas": self._identify_weak_areas(archive),
        }

    async def _execute_step(self, step, archive) -> Dict[str, Any]:
        """执行单个进化步骤"""
        prompt = self._build_prompt(step, archive)
        response = await self.llm_client.generate(prompt)
        return self._parse_response(response, step.type)

    async def _validate_changes(
        self, archive: CreationArchive, changes: List[Dict]
    ) -> Any:
        """验证进化结果"""
        # 实现验证逻辑
        pass

    def _generate_version(self, current_version: str) -> str:
        """生成新版本号"""
        parts = current_version.split(".")
        parts[-1] = str(int(parts[-1]) + 1)
        return ".".join(parts)
```

#### 3.2.2 进化策略实现

```python
# app/strategies/refinement.py
from app.strategies.base import EvolutionStrategy
from app.models.archive import CreationArchive

class RefinementStrategy(EvolutionStrategy):
    """
    精修策略

    基于反馈信号对现有模式进行微调优化
    """

    async def generate_plan(self, archive, analysis, context):
        """生成精修计划"""
        feedback_signals = context.get("feedback_signals", [])

        steps = []

        # 1. 识别需要精修的模式
        for signal in feedback_signals:
            if signal.confidence > 0.7:
                steps.append(EvolutionStep(
                    type="REFINE_PATTERN",
                    target=signal.pattern_id,
                    action="adjust_weight",
                    params={"attribute": signal.attribute, "delta": signal.value * 0.1},
                ))

        # 2. 生成 Prompt 精修建议
        if steps:
            steps.append(EvolutionStep(
                type="GENERATE_PROMPT",
                target="refinement_prompt",
                action="create",
                params={"changes": steps},
            ))

        return EvolutionPlan(steps=steps)

    async def execute_step(self, step, archive):
        """执行精修步骤"""
        if step.type == "REFINE_PATTERN":
            return await self._refine_pattern(step, archive)
        elif step.type == "GENERATE_PROMPT":
            return await self._generate_refinement_prompt(step, archive)

    async def _refine_pattern(self, step, archive):
        """精修情节模式"""
        pattern = next(
            p for p in archive.plot_patterns if p.id == step.target
        )

        # 调整模式参数
        if step.params["attribute"] == "success_rate":
            pattern.success_rate += step.params["delta"]
            pattern.success_rate = max(0, min(1, pattern.success_rate))

        return {
            "type": "pattern_refined",
            "pattern_id": pattern.id,
            "changes": {step.params["attribute"]: pattern.success_rate},
        }
```

#### 3.2.3 LLM 客户端

```python
# app/core/llm_client.py
import openai
import anthropic
from typing import Optional, Dict, Any

class LLMClient:
    """LLM 客户端，支持多个提供商"""

    def __init__(self, config: Dict[str, Any]):
        self.openai_client = openai.AsyncOpenAI(
            api_key=config.get("OPENAI_API_KEY")
        )
        self.anthropic_client = anthropic.AsyncAnthropic(
            api_key=config.get("ANTHROPIC_API_KEY")
        )
        self.default_model = config.get("DEFAULT_MODEL", "gpt-4")
        self.fallback_model = config.get("FALLBACK_MODEL", "claude-3-opus")

    async def generate(
        self,
        prompt: str,
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000,
    ) -> str:
        """生成文本"""
        try:
            if model and model.startswith("claude"):
                return await self._generate_claude(prompt, model, temperature, max_tokens)
            else:
                return await self._generate_openai(prompt, model or self.default_model, temperature, max_tokens)
        except Exception as e:
            # 失败时使用备用模型
            return await self._generate_claude(prompt, self.fallback_model, temperature, max_tokens)

    async def _generate_openai(
        self, prompt: str, model: str, temperature: float, max_tokens: int
    ) -> str:
        response = await self.openai_client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content

    async def _generate_claude(
        self, prompt: str, model: str, temperature: float, max_tokens: int
    ) -> str:
        response = await self.anthropic_client.messages.create(
            model=model,
            max_tokens=max_tokens,
            temperature=temperature,
            messages=[{"role": "user", "content": prompt}],
        )
        return response.content[0].text
```

### 3.3 FastAPI 路由

```python
# app/api/routes/evolution.py
from fastapi import APIRouter, HTTPException, Depends
from app.core.evolution_engine import EvolutionEngine
from app.models.evolution import EvolutionRequest, EvolutionResult

router = APIRouter()

@router.post("/evolve", response_model=EvolutionResult)
async def evolve(
    request: EvolutionRequest,
    engine: EvolutionEngine = Depends(get_evolution_engine),
):
    """
    执行进化计算
    """
    try:
        result = await engine.evolve(
            archive=request.archive,
            strategy_type=request.strategy,
            context=request.context,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy", "service": "nef-compute"}
```

---

## 4. 部署配置

### 4.1 Docker Compose

```yaml
# docker-compose.nef.yml
version: '3.8'

services:
  nef-control:
    build:
      context: ./apps/backend
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
      - REDIS_URL=redis://redis:6379
      - COMPUTE_PLANE_URL=http://nef-compute:8000
      - COMPUTE_PLANE_API_KEY=${COMPUTE_PLANE_API_KEY}
    depends_on:
      - redis
      - nef-compute

  nef-compute:
    build:
      context: ./nef-compute
      dockerfile: Dockerfile
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - DEFAULT_MODEL=gpt-4
    ports:
      - "8000:8000"
    deploy:
      resources:
        limits:
          memory: 4G
        reservations:
          memory: 2G

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  redis_data:
```

### 4.2 Kubernetes 配置

```yaml
# k8s/nef-compute-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nef-compute
spec:
  replicas: 2
  selector:
    matchLabels:
      app: nef-compute
  template:
    metadata:
      labels:
        app: nef-compute
    spec:
      containers:
        - name: nef-compute
          image: novelhub/nef-compute:latest
          ports:
            - containerPort: 8000
          env:
            - name: OPENAI_API_KEY
              valueFrom:
                secretKeyRef:
                  name: nef-secrets
                  key: openai-api-key
          resources:
            requests:
              memory: "2Gi"
              cpu: "1000m"
            limits:
              memory: "4Gi"
              cpu: "2000m"
          livenessProbe:
            httpGet:
              path: /health
              port: 8000
            initialDelaySeconds: 30
            periodSeconds: 10
```

---

## 5. 性能与扩展性

### 5.1 性能指标

| 指标 | 目标值 | 说明 |
|------|--------|------|
| 进化任务响应时间 | < 30s | 简单精修任务 |
| 复杂进化任务 | < 5min | 涉及多个模式重构 |
| 并发进化任务 | 10+ | 单实例支持 |
| 计算平面可用性 | 99.9% | 健康检查 + 自动重启 |

### 5.2 扩展策略

1. **水平扩展**: 计算平面无状态，可通过 Kubernetes HPA 自动扩缩容
2. **任务队列**: Bull 队列支持 Redis Cluster，可水平扩展
3. **缓存优化**: 进化结果缓存，避免重复计算

---

## 6. 监控与日志

### 6.1 关键指标

```typescript
// 监控指标
interface NEFMetrics {
  // 任务指标
  evolutionTasksTotal: Counter;
  evolutionTasksDuration: Histogram;
  evolutionTasksErrors: Counter;

  // 性能指标
  llmRequestsTotal: Counter;
  llmRequestsDuration: Histogram;
  llmTokensUsed: Counter;

  // 业务指标
  patternsEvolved: Counter;
  insightsGenerated: Counter;
}
```

### 6.2 日志规范

```json
{
  "timestamp": "2026-04-15T10:30:00Z",
  "level": "INFO",
  "service": "nef-control",
  "trace_id": "abc123",
  "span_id": "def456",
  "message": "进化任务完成",
  "attributes": {
    "archive_id": "archive_123",
    "strategy": "REFINEMENT",
    "duration_ms": 15000,
    "changes_count": 3
  }
}
```

---

## 7. 相关文档

- [技术架构文档](./技术架构文档.md)
- [NEF协议规范](../../plan/12-NEF协议规范.md)
- [数据库设计](../../plan/10-数据库设计.md)

---

**文档版本**: 1.0.0  
**最后更新**: 2026-04-15
