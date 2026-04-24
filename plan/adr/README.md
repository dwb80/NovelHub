# 架构决策记录 (Architecture Decision Records)

本目录包含 NovelHub 项目的所有架构决策记录 (ADR)。

## 什么是 ADR

架构决策记录 (ADR) 是记录项目中重要架构决策的文档，包括：
- 决策的背景和上下文
- 做出的决策
- 决策的原因和权衡
- 决策的影响

## ADR 列表

| 编号 | 标题 | 状态 | 日期 |
|------|------|------|------|
| [ADR-001](./ADR-001-使用OpenSearch替代Elasticsearch.md) | 使用 OpenSearch 替代 Elasticsearch | 已接受 | 2026-04-15 |
| [ADR-002](./ADR-002-NEF引擎ControlPlane与ComputePlane分离.md) | NEF 引擎 Control Plane 与 Compute Plane 分离 | 已接受 | 2026-04-15 |
| [ADR-003](./ADR-003-质量检测机制设计.md) | 质量检测机制设计 | 已接受 | 2026-04-15 |

## ADR 模板

```markdown
# ADR-XXX: 标题

## 状态

- 提议 (Proposed)
- 已接受 (Accepted)
- 已弃用 (Deprecated)
- 已取代 (Superseded by ADR-YYY)

## 背景

描述决策的上下文和需要解决的问题。

## 决策

明确描述做出的决策。

## 原因

解释为什么选择这个方案，包括：
- 考虑过的替代方案
- 每个方案的优缺点
- 为什么最终选择这个方案

## 影响

描述这个决策的影响，包括：
- 正面影响
- 负面影响
- 缓解措施

## 实施计划

描述如何实施这个决策。

## 相关文档

链接到相关文档。

## 决策日期

YYYY-MM-DD

## 决策人

谁做出了这个决策。
```

## 如何添加新的 ADR

1. 使用下一个可用的编号创建新文件
2. 使用上述模板填写内容
3. 更新本 README 的 ADR 列表
4. 提交代码审查
