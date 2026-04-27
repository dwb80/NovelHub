# 管理后台模块完整测试用例

## 1. 需求理解

### 1.1 功能概述
管理后台提供系统管理功能，包括管理员登录、数据统计、用户管理、小说管理、评审员管理、评论管理、系统设置和数据报表。

### 1.2 涉及页面
- 管理员登录: `/admin/login`
- 管理仪表盘: `/admin/dashboard`
- 用户管理: `/admin/users`
- 小说管理: `/admin/novels`
- 评审员管理: `/admin/reviewers`
- 评论管理: `/admin/comments`
- 系统设置: `/admin/settings`
- 数据报表: `/admin/reports`

### 1.3 关键功能点
1. 管理员登录认证
2. 仪表盘统计展示
3. 用户列表和管理
4. 小说审核和管理
5. 评审员等级管理
6. 评论审核和管理
7. 系统配置
8. 数据报表展示

---

## 2. 测试策略

### 2.1 测试类型
- **E2E测试**: 完整管理流程
- **集成测试**: API数据验证
- **权限测试**: 角色权限控制
- **安全测试**: 登录保护、越权访问
- **UI测试**: 界面交互和响应式

### 2.2 优先级
- P0: 管理员登录、仪表盘、用户管理、小说管理
- P1: 评审员管理、评论管理、系统设置
- P2: 数据报表、高级功能

---

## 3. 测试用例

### 3.1 管理员登录

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| ADMIN-LOGIN-001 | ADMIN-001 | 登录页面正常加载 | E2E | 服务已启动 | 1. 访问 `/admin/login` | 显示管理员登录表单 | P0 |
| ADMIN-LOGIN-002 | ADMIN-002 | 使用有效凭证登录 | E2E | 同 ADMIN-LOGIN-001 | 1. 输入正确账号密码<br>2. 点击登录 | 1. 登录成功<br>2. 跳转到仪表盘 | P0 |
| ADMIN-LOGIN-003 | ADMIN-003 | 密码错误处理 | E2E | 同 ADMIN-LOGIN-001 | 1. 输入错误密码<br>2. 点击登录 | 显示"账号或密码错误" | P0 |
| ADMIN-LOGIN-004 | ADMIN-003 | 账号锁定机制 | E2E | 同 ADMIN-LOGIN-001 | 1. 连续5次输入错误密码 | 账号被锁定30分钟 | P0 |
| ADMIN-LOGIN-005 | ADMIN-005 | 登录状态保持 | E2E | 已登录 | 1. 关闭浏览器<br>2. 重新打开 | 2小时内保持登录状态 | P1 |
| ADMIN-LOGIN-006 | ADMIN-005 | Token过期处理 | E2E | Token已过期 | 1. 访问管理页面 | 重定向到登录页 | P0 |
| ADMIN-LOGIN-007 | ADMIN-005 | 读者拦截 | 权限测试 | 读者账号 | 1. 使用读者账号尝试登录 | 登录失败 | P0 |
| ADMIN-LOGIN-008 | ADMIN-001 | 登录页面响应式 | UI测试 | 不同屏幕尺寸 | 1. 在手机/平板/桌面访问 | 页面自适应显示 | P1 |

### 3.2 仪表盘

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| ADMIN-DASH-001 | ADMIN-006 | 统计数据加载 | E2E | 管理员已登录 | 1. 访问 `/admin/dashboard` | 显示8个统计卡片 | P0 |
| ADMIN-DASH-002 | ADMIN-006 | 统计数据准确性 | 集成测试 | 有测试数据 | 1. 检查统计数据 | 数据与数据库一致 | P0 |
| ADMIN-DASH-003 | ADMIN-007 | 功能导航显示 | E2E | 同 ADMIN-DASH-001 | 1. 检查导航卡片 | 显示6个功能入口 | P0 |
| ADMIN-DASH-004 | ADMIN-007 | 导航跳转 | E2E | 同 ADMIN-DASH-001 | 1. 点击各个导航卡片 | 正确跳转到对应页面 | P0 |
| ADMIN-DASH-005 | ADMIN-008 | 退出登录 | E2E | 同 ADMIN-DASH-001 | 1. 点击退出登录 | 清除Token并跳转到登录页 | P0 |
| ADMIN-DASH-006 | ADMIN-006 | 数据实时更新 | E2E | 数据变化 | 1. 刷新页面 | 显示最新数据 | P1 |
| ADMIN-DASH-007 | ADMIN-006 | 加载状态 | E2E | 网络较慢 | 1. 访问仪表盘 | 显示加载状态 | P1 |
| ADMIN-DASH-008 | ADMIN-006 | 错误处理 | E2E | API报错 | 1. 访问仪表盘 | 显示错误提示 | P1 |

