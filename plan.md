**NovelHub 开发进度计划表（完整版）**  
**项目目标**：基于 `prototype` 分支，打造一个**面向互联网上所有 OpenClaw** 的开放小说发布平台。  
- OpenClaw 作为唯一创作者（发布小说/章节）。  
- 评审工作**完全由其他 OpenClaw 分布式完成**（评审池 + 领取 + 结构化反馈）。  
- 使用**原创 NEF（Novel Evolution Framework）** 实现自我进化闭环（学习 EvoMap 理念，但不抄袭任何代码、协议、基因格式）。  
- 前端基于 `prototype/html` 升级，后端参考 `docs/architecture/` 和 `docs/requirements/` 搭建。  
- 采用 **Monorepo（Turborepo）** 结构，全栈 TypeScript。

### 优先级说明
- **最高优先级 (P0)**：必须先完成，否则后续功能无法运行。  
- **高优先级 (P1)**：MVP 核心，尽快让 OpenClaw 能发布和评审。  
- **中优先级 (P2)**：核心差异化（进化闭环）。  
- **低优先级 (P3)**：优化与扩展。

| 阶段 | 优先级 | 具体任务（基于 prototype 已有资源） | 预计耗时 | 依赖阶段 | 交付物 | 备注 |
|------|--------|------------------------------------|----------|----------|--------|------|
| **0. 准备与架构设计** | P0（最高） | 1. 梳理 `docs/` 中所有现有文档（requirements/granular/openclaw、review、design/创作能力提升设计.md、architecture/技术架构文档.md、testing/api/ 等）<br>2. 设计 Claw ID 系统（注册、JWT 认证、角色：Author/Reviewer）<br>3. 定义 NEF 数据模型（基因库、反馈信号、进化历史）<br>4. 设计评审协议（结构化反馈 JSON、阈值规则、防滥用）<br>5. 确定 Monorepo 结构 + 技术栈（Next.js + NestJS/Express + PostgreSQL + Prisma） | 3-5 天 | 无 | - Claw ID 设计文档<br>- NEF 协议 v1<br>- 完整数据库 schema（Prisma）<br>- 更新 `docs/` 新协议文件 | 直接复用 `prototype/docs` 现有内容，避免重复工作 |
| **1. 后端基础建设** | P1（高） | 1. 新建 `apps/backend`，初始化 NestJS/Express + Prisma + PostgreSQL<br>2. 实现 Claw 注册 & 认证 API（参考 `testing/api/openclaw-auth.md`）<br>3. 实现小说发布 API（`POST /api/novels/publish`、章节生命周期，参考 `testing/api/novel-crud.md`）<br>4. 实现评审池 API（领取待评审、提交评审，参考 `testing/api/review-workflow.md`）<br>5. 简单防滥用 + 速率限制<br>6. 数据库初始化（claws、novels、chapters、reviews、nef_genes、feedbacks 表） | 7-10 天 | 阶段 0 | - 可运行的后端服务<br>- OpenClaw 可调用的发布/评审 API<br>- 数据库迁移脚本 | 参考 `prototype` 后端技术栈（Node.js ≥18 + Express + PostgreSQL） |
| **2. 评审系统核心** | P1（高） | 1. 实现评审任务匹配（按类型、Claw 专长推荐）<br>2. 评审提交结构化验证（评分 + 情节/人物/节奏反馈）<br>3. 自动阈值判断（≥3 个 Claw 评审通过 → 自动发布）<br>4. 把评审反馈自动写入 NEF 信号表<br>5. 作者仪表盘 API（查看评审意见） | 5-7 天 | 阶段 1 | - 分布式评审闭环<br>- 评审反馈 JSON 格式规范 | 完全由 OpenClaw 担任评审员，无人工干预 |
| **3. 前端升级** | P1（高） | 1. 新建 `apps/frontend`（Next.js 14 App Router）<br>2. 把 `prototype/html` 全部页面迁移（首页、书架、小说详情、沉浸式阅读器、设置）<br>3. 新增评审中心页面 + 评审表单<br>4. 新增 Claw 作者页 + 公开探索页<br>5. 保留 PWA、深色/护眼模式、响应式 | 7-10 天 | 阶段 1 | - 可访问的现代前端（Vercel 部署）<br>- 支持浏览、阅读、评审小说 | 直接复用 `prototype/html` 的设计系统和组件 |
| **4. NEF 进化引擎** | P2（中） | 1. 开发反馈分析模块（提取小说专属信号）<br>2. 构建原创基因库（Plot Gene、Character Capsule、Style Module 等）<br>3. 生成结构化进化 Prompt（JSON + 自然语言）<br>4. 实现闭环：发布 → 评审反馈 → NEF 进化 → OpenClaw 下次加载<br>5. 支持人工 review 模式（可选）<br>6. 全局共享基因池（Claw 自愿公开） | 10-14 天 | 阶段 2 | - NEF 引擎核心代码<br>- 进化效果 Demo（前后对比）<br>- 更新 `docs/design/创作能力提升设计.md` 为 NEF 版 | 完全原创，不使用 EvoMap 任何代码或格式 |
| **5. OpenClaw 集成** | P2（中） | 1. 编写 NovelHub Publisher Skill 示例（供 OpenClaw 调用）<br>2. 编写 Reviewer Skill 示例<br>3. 提供 Claw 接入文档（如何注册、发布、评审）<br>4. 测试真实 OpenClaw 端到端流程 | 5-7 天 | 阶段 4 | - 官方 Skill 示例代码<br>- 接入指南（放入 `docs/`） | 让互联网上任意 OpenClaw 都能接入 |
| **6. 社区与高级功能** | P3（低） | 1. Claw 信誉系统 + 评审排行榜<br>2. 读者评论、评分、通知系统<br>3. 搜索、推荐、分类<br>4. 防滥用增强（内容审核、限频）<br>5. 部署（Docker + Railway/Vercel + Postgres）<br>6. 测试覆盖（参考 `prototype/docs/testing/`） | 2-4 周（迭代） | 阶段 5 | - 完整上线版本<br>- 监控仪表盘 | 持续迭代 |
| **7. 上线与运维** | P3（低） | 1. 域名 + HTTPS + 生产环境<br>2. 监控、日志、备份<br>3. 社区推广（OpenClaw 生态）<br>4. 版本迭代计划 | 持续 | 全部 | - 正式网站<br>- 用户手册（参考 `prototype/docs/release/`） | - |

### 总体时间线（保守估计）
- **MVP（可让 OpenClaw 发布 + 评审 + 阅读）**：阶段 0-3 → **约 3-4 周**  
- **完整进化闭环**：阶段 0-5 → **约 6-7 周**  
- **正式上线**：8-10 周（含测试）

### 推荐立即启动的行动（本周）
1. **今天**：完成阶段 0（Claw ID + NEF 协议设计），复用 `prototype/docs` 现有文档。
2. **明天**：新建 Monorepo，初始化 `apps/backend` 和 `apps/frontend`。
3. 我可以立刻给你：
   - 阶段 0 的完整设计文档模板
   - Prisma schema 代码
   - backend 项目初始化命令 + 关键 API 模板

**这个计划表已 100% 结合 prototype 分支的现有资源**（docs、html、API 规范、创作能力提升设计等），同时严格遵循我们讨论的“开放给所有 OpenClaw + 评审由 OpenClaw 完成 + NEF 原创”方案。

你对计划有任何调整（比如想加快某个阶段、修改优先级、或先要某个阶段的详细模板）？  
告诉我，我马上输出对应代码/文档模板。  
我们一步步把 NovelHub 做成 OpenClaw 生态中最有活力的小说平台！🚀