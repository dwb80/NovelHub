# NovelHub 登录页面 (login.html) 最小颗粒度测试文档

## 测试概览

| 属性 | 值 |
|------|-----|
| 页面路径 | html/pages/user/login.html |
| 页面类型 | 认证页面 |
| 测试日期 | 2026-04-12 |
| 测试分析师 | Test Results Analyzer |

---

## 1. 页面结构与布局测试

### 1.1 整体布局

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| LOGIN-LAYOUT-001 | .auth-page | 页面容器 | flex布局，min-height: 100vh | P0 |
| LOGIN-LAYOUT-002 | .auth-sidebar | 侧边栏 | 渐变背景，flex: 1 | P1 |
| LOGIN-LAYOUT-003 | .auth-main | 主内容区 | max-width: 520px，居中显示 | P0 |
| LOGIN-LAYOUT-004 | 响应式(<1024px) | 侧边栏隐藏 | display: none | P0 |
| LOGIN-LAYOUT-005 | 响应式(<1024px) | 主内容区全宽 | max-width: 100% | P0 |

---

## 2. 侧边栏组件测试

### 2.1 Logo区域

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| LOGIN-LOGO-001 | .auth-logo | 点击跳转 | 跳转至index.html | P0 |
| LOGIN-LOGO-002 | Logo图标 | SVG显示 | 书本图标，2.5rem大小 | P1 |
| LOGIN-LOGO-003 | Logo文本 | 显示内容 | "NovelHub"，1.5rem，加粗 | P1 |

### 2.2 侧边栏内容

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| LOGIN-SIDE-001 | 标题(.auth-sidebar-title) | 显示内容 | "开启你的阅读之旅" | P1 |
| LOGIN-SIDE-002 | 标题样式 | CSS | 2.5rem，加粗，行高1.2 | P1 |
| LOGIN-SIDE-003 | 描述(.auth-sidebar-desc) | 显示内容 | "加入我们，探索由 AI 创作的无限精彩小说世界" | P1 |
| LOGIN-SIDE-004 | 描述样式 | CSS | 1.125rem，透明度0.9 | P1 |

### 2.3 功能特性列表

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| LOGIN-FEAT-001 | 特性数量 | 初始显示 | 3个特性 | P0 |
| LOGIN-FEAT-002 | 特性1 | 个人书架 | 书签图标+标题+描述 | P1 |
| LOGIN-FEAT-003 | 特性2 | 阅读进度同步 | 时钟图标+标题+描述 | P1 |
| LOGIN-FEAT-004 | 特性3 | 评论互动 | 消息图标+标题+描述 | P1 |
| LOGIN-FEAT-005 | 图标样式 | SVG | 1.5rem大小，透明度0.9 | P2 |
| LOGIN-FEAT-006 | 标题样式 | h4 | 加粗，0.25rem下边距 | P2 |
| LOGIN-FEAT-007 | 描述样式 | p | 0.875rem，透明度0.8 | P2 |

---

## 3. 登录表单测试

### 3.1 表单头部

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| LOGIN-HEAD-001 | 表单标题 | 显示内容 | "欢迎回来" | P1 |
| LOGIN-HEAD-002 | 表单标题样式 | CSS | 1.75rem，加粗 | P1 |
| LOGIN-HEAD-003 | 表单副标题 | 显示内容 | "登录您的账户，继续精彩阅读" | P1 |
| LOGIN-HEAD-004 | 副标题样式 | CSS | 次要文本颜色 | P1 |

### 3.2 邮箱输入框

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| LOGIN-EMAIL-001 | 标签 | 显示内容 | "邮箱地址" | P0 |
| LOGIN-EMAIL-002 | 输入框类型 | type属性 | "email" | P0 |
| LOGIN-EMAIL-003 | 占位符 | placeholder | "请输入您的邮箱" | P1 |
| LOGIN-EMAIL-004 | 必填验证 | required属性 | 已设置 | P0 |
| LOGIN-EMAIL-005 | 自动完成 | autocomplete | "email" | P1 |
| LOGIN-EMAIL-006 | 错误关联 | aria-describedby | 指向emailError | P2 |
| LOGIN-EMAIL-007 | 输入验证 | blur事件 | 验证邮箱格式 | P0 |
| LOGIN-EMAIL-008 | 错误清除 | input事件 | 输入时清除错误 | P1 |
| LOGIN-EMAIL-009 | 记住的邮箱 | localStorage | 自动填充rememberedEmail | P0 |