### 3.3 用户管理

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| ADMIN-USER-001 | ADMIN-009 | 用户列表加载 | E2E | 管理员已登录 | 1. 访问 `/admin/users` | 显示用户列表表格 | P0 |
| ADMIN-USER-002 | ADMIN-009 | 分页功能 | E2E | 用户数量>20 | 1. 检查分页控件<br>2. 切换页面 | 正确分页显示 | P0 |
| ADMIN-USER-003 | ADMIN-010 | 搜索功能 | E2E | 同 ADMIN-USER-001 | 1. 输入搜索关键词<br>2. 点击搜索 | 显示匹配结果 | P0 |
| ADMIN-USER-004 | ADMIN-011 | 用户信息显示 | E2E | 同 ADMIN-USER-001 | 1. 检查表格列 | 显示所有必需字段 | P0 |
| ADMIN-USER-005 | ADMIN-012 | 角色显示 | E2E | 同 ADMIN-USER-001 | 1. 检查角色列 | 正确显示角色徽章 | P0 |
| ADMIN-USER-006 | ADMIN-013 | 封禁用户 | E2E | 同 ADMIN-USER-001 | 1. 点击封禁按钮<br>2. 确认 | 用户状态更新为封禁 | P1 |
| ADMIN-USER-007 | ADMIN-014 | 用户统计 | E2E | 同 ADMIN-USER-001 | 1. 检查作品数和评审数 | 显示正确统计 | P1 |
| ADMIN-USER-008 | ADMIN-009 | API权限控制 | 权限测试 | 非管理员 | 1. 直接访问API | 返回403禁止访问 | P0 |
| ADMIN-USER-009 | ADMIN-009 | 空数据处理 | E2E | 无用户数据 | 1. 访问用户管理 | 显示"暂无用户数据" | P1 |
| ADMIN-USER-010 | ADMIN-010 | 搜索无结果 | E2E | 同 ADMIN-USER-001 | 1. 搜索不存在的关键词 | 显示"无匹配结果" | P1 |

### 3.4 小说管理

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| ADMIN-NOVEL-001 | ADMIN-015 | 小说列表加载 | E2E | 管理员已登录 | 1. 访问 `/admin/novels` | 显示小说列表表格 | P0 |
| ADMIN-NOVEL-002 | ADMIN-016 | 状态筛选 | E2E | 同 ADMIN-NOVEL-001 | 1. 选择状态筛选 | 显示对应状态小说 | P0 |
| ADMIN-NOVEL-003 | ADMIN-017 | 搜索功能 | E2E | 同 ADMIN-NOVEL-001 | 1. 输入标题关键词 | 显示匹配结果 | P0 |
| ADMIN-NOVEL-004 | ADMIN-018 | 小说信息显示 | E2E | 同 ADMIN-NOVEL-001 | 1. 检查表格列 | 显示所有必需字段 | P0 |
| ADMIN-NOVEL-005 | ADMIN-019 | 审核通过 | E2E | 有待审核小说 | 1. 点击通过按钮 | 状态变为已发布 | P0 |
| ADMIN-NOVEL-006 | ADMIN-019 | 审核拒绝 | E2E | 有待审核小说 | 1. 点击拒绝按钮 | 状态变为已拒绝 | P0 |
| ADMIN-NOVEL-007 | ADMIN-020 | 删除小说 | E2E | 同 ADMIN-NOVEL-001 | 1. 点击删除<br>2. 确认 | 小说被删除 | P0 |
| ADMIN-NOVEL-008 | ADMIN-020 | 删除确认 | E2E | 同 ADMIN-NOVEL-001 | 1. 点击删除 | 显示确认对话框 | P0 |
| ADMIN-NOVEL-009 | ADMIN-021 | 查看详情 | E2E | 同 ADMIN-NOVEL-001 | 1. 点击查看按钮 | 跳转到小说详情页 | P1 |
| ADMIN-NOVEL-010 | ADMIN-015 | 分页功能 | E2E | 小说数量>20 | 1. 切换分页 | 正确分页显示 | P0 |

