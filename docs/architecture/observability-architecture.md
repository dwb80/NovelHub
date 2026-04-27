# 可观测性架构设计方案

**文档版本**: 1.0.0  
**最后更新**: 2026-04-15  
**优先级**: P1

---

## 1. 概述

### 1.1 可观测性三大支柱

```
┌─────────────────────────────────────────────────────────────────┐
│                      可观测性架构                               │
│                                                                 │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│   │    指标      │    │    日志      │    │    追踪      │     │
│   │  (Metrics)   │◄──►│   (Logs)     │◄──►│  (Traces)    │     │
│   │              │    │              │    │              │     │
│   │ - Prometheus │    │ - Loki       │    │ - Jaeger     │     │
│   │ - Grafana    │    │ - ELK        │    │ - OpenTelemetry│   │
│   └──────┬───────┘    └──────┬───────┘    └──────┬───────┘     │
│          │                   │                   │              │
│          └───────────────────┼───────────────────┘              │
│                              ▼                                  │
│                    ┌──────────────────┐                        │
│                    │    统一视图      │                        │
│                    │   (Grafana)      │                        │
│                    └──────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 监控目标

| 层级 | 监控对象 | 关键指标 |
|------|----------|----------|
| 基础设施 | CPU/内存/磁盘/网络 | 使用率、饱和度、错误率 |
| 应用服务 | API 服务、Worker | QPS、延迟、错误率 |
| 数据库 | PostgreSQL、Redis | 连接数、查询性能、缓存命中率 |
| 业务指标 | 用户行为、内容生产 | DAU、留存率、内容发布量 |

---

## 2. 指标监控 (Metrics)

### 2.1 Prometheus + Grafana

#### 2.1.1 架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        应用服务层                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   NestJS     │  │    Next.js   │  │    NEF       │          │
│  │   /metrics   │  │   /metrics   │  │   /metrics   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼─────────────────┼─────────────────┼──────────────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Prometheus 抓取                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  - 15s 抓取间隔                                          │   │
│  │  - 15天 数据保留                                         │   │
│  │  - 告警规则评估                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Grafana 可视化                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   基础设施   │  │   应用性能   │  │   业务指标   │          │
│  │   Dashboard  │  │   Dashboard  │  │   Dashboard  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

#### 2.1.2 指标定义

```typescript
// metrics/metrics.service.ts
@Injectable()
export class MetricsService {
  private readonly registry: Registry;

  // HTTP 请求指标
  public readonly httpRequestsTotal: Counter<string>;
  public readonly httpRequestDuration: Histogram<string>;
  public readonly httpRequestSize: Summary<string>;

  // 业务指标
  public readonly novelsCreatedTotal: Counter<string>;
  public readonly chaptersPublishedTotal: Counter<string>;
  public readonly reviewsSubmittedTotal: Counter<string>;

  // NEF 指标
  public readonly evolutionTasksTotal: Counter<string>;
  public readonly evolutionTaskDuration: Histogram<string>;
  public readonly llmRequestsTotal: Counter<string>;
  public readonly llmTokensUsed: Counter<string>;

  constructor() {
    this.registry = new Registry();

    // HTTP 请求计数
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.registry],
    });

    // HTTP 请求延迟
    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
      registers: [this.registry],
    });

    // 小说创建计数
    this.novelsCreatedTotal = new Counter({
      name: 'novels_created_total',
      help: 'Total novels created',
      labelNames: ['category', 'author_type'],
      registers: [this.registry],
    });

    // NEF 进化任务
    this.evolutionTasksTotal = new Counter({
      name: 'nef_evolution_tasks_total',
      help: 'Total NEF evolution tasks',
      labelNames: ['strategy', 'status'],
      registers: [this.registry],
    });

    this.evolutionTaskDuration = new Histogram({
      name: 'nef_evolution_task_duration_seconds',
      help: 'NEF evolution task duration',
      labelNames: ['strategy'],
      buckets: [1, 5, 10, 30, 60, 120, 300],
      registers: [this.registry],
    });
  }

  getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}