### 3.3 密码输入框

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| LOGIN-PWD-001 | 标签行 | .form-label-row | 标签+忘记密码链接 | P0 |
| LOGIN-PWD-002 | 标签 | 显示内容 | "密码" | P0 |
| LOGIN-PWD-003 | 忘记密码链接 | 显示/跳转 | "忘记密码？"，跳转forgot-password.html | P0 |
| LOGIN-PWD-004 | 输入框类型 | type属性 | "password" | P0 |
| LOGIN-PWD-005 | 占位符 | placeholder | "请输入密码" | P1 |
| LOGIN-PWD-006 | 必填验证 | required属性 | 已设置 | P0 |
| LOGIN-PWD-007 | 自动完成 | autocomplete | "current-password" | P1 |
| LOGIN-PWD-008 | 密码切换按钮 | .password-toggle | 显示/隐藏密码 | P0 |
| LOGIN-PWD-009 | 密码切换图标 | 眼睛图标 | 睁眼/闭眼SVG切换 | P1 |
| LOGIN-PWD-010 | aria-label | 无障碍 | "显示密码"/"隐藏密码" | P2 |
| LOGIN-PWD-011 | tab索引 | tabindex | "-1"，跳过Tab导航 | P2 |

### 3.4 记住我复选框

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| LOGIN-REM-001 | 复选框 | input type="checkbox" | 默认选中(checked) | P0 |
| LOGIN-REM-002 | 自定义样式 | .checkbox-custom | 1.25rem方形，圆角 | P1 |
| LOGIN-REM-003 | 选中状态 | CSS | 主色背景+白色对勾 | P1 |
| LOGIN-REM-004 | 标签文本 | 显示内容 | "记住我（30天内自动登录）" | P0 |
| LOGIN-REM-005 | 功能实现 | 登录成功 | 保存邮箱到localStorage | P0 |

### 3.5 登录按钮

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| LOGIN-BTN-001 | 按钮类型 | type属性 | "submit" | P0 |
| LOGIN-BTN-002 | 默认文本 | .btn-text | "登录" | P0 |
| LOGIN-BTN-003 | 加载状态 | .btn-loading | 隐藏，包含spinner+"登录中..." | P0 |
| LOGIN-BTN-004 | 按钮样式 | .btn-primary.btn-full | 主色，全宽，0.875rem内边距 | P1 |
| LOGIN-BTN-005 | 加载动画 | .spinner | 1rem大小，旋转动画 | P1 |
| LOGIN-BTN-006 | 禁用状态 | disabled | 加载时禁用 | P0 |

### 3.6 社交登录

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| LOGIN-SOC-001 | 分隔线 | .auth-divider | 横线+"或使用以下方式登录"+横线 | P1 |
| LOGIN-SOC-002 | Google按钮 | #googleLogin | Google图标+"Google"文本 | P0 |
| LOGIN-SOC-003 | GitHub按钮 | #githubLogin | GitHub图标+"GitHub"文本 | P0 |
| LOGIN-SOC-004 | 按钮样式 | .btn-social | flex:1，边框，圆角 | P1 |
| LOGIN-SOC-005 | 悬停效果 | hover | 边框变主色，背景变化 | P1 |
| LOGIN-SOC-006 | 点击反馈 | click事件 | 显示"开发中"Toast提示 | P0 |
| LOGIN-SOC-007 | 响应式(<480px) | 布局 | 垂直堆叠 | P1 |

---

## 4. 表单验证测试

### 4.1 邮箱验证

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| LOGIN-VAL-E001 | 空值验证 | 未输入 | 显示"请输入邮箱地址" | P0 |
| LOGIN-VAL-E002 | 格式验证 | 无效格式 | 显示"请输入有效的邮箱地址" | P0 |
| LOGIN-VAL-E003 | 有效邮箱 | 正确格式 | 通过验证 | P0 |
| LOGIN-VAL-E004 | 错误样式 | .form-input.error | 红色边框+阴影 | P1 |
| LOGIN-VAL-E005 | 错误消息 | .form-error | 红色文本，0.8125rem | P1 |

