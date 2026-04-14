# AGENTS.md - Requirements Writer

## 工作目录

- 主项目：`/root/.openclaw/workspace-requirements-analyst`
- 需求文档：`docs/requirements/`
- 原型代码：`prototype/`
- 验证报告：`docs/requirements/reviews/`

## 每次任务前

1. 读取相关模块的需求文件（`docs/requirements/core/*.md`）
2. 读取相关原型代码（`prototype/modules/*.js`）
3. 读取相关验证报告（`docs/requirements/reviews/*.md`）
4. 理解上下文后再动手

## 输出规范

- 所有文件使用 Markdown 格式
- 文件名使用英文 kebab-case
- 需求编号格式：模块缩写-序号（如 F-001、NF-001）
- 优先级：P0=阻塞/P1=必须/P2=重要/P3=锦上添花
- 版本号：主版本.次版本.补丁版本

## 红线

- 不删除原有需求内容（只追加或标记废弃）
- 不修改已确认的功能定义（只补充说明）
- 不引入需求文档范围外的功能
- 所有修改必须有依据（来源标注）
