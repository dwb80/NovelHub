# ADR-002: NEF 引擎 Control Plane 与 Compute Plane 分离

## 状态

已接受 (Accepted)

## 背景

NEF（Novel Evolution Framework）引擎需要处理计算密集型的进化任务，包括洞察提取、进化执行等。为了保证系统的可扩展性和稳定性，需要设计合理的架构分离。

## 决策

采用 **Control Plane + Compute Plane** 分离架构：

- **Control Plane**: NestJS 实现，负责任务调度、状态管理、API 接口
- **Compute Plane**: Python/FastAPI 实现，负责实际的 AI 计算任务

## 原因

### 架构分离的优势

1. **独立扩展**
   - Control Plane 可按 API 负载扩展
   - Compute Plane 可按计算需求扩展
   - 避免资源争抢

2. **技术栈优化**
   - Control Plane 使用 TypeScript/NestJS，与主系统一致
   - Compute Plane 使用 Python，AI/ML 生态更丰富
   - 各取所长，提高开发效率

3. **故障隔离**
   - 计算任务失败不影响控制平面
   - 支持计算任务重试和熔断
   - 提高系统整体可用性

4. **资源管理**
   - Compute Plane 可配置 GPU 资源
   - Control Plane 保持轻量级
   - 优化成本效益

### 具体分工

| 职责 | Control Plane | Compute Plane |
|------|---------------|---------------|
| 任务调度 | ✅ | ❌ |
| 状态管理 | ✅ | ❌ |
| API 接口 | ✅ | ❌ |
| 洞察提取 | ❌ | ✅ |
| 进化计算 | ❌ | ✅ |
| 模型推理 | ❌ | ✅ |

## 通信机制

```
┌─────────────────┐     HTTP/gRPC      ┌─────────────────┐
│  Control Plane  │ ◄────────────────► │  Compute Plane  │
│   (NestJS)      │    任务分发/结果   │  (Python/FastAPI)│
└────────┬────────┘                    └─────────────────┘
         │
         ▼
┌─────────────────┐
│   Redis Queue   │
│   (BullMQ)      │
└─────────────────┘
```

1. **任务分发**: Control Plane 将任务放入 Redis 队列
2. **任务执行**: Compute Plane 消费队列执行任务
3. **结果回调**: Compute Plane 通过 HTTP/gRPC 返回结果
4. **状态同步**: 通过共享 Redis 状态

## 影响

### 正面影响

- 系统可扩展性大幅提升
- 技术栈选择更灵活
- 故障隔离性更好
- 资源利用率更高

### 负面影响

- 系统复杂度增加
- 需要维护两个服务
- 网络通信开销
- 调试难度增加

### 缓解措施

- 完善的日志和监控
- 统一的错误处理机制
- 本地开发环境支持
- 详细的运维文档

## 实施计划

1. **阶段 4** 实现 NEF 引擎核心
2. 实现 Control Plane 任务调度
3. 实现 Compute Plane 计算逻辑
4. 配置服务间通信
5. 实施监控和告警

## 相关文档

- [06-阶段4-NEF进化引擎.md](../06-阶段4-NEF进化引擎.md)
- [docs/architecture/nef-engine-architecture.md](../../docs/architecture/nef-engine-architecture.md)

## 决策日期

2026-04-15

## 决策人

架构评审委员会