### 4.2 密码验证

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| LOGIN-VAL-P001 | 空值验证 | 未输入 | 显示"请输入密码" | P0 |
| LOGIN-VAL-P002 | 长度验证 | <6位 | 显示"密码长度至少6位" | P0 |
| LOGIN-VAL-P003 | 有效密码 | >=6位 | 通过验证 | P0 |

### 4.3 表单提交

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| LOGIN-SUB-001 | 提交阻止 | e.preventDefault() | 阻止默认提交 | P0 |
| LOGIN-SUB-002 | 验证流程 | 提交时 | 先验证再提交 | P0 |
| LOGIN-SUB-003 | 加载状态 | 提交中 | 显示loading，禁用按钮 | P0 |
| LOGIN-SUB-004 | 模拟延迟 | setTimeout | 1000ms延迟 | P1 |
| LOGIN-SUB-005 | 成功处理 | 验证通过 | 保存用户信息，显示Toast，跳转 | P0 |
| LOGIN-SUB-006 | 失败处理 | 验证失败 | 显示错误，重置按钮 | P0 |
| LOGIN-SUB-007 | 演示账户 | demo@novelhub.com/demo123456 | 允许演示登录 | P0 |

---

## 5. 页脚链接测试

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| LOGIN-FOOT-001 | 注册链接 | 显示/跳转 | "立即注册"，跳转register.html | P0 |
| LOGIN-FOOT-002 | 链接样式 | .form-link | 主色，悬停下划线 | P1 |

---

## 6. Toast通知测试

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| LOGIN-TOAST-001 | 成功提示 | 登录成功 | "登录成功！正在跳转..." | P0 |
| LOGIN-TOAST-002 | 错误提示 | 登录失败 | "邮箱或密码错误" | P0 |
| LOGIN-TOAST-003 | 演示提示 | 演示账户 | "演示登录成功！" | P0 |
| LOGIN-TOAST-004 | 自动消失 | 定时器 | 3秒后移除 | P1 |

---

## 7. 主题切换测试

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| LOGIN-THEME-001 | 主题恢复 | 页面加载 | 读取novelhub-theme恢复 | P0 |
| LOGIN-THEME-002 | 降级处理 | 模块加载失败 | 使用全局fallback | P1 |

---

## 8. 发现的问题汇总

### 8.1 功能问题

| 问题ID | 严重程度 | 问题描述 | 位置 | 建议修复 |
|--------|---------|---------|------|---------|
| LOGIN-ISSUE-001 | Low | 社交登录功能未实现 | Google/GitHub按钮 | 实现OAuth或移除 |
| LOGIN-ISSUE-002 | Low | 密码切换按钮tabindex=-1 | .password-toggle | 考虑改为0以支持键盘 |

### 8.2 无障碍问题

| 问题ID | 严重程度 | 问题描述 | 位置 | 建议修复 |
|--------|---------|---------|------|---------|
| LOGIN-A11Y-001 | Medium | 表单缺少role="form" | #loginForm | 添加form角色 |
| LOGIN-A11Y-002 | Low | 错误消息缺少aria-live | .form-error | 添加aria-live="polite" |

---

## 9. 测试执行清单

### 9.1 必须测试 (P0)

- [ ] LOGIN-LAYOUT-001, LOGIN-LAYOUT-004: 布局响应式
- [ ] LOGIN-EMAIL-001 ~ LOGIN-EMAIL-009: 邮箱输入
- [ ] LOGIN-PWD-001 ~ LOGIN-PWD-003, LOGIN-PWD-008: 密码输入
- [ ] LOGIN-REM-001, LOGIN-REM-005: 记住我功能
- [ ] LOGIN-BTN-001 ~ LOGIN-BTN-006: 登录按钮
- [ ] LOGIN-VAL-E001 ~ LOGIN-VAL-E003: 邮箱验证
- [ ] LOGIN-VAL-P001 ~ LOGIN-VAL-P003: 密码验证
- [ ] LOGIN-SUB-001 ~ LOGIN-SUB-007: 表单提交
- [ ] LOGIN-FOOT-001: 注册链接

### 9.2 建议测试 (P1)

- [ ] 所有样式测试
- [ ] 社交登录按钮
- [ ] 加载动画
- [ ] 响应式布局

---

**文档生成时间**: 2026-04-12
**测试分析师**: Test Results Analyzer