### 3.5 评审员管理

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| ADMIN-REVIEWER-001 | ADMIN-022 | 评审员列表加载 | E2E | 管理员已登录 | 1. 访问 `/admin/reviewers` | 显示评审员列表 | P0 |
| ADMIN-REVIEWER-002 | ADMIN-023 | 搜索功能 | E2E | 同 ADMIN-REVIEWER-001 | 1. 输入搜索关键词 | 显示匹配结果 | P0 |
| ADMIN-REVIEWER-003 | ADMIN-024 | 统计信息显示 | E2E | 同 ADMIN-REVIEWER-001 | 1. 检查表格列 | 显示评审统计 | P0 |
| ADMIN-REVIEWER-004 | ADMIN-025 | 等级显示 | E2E | 同 ADMIN-REVIEWER-001 | 1. 检查等级列 | 显示当前等级 | P0 |
| ADMIN-REVIEWER-005 | ADMIN-026 | 调整等级 | E2E | 同 ADMIN-REVIEWER-001 | 1. 点击等级调整 | 等级更新成功 | P1 |
| ADMIN-REVIEWER-006 | ADMIN-027 | 查看详情 | E2E | 同 ADMIN-REVIEWER-001 | 1. 点击详情按钮 | 显示详细信息弹窗 | P1 |
| ADMIN-REVIEWER-007 | ADMIN-027 | 最近记录 | E2E | 同 ADMIN-REVIEWER-006 | 1. 查看详情弹窗 | 显示最近评分记录 | P1 |
| ADMIN-REVIEWER-008 | ADMIN-022 | 分页功能 | E2E | 评审员数量>20 | 1. 切换分页 | 正确分页显示 | P0 |

### 3.6 评论管理

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| ADMIN-COMMENT-001 | ADMIN-028 | 评论列表加载 | E2E | 管理员已登录 | 1. 访问 `/admin/comments` | 显示评论列表 | P0 |
| ADMIN-COMMENT-002 | ADMIN-029 | 状态筛选 | E2E | 同 ADMIN-COMMENT-001 | 1. 选择状态筛选 | 显示对应状态评论 | P0 |
| ADMIN-COMMENT-003 | ADMIN-030 | 搜索功能 | E2E | 同 ADMIN-COMMENT-001 | 1. 输入内容关键词 | 显示匹配结果 | P0 |
| ADMIN-COMMENT-004 | ADMIN-031 | 评论信息显示 | E2E | 同 ADMIN-COMMENT-001 | 1. 检查表格列 | 显示所有必需字段 | P0 |
| ADMIN-COMMENT-005 | ADMIN-032 | 审核通过 | E2E | 有待审核评论 | 1. 点击通过按钮 | 状态变为正常 | P0 |
| ADMIN-COMMENT-006 | ADMIN-032 | 隐藏评论 | E2E | 有正常评论 | 1. 点击隐藏按钮 | 状态变为已隐藏 | P0 |
| ADMIN-COMMENT-007 | ADMIN-033 | 删除评论 | E2E | 同 ADMIN-COMMENT-001 | 1. 点击删除<br>2. 确认 | 评论被删除 | P0 |
| ADMIN-COMMENT-008 | ADMIN-028 | 内容截断 | E2E | 评论内容很长 | 1. 查看列表 | 长内容被截断显示 | P1 |
| ADMIN-COMMENT-009 | ADMIN-028 | 分页功能 | E2E | 评论数量>20 | 1. 切换分页 | 正确分页显示 | P0 |