```

#### 2.1.3 指标中间件

```typescript
// metrics/metrics.middleware.ts
@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  constructor(private metrics: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    res.on('finish', () => {
      const duration = (Date.now() - start) / 1000;
      const route = req.route?.path || req.path;
      const method = req.method;
      const statusCode = res.statusCode.toString();

      // 记录指标
      this.metrics.httpRequestsTotal.inc({
        method,
        route,
        status_code: statusCode,
      });

      this.metrics.httpRequestDuration.observe(
        { method, route, status_code: statusCode },
        duration,
      );
    });

    next();
  }
}
```

### 2.2 关键指标列表

#### RED 指标 (Rate/Errors/Duration)

| 指标名 | 类型 | 说明 | 告警阈值 |
|--------|------|------|----------|
| http_requests_total | Counter | HTTP 请求总数 | - |
| http_request_duration_seconds | Histogram | 请求延迟 | P95 > 500ms |
| http_requests_failed_total | Counter | 失败请求数 | 错误率 > 1% |

#### 业务指标

| 指标名 | 类型 | 说明 |
|--------|------|------|
| novels_created_total | Counter | 小说创建数 |
| chapters_published_total | Counter | 章节发布数 |
| reviews_submitted_total | Counter | 评审提交数 |
| active_users_gauge | Gauge | 活跃用户 |

#### NEF 指标

| 指标名 | 类型 | 说明 |
|--------|------|------|
| nef_evolution_tasks_total | Counter | 进化任务数 |
| nef_evolution_task_duration_seconds | Histogram | 进化耗时 |
| llm_requests_total | Counter | LLM 调用次数 |
| llm_tokens_used_total | Counter | Token 使用量 |

---

## 3. 日志系统 (Logs)

### 3.1 Loki + Grafana

#### 3.1.1 日志架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        应用服务层                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   结构化日志  │  │   结构化日志  │  │   结构化日志  │          │
│  │   (JSON)     │  │   (JSON)     │  │   (JSON)     │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼─────────────────┼─────────────────┼──────────────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Promtail 收集                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  - 日志文件监控                                          │   │
│  │  - 标签提取                                              │   │
│  │  - 批量发送                                              │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Loki 存储                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  - 索引优化                                              │   │
│  │  - 压缩存储                                              │   │
│  │  - 查询优化                                              │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Grafana 查询                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  LogQL: {app="novelhub"} |= "error"                     │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

#### 3.1.2 日志格式

```typescript
// logger/logger.service.ts
@Injectable()
export class StructuredLogger {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      defaultMeta: {
        service: 'novelhub-api',
        version: process.env.APP_VERSION,
        environment: process.env.NODE_ENV,
      },
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          filename: 'logs/app.log',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
      ],
    });
  }

  info(message: string, meta?: LogMeta) {
    this.logger.info(message, this.enrichMeta(meta));
  }

  error(message: string, error: Error, meta?: LogMeta) {
    this.logger.error(message, {
      ...this.enrichMeta(meta),
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
    });
  }

  private enrichMeta(meta?: LogMeta): LogMeta {
    const context = asyncLocalStorage.getStore();
    return {
      ...meta,
      traceId: context?.traceId,
      spanId: context?.spanId,
      userId: context?.userId,
      requestPath: context?.requestPath,
    };
  }
}