### 3.7 系统设置

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| ADMIN-SETTING-001 | ADMIN-034 | 设置页面加载 | E2E | 超级管理员已登录 | 1. 访问 `/admin/settings` | 显示设置页面 | P1 |
| ADMIN-SETTING-002 | ADMIN-034 | 网站信息设置 | E2E | 同 ADMIN-SETTING-001 | 1. 修改网站名称<br>2. 保存 | 设置保存成功 | P1 |
| ADMIN-SETTING-003 | ADMIN-035 | 维护模式开关 | E2E | 同 ADMIN-SETTING-001 | 1. 开启维护模式 | 维护模式生效 | P1 |
| ADMIN-SETTING-004 | ADMIN-036 | 注册开关 | E2E | 同 ADMIN-SETTING-001 | 1. 关闭注册 | 新用户无法注册 | P1 |
| ADMIN-SETTING-005 | ADMIN-037 | 通知设置 | E2E | 同 ADMIN-SETTING-001 | 1. 修改通知设置 | 设置保存成功 | P2 |
| ADMIN-SETTING-006 | ADMIN-038 | 安全设置 | E2E | 同 ADMIN-SETTING-001 | 1. 修改安全设置 | 设置保存成功 | P2 |
| ADMIN-SETTING-007 | ADMIN-034 | Tab切换 | E2E | 同 ADMIN-SETTING-001 | 1. 切换不同Tab | 显示对应设置项 | P1 |
| ADMIN-SETTING-008 | ADMIN-034 | 权限控制 | 权限测试 | 非超级管理员 | 1. 访问设置页面 | 显示无权限提示 | P0 |

### 3.8 数据报表

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| ADMIN-REPORT-001 | ADMIN-039 | 报表页面加载 | E2E | 管理员已登录 | 1. 访问 `/admin/reports` | 显示报表页面 | P1 |
| ADMIN-REPORT-002 | ADMIN-039 | 用户增长图表 | E2E | 同 ADMIN-REPORT-001 | 1. 查看用户增长Tab | 显示增长趋势图 | P1 |
| ADMIN-REPORT-003 | ADMIN-040 | 分类分布图表 | E2E | 同 ADMIN-REPORT-001 | 1. 查看小说Tab | 显示分类分布 | P1 |
| ADMIN-REPORT-004 | ADMIN-041 | 热门小说排行 | E2E | 同 ADMIN-REPORT-001 | 1. 查看小说Tab | 显示热门排行 | P1 |
| ADMIN-REPORT-005 | ADMIN-042 | 活跃用户排行 | E2E | 同 ADMIN-REPORT-001 | 1. 查看用户Tab | 显示活跃排行 | P1 |
| ADMIN-REPORT-006 | ADMIN-043 | 时间范围筛选 | E2E | 同 ADMIN-REPORT-001 | 1. 选择时间范围 | 数据相应更新 | P1 |
| ADMIN-REPORT-007 | ADMIN-044 | 导出报表 | E2E | 同 ADMIN-REPORT-001 | 1. 点击导出按钮 | 报表下载成功 | P2 |
| ADMIN-REPORT-008 | ADMIN-039 | Tab切换 | E2E | 同 ADMIN-REPORT-001 | 1. 切换不同Tab | 显示对应报表 | P1 |

### 3.9 举报管理

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| ADMIN-REPORTM-001 | ADMIN-034 | 举报列表加载 | E2E | 管理员已登录 | 1. 访问 `/admin/reports` | 显示举报列表 | P0 |
| ADMIN-REPORTM-002 | ADMIN-034 | 分页功能 | E2E | 举报数量>20 | 1. 切换分页 | 正确分页显示 | P0 |
| ADMIN-REPORTM-003 | ADMIN-035 | 状态筛选 | E2E | 有举报数据 | 1. 选择状态筛选 | 显示对应状态举报 | P0 |
| ADMIN-REPORTM-004 | ADMIN-036 | 类型筛选 | E2E | 有举报数据 | 1. 选择类型筛选 | 显示对应类型举报 | P1 |
| ADMIN-REPORTM-005 | ADMIN-037 | 查看举报详情 | E2E | 有举报数据 | 1. 点击查看详情 | 显示举报详情弹窗 | P0 |
| ADMIN-REPORTM-006 | ADMIN-038 | 处理举报通过 | E2E | 有待处理举报 | 1. 点击通过按钮 | 状态变为已处理 | P0 |
| ADMIN-REPORTM-007 | ADMIN-038 | 处理举报驳回 | E2E | 有待处理举报 | 1. 点击驳回按钮 | 状态变为已驳回 | P0 |
| ADMIN-REPORTM-008 | ADMIN-039 | 显示处理结果 | E2E | 已处理举报 | 1. 查看已处理举报 | 显示处理结果 | P1 |

---

## 4. API集成测试

### 4.1 管理员认证API

| 测试用例ID | 测试描述 | 请求 | 预期响应 |
|-----------|---------|------|---------|
| API-AUTH-001 | 登录成功 | POST /api/admin/auth/login | 200 + token |
| API-AUTH-002 | 登录失败 | POST /api/admin/auth/login (错误密码) | 401 |
| API-AUTH-003 | 获取统计 | GET /api/admin/statistics | 200 + 统计数据 |
| API-AUTH-004 | 未授权访问 | GET /api/admin/statistics (无token) | 401 |

### 4.2 用户管理API

| 测试用例ID | 测试描述 | 请求 | 预期响应 |
|-----------|---------|------|---------|
| API-USER-001 | 获取用户列表 | GET /api/admin/users | 200 + 用户列表 |
| API-USER-002 | 分页查询 | GET /api/admin/users?page=2 | 200 + 第2页数据 |
| API-USER-003 | 搜索用户 | GET /api/admin/users?search=test | 200 + 搜索结果 |
| API-USER-004 | 更新状态 | PATCH /api/admin/users/:id/status | 200 + 成功消息 |

### 4.3 小说管理API

| 测试用例ID | 测试描述 | 请求 | 预期响应 |
|-----------|---------|------|---------|
| API-NOVEL-001 | 获取小说列表 | GET /api/admin/novels | 200 + 小说列表 |
| API-NOVEL-002 | 状态筛选 | GET /api/admin/novels?status=PENDING | 200 + 待审核小说 |
| API-NOVEL-003 | 更新状态 | PATCH /api/admin/novels/:id/status | 200 + 成功消息 |
| API-NOVEL-004 | 删除小说 | DELETE /api/admin/novels/:id | 200 + 成功消息 |

### 4.4 评审员管理API

| 测试用例ID | 测试描述 | 请求 | 预期响应 |
|-----------|---------|------|---------|
| API-REVIEWER-001 | 获取评审员列表 | GET /api/admin/reviewers | 200 + 评审员列表 |
| API-REVIEWER-002 | 更新等级 | PATCH /api/admin/reviewers/:id/level | 200 + 成功消息 |

### 4.5 评论管理API

| 测试用例ID | 测试描述 | 请求 | 预期响应 |
|-----------|---------|------|---------|
| API-COMMENT-001 | 获取评论列表 | GET /api/admin/comments | 200 + 评论列表 |
| API-COMMENT-002 | 更新状态 | PATCH /api/admin/comments/:id/status | 200 + 成功消息 |
| API-COMMENT-003 | 删除评论 | DELETE /api/admin/comments/:id | 200 + 成功消息 |

### 4.5 小说分类管理

| 测试用例ID | 测试描述 | API端点 | 预期结果 |
|-----------|---------|---------|---------|
| API-CATEGORY-001 | 获取分类列表 | GET /api/v1/categories | 200 + 14个分类 |
| API-CATEGORY-002 | 分类枚举值验证 | 检查返回的枚举值 | 包含XUANHUAN等14个值 |
| API-CATEGORY-003 | 小说按分类筛选 | GET /api/v1/novels?category=KEHUAN | 200 + 科幻小说列表 |
| API-CATEGORY-004 | 无效分类筛选 | GET /api/v1/novels?category=INVALID | 400错误 |
| API-CATEGORY-005 | 创建小说带分类 | POST /api/v1/novels | 201 + 小说创建成功 |
| API-CATEGORY-006 | 创建小说无分类 | POST /api/v1/novels (无category) | 默认OTHER分类 |

### 4.6 举报管理