// 日志示例
{
  "timestamp": "2026-04-15T10:30:00.000Z",
  "level": "info",
  "message": "小说创建成功",
  "service": "novelhub-api",
  "version": "1.0.0",
  "environment": "production",
  "traceId": "abc123",
  "spanId": "def456",
  "userId": "user_789",
  "requestPath": "/api/novels",
  "novelId": "novel_123",
  "title": "AI觉醒之路",
  "durationMs": 150
}
```

### 3.2 日志收集配置

```yaml
# promtail-config.yml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: novelhub-api
    static_configs:
      - targets:
          - localhost
        labels:
          job: novelhub-api
          __path__: /var/log/novelhub/*.log
    pipeline_stages:
      - json:
          expressions:
            level: level
            service: service
            trace_id: traceId
      - labels:
          level:
          service:
      - timestamp:
          source: timestamp
          format: RFC3339
```

---

## 4. 分布式追踪 (Tracing)

### 4.1 OpenTelemetry + Jaeger

#### 4.1.1 追踪架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        应用服务层                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   OpenTelemetry SDK                                      │   │
│  │   - 自动埋点   │  │   - 手动埋点   │  │   - 上下文传递  │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼─────────────────┼─────────────────┼──────────────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      OpenTelemetry Collector                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  - 接收 (OTLP/gRPC/HTTP)                                │   │
│  │  - 处理 (Batch/Filter)                                  │   │
│  │  - 导出 (Jaeger/Zipkin)                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Jaeger 存储                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  - 追踪数据存储                                          │   │
│  │  - 依赖分析                                              │   │
│  │  - 性能分析                                              │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

#### 4.1.2 自动埋点配置

```typescript
// tracing/tracing.module.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'novelhub-api',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV,
  }),
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-http': {
        enabled: true,
      },
      '@opentelemetry/instrumentation-nestjs-core': {
        enabled: true,
      },
      '@opentelemetry/instrumentation-prisma': {
        enabled: true,
      },
    }),
  ],
});

sdk.start();
```

#### 4.1.3 手动埋点

```typescript
// tracing/tracing.service.ts
@Injectable()
export class TracingService {
  private tracer = trace.getTracer('novelhub');

  async traceNefEvolution(archiveId: string, fn: () => Promise<any>) {
    return this.tracer.startActiveSpan(
      'nef.evolution',
      {
        attributes: {
          'nef.archive_id': archiveId,
          'nef.strategy': 'refinement',
        },
      },
      async (span) => {
        try {
          const result = await fn();
          span.setStatus({ code: SpanStatusCode.OK });
          return result;
        } catch (error) {
          span.recordException(error);
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error.message,
          });
          throw error;
        } finally {
          span.end();
        }
      },
    );
  }
}
```

---

## 5. 告警系统

### 5.1 Alertmanager 配置

```yaml
# alertmanager.yml
global:
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_from: 'alerts@novelhub.com'

route:
  receiver: 'default'
  group_by: ['alertname', 'severity']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  routes:
    - match:
        severity: critical
      receiver: 'pagerduty'
      continue: true
    - match:
        severity: warning
      receiver: 'slack'

receivers:
  - name: 'default'
    email_configs:
      - to: 'ops@novelhub.com'

  - name: 'pagerduty'
    pagerduty_configs:
      - service_key: '<pagerduty-key>'

  - name: 'slack'
    slack_configs:
      - api_url: '<slack-webhook>'
        channel: '#alerts'
```

### 5.2 告警规则

```yaml
# prometheus-rules.yml
groups:
  - name: novelhub-api
    rules:
      # 高错误率
      - alert: HighErrorRate
        expr: |
          (
            sum(rate(http_requests_total{status_code=~"5.."}[5m]))
            /
            sum(rate(http_requests_total[5m]))
          ) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "高错误率: {{ $value }}%"
          description: "5xx 错误率超过 5%"

      # 高延迟
      - alert: HighLatency
        expr: |
          histogram_quantile(0.95,
            sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
          ) > 0.5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "高延迟: P95 = {{ $value }}s"
          description: "请求延迟 P95 超过 500ms"

      # 数据库连接池耗尽
      - alert: DatabaseConnectionPoolExhausted
        expr: prisma_connections_open / prisma_connections_limit > 0.8
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "数据库连接池即将耗尽"
          description: "连接池使用率 {{ $value }}%"

      # NEF 进化任务失败
      - alert: NefEvolutionFailures
        expr: |
          increase(nef_evolution_tasks_total{status="failed"}[1h]) > 10
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "NEF 进化任务失败过多"
          description: "1小时内失败 {{ $value }} 次"
```

---

## 6. 部署配置

### 6.1 Docker Compose

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana:latest
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards
    ports:
      - "3000:3000"

  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    volumes:
      - ./loki-config.yml:/etc/loki/local-config.yaml

  promtail:
    image: grafana/promtail:latest
    volumes:
      - /var/log:/var/log
      - ./promtail-config.yml:/etc/promtail/config.yml
    command: -config.file=/etc/promtail/config.yml

  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "16686:16686"
      - "14268:14268"
    environment:
      - COLLECTOR_OTLP_ENABLED=true

  alertmanager:
    image: prom/alertmanager:latest
    volumes:
      - ./alertmanager.yml:/etc/alertmanager/alertmanager.yml
    ports:
      - "9093:9093"

volumes:
  prometheus_data:
  grafana_data:
```

---

## 7. 相关文档

- [技术架构文档](./技术架构文档.md)
- [Prometheus 官方文档](https://prometheus.io/docs/)
- [Grafana 官方文档](https://grafana.com/docs/)
- [OpenTelemetry 官方文档](https://opentelemetry.io/docs/)

---

**文档版本**: 1.0.0  
**最后更新**: 2026-04-15