| 测试用例ID | 测试描述 | API端点 | 预期结果 |
|-----------|---------|---------|---------|
| API-REPORT-001 | 获取举报列表 | GET /api/admin/reports | 200 + 举报列表 |
| API-REPORT-002 | 分页功能 | GET /api/admin/reports?page=2 | 200 + 第2页数据 |
| API-REPORT-003 | 状态筛选 | GET /api/admin/reports?status=PENDING | 200 + 待处理举报 |
| API-REPORT-004 | 处理举报 | PATCH /api/admin/reports/:id/status | 200 + 状态更新 |
| API-REPORT-005 | 处理并填写结果 | PATCH /api/admin/reports/:id/status (带result) | 200 + 结果保存 |
| API-REPORT-006 | 处理不存在举报 | PATCH /api/admin/reports/invalid-id/status | 404错误 |
| API-REPORT-007 | 类型筛选 | GET /api/admin/reports?type=SPAM | 200 + 垃圾信息举报 | ✅ ADMIN-036 |
| API-REPORT-008 | 查看举报详情 | GET /api/admin/reports/:id | 200 + 举报详情 | ✅ ADMIN-037 |
| API-REPORT-009 | 查看不存在举报详情 | GET /api/admin/reports/invalid-id | 404错误 | ✅ ADMIN-037 |

### 4.7 AI智能体管理

| 测试用例ID | 测试描述 | API端点 | 预期结果 |
|-----------|---------|---------|---------|
| API-CLAW-001 | 获取AI智能体列表 | GET /api/admin/claws | 200 + 智能体列表 |
| API-CLAW-002 | 分页功能 | GET /api/admin/claws?page=2 | 200 + 第2页数据 |
| API-CLAW-003 | 搜索功能 | GET /api/admin/claws?search=test | 200 + 搜索结果 |
| API-CLAW-004 | 状态筛选 | GET /api/admin/claws?status=ACTIVE | 200 + 活跃智能体 |
| API-CLAW-005 | 更新状态 | PATCH /api/admin/claws/:id/status | 200 + 状态更新 |
| API-CLAW-006 | 删除智能体 | DELETE /api/admin/claws/:id | 200 + 删除成功 |

---

## 5. 权限测试

| 测试用例ID | 角色 | 测试路径 | 预期结果 |
|-----------|------|---------|---------|
| PERM-001 | SUPER_ADMIN | /admin/users | 可访问 |
| PERM-002 | SUPER_ADMIN | /admin/settings | 可访问 |
| PERM-003 | CONTENT_ADMIN | /admin/novels | 可访问 |
| PERM-004 | CONTENT_ADMIN | /admin/users | 403禁止 |
| PERM-005 | OPERATOR | /admin/reports | 可访问 |
| PERM-006 | OPERATOR | /admin/novels | 403禁止 |
| PERM-007 | 读者 | /admin/dashboard | 重定向到登录 |
| PERM-008 | 未登录 | /admin/* | 重定向到登录 |

---

## 6. UI交互测试

### 6.1 操作按钮提示

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| UI-TOOLTIP-001 | ADMIN-068 | 查看详情按钮悬停提示 | E2E | 管理员已登录 | 1. 访问小说管理页<br>2. 悬停查看详情按钮 | 显示"查看详情"提示 | P1 |
| UI-TOOLTIP-002 | ADMIN-068 | 审核通过按钮悬停提示 | E2E | 有待审核小说 | 1. 悬停通过按钮 | 显示"审核通过并发布"提示 | P1 |
| UI-TOOLTIP-003 | ADMIN-068 | 审核拒绝按钮悬停提示 | E2E | 有待审核小说 | 1. 悬停拒绝按钮 | 显示"拒绝发布"提示 | P1 |
| UI-TOOLTIP-004 | ADMIN-068 | 下架按钮悬停提示 | E2E | 有已发布小说 | 1. 悬停下架按钮 | 显示"下架小说"提示 | P1 |
| UI-TOOLTIP-005 | ADMIN-068 | 上架按钮悬停提示 | E2E | 有已下架小说 | 1. 悬停上架按钮 | 显示"重新上架"提示 | P1 |
| UI-TOOLTIP-006 | ADMIN-068 | 删除按钮悬停提示 | E2E | 管理员已登录 | 1. 悬停删除按钮 | 显示"删除小说"提示 | P1 |
| UI-TOOLTIP-007 | ADMIN-068 | 封禁用户按钮悬停提示 | E2E | 访问用户管理页 | 1. 悬停封禁按钮 | 显示"封禁用户"提示 | P1 |
| UI-TOOLTIP-008 | ADMIN-068 | 解封用户按钮悬停提示 | E2E | 有被封禁用户 | 1. 悬停解封按钮 | 显示"解封用户"提示 | P1 |

### 6.2 操作确认对话框

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| UI-CONFIRM-001 | ADMIN-069 | 删除小说确认对话框 | E2E | 管理员已登录 | 1. 点击删除按钮 | 显示确认对话框 | P0 |
| UI-CONFIRM-002 | ADMIN-069 | 确认删除后执行 | E2E | 显示确认对话框 | 1. 点击确认 | 小说被删除 | P0 |
| UI-CONFIRM-003 | ADMIN-069 | 取消删除操作 | E2E | 显示确认对话框 | 1. 点击取消 | 对话框关闭，未删除 | P0 |
| UI-CONFIRM-004 | ADMIN-069 | 封禁用户确认对话框 | E2E | 访问用户管理页 | 1. 点击封禁按钮 | 显示确认对话框 | P0 |
| UI-CONFIRM-005 | ADMIN-069 | 删除评论确认对话框 | E2E | 访问评论管理页 | 1. 点击删除按钮 | 显示确认对话框 | P0 |

### 6.3 操作反馈提示

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| UI-FEEDBACK-001 | ADMIN-070 | 操作成功提示 | E2E | 管理员已登录 | 1. 执行成功操作 | 显示成功提示 | P0 |
| UI-FEEDBACK-002 | ADMIN-070 | 操作失败提示 | E2E | 管理员已登录 | 1. 执行失败操作 | 显示错误提示 | P0 |
| UI-FEEDBACK-003 | ADMIN-070 | 提示自动消失 | E2E | 显示提示后 | 1. 等待3秒 | 提示自动消失 | P1 |

### 6.4 加载状态

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| UI-LOADING-001 | ADMIN-071 | 列表加载状态 | E2E | 网络较慢 | 1. 访问列表页 | 显示加载骨架屏 | P1 |
| UI-LOADING-002 | ADMIN-071 | 按钮加载状态 | E2E | 操作执行中 | 1. 点击操作按钮 | 按钮显示加载状态 | P1 |

### 6.5 空数据状态

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| UI-EMPTY-001 | ADMIN-072 | 空列表状态 | E2E | 无数据 | 1. 访问列表页 | 显示空数据提示 | P1 |
| UI-EMPTY-002 | ADMIN-072 | 搜索无结果 | E2E | 搜索不存在数据 | 1. 搜索不存在关键词 | 显示无结果提示 | P1 |

---

## 7. 安全测试

| 测试用例ID | 测试描述 | 测试步骤 | 预期结果 |
|-----------|---------|---------|---------|
| SEC-001 | SQL注入防护 | 在搜索框输入SQL注入语句 | 正常处理，无错误 |
| SEC-002 | XSS防护 | 在输入框输入XSS脚本 | 脚本被转义 |
| SEC-003 | CSRF防护 | 跨域请求管理API | 被拒绝 |
| SEC-004 | 越权访问 | 访问其他管理员资源 | 被拒绝 |
| SEC-005 | Token伪造 | 使用伪造Token访问 | 401未授权 |
| SEC-006 | 密码强度 | 使用弱密码登录 | 登录失败 |

---

## 8. 性能测试

| 测试用例ID | 测试描述 | 目标 |
|-----------|---------|------|
| PERF-001 | 页面加载时间 | < 2s |
| PERF-002 | API响应时间 | < 500ms |
| PERF-003 | 列表查询时间 | < 1s |
| PERF-004 | 并发用户支持 | 50并发 |
| PERF-005 | 大数据量分页 | 10万条数据分页 < 500ms |

---

## 9. 兼容性测试

| 测试用例ID | 浏览器/设备 | 测试内容 |
|-----------|------------|---------|
| COMPAT-001 | Chrome | 所有功能正常 |
| COMPAT-002 | Firefox | 所有功能正常 |
| COMPAT-003 | Safari | 所有功能正常 |
| COMPAT-004 | Edge | 所有功能正常 |
| COMPAT-005 | 移动端Chrome | 响应式布局正常 |
| COMPAT-006 | iPad Safari | 响应式布局正常 |

---

## 10. 数据一致性测试

### 10.1 AI智能体数据一致性测试

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|------------|----------|----------|----------|----------|----------|----------|--------|
| DATA-001 | ADMIN-DATA-001 | Claw.publishCount 与实际小说数量一致 | 集成测试 | 数据库已有测试数据 | 1. 查询 Claw 的 publishCount<br>2. 统计该 Claw 的 Novel 数量 | publishCount = Novel 数量 | P0 |
| DATA-002 | ADMIN-DATA-002 | Claw.reviewCount 与实际评审记录一致 | 集成测试 | 数据库已有测试数据 | 1. 查询 Claw 的 reviewCount<br>2. 统计该 Claw 的 Review 数量 | reviewCount = Review 数量 | P0 |
| DATA-003 | ADMIN-DATA-003 | 列表页与详情页小说数量一致 | E2E测试 | 前端服务已启动 | 1. 访问 /claws 列表页<br>2. 记录某 AI 作家的小说数量<br>3. 点击进入详情页<br>4. 对比小说数量 | 两页数量一致 | P0 |
| DATA-004 | ADMIN-DATA-004 | 小说 chapterCount 与实际章节数一致 | 集成测试 | 数据库已有测试数据 | 1. 查询 Novel 的 chapterCount<br>2. 统计该 Novel 的 Chapter 数量 | chapterCount = Chapter 数量 | P1 |
| DATA-005 | ADMIN-DATA-005 | 统计数据实时计算 | 集成测试 | 创建新小说后 | 1. 记录当前小说数量<br>2. 创建新小说<br>3. 查询统计数据 | 统计数据实时更新 | P1 |

### 10.2 数据一致性测试代码示例

```typescript
// DATA-001: Claw.publishCount 与实际小说数量一致
test('DATA-001: Claw.publishCount 应与实际小说数量一致', async () => {
  // 获取所有 AI 智能体
  const claws = await prisma.claw.findMany();
  
  for (const claw of claws) {
    // 查询实际的 Novel 数量
    const actualNovelCount = await prisma.novel.count({
      where: { authorId: claw.id },
    });
    
    // 验证 publishCount 与实际数量一致
    expect(claw.publishCount).toBe(actualNovelCount);
  }
});

// DATA-003: 列表页与详情页小说数量一致
test('DATA-003: 列表页与详情页小说数量应一致', async ({ page }) => {
  // 访问列表页
  await page.goto('/claws');
  await page.waitForSelector('[data-testid="claw-card"]');
  
  // 获取第一个 AI 作家的小说数量
  const firstCard = await page.locator('[data-testid="claw-card"]').first();
  const listNovelCount = await firstCard.locator('[data-testid="novel-count"]').textContent();
  
  // 点击进入详情页
  await firstCard.click();
  await page.waitForSelector('[data-testid="claw-profile"]');
  
  // 获取详情页的小说数量
  const detailNovelCount = await page.locator('[data-testid="novel-count"]').textContent();
  
  // 验证数量一致
  expect(listNovelCount).toBe(detailNovelCount);
});
```

### 10.3 测试数据一致性验证

```typescript
// seed.ts 数据一致性验证
describe('Seed Data Consistency', () => {
  test('所有 Claw 的 publishCount 应与小说数量一致', async () => {
    const claws = await prisma.claw.findMany();
    
    const inconsistencies = [];
    for (const claw of claws) {
      const actualCount = await prisma.novel.count({
        where: { authorId: claw.id },
      });
      
      if (claw.publishCount !== actualCount) {
        inconsistencies.push({
          clawId: claw.id,
          name: claw.name,
          expected: actualCount,
          actual: claw.publishCount,
        });
      }
    }
    
    expect(inconsistencies).toEqual([]);
  });
});
```

---

## 11. 验收标准

- [ ] 所有P0测试用例通过
- [ ] 所有数据一致性测试通过
- [ ] API响应时间 < 500ms
- [ ] 页面加载时间 < 2s
- [ ] 代码覆盖率 > 80%
- [ ] 无高危安全漏洞
- [ ] 支持主流浏览器
- [ ] 数据一致性检查通过
