# NovelHub 统一认证页面 (auth.html) 最小颗粒度测试文档

## 测试概览

| 属性 | 值 |
|------|-----|
| 页面路径 | html/pages/user/auth.html |
| 页面类型 | 认证页面（Tab切换式） |
| 测试日期 | 2026-04-12 |
| 测试分析师 | Test Results Analyzer |

---

## 1. 页面结构与布局测试

### 1.1 整体布局

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| AUTH-LAYOUT-001 | .auth-page | 页面容器 | flex布局，min-height: 100vh | P0 |
| AUTH-LAYOUT-002 | .auth-sidebar | 侧边栏 | 渐变背景，flex: 1 | P1 |
| AUTH-LAYOUT-003 | .auth-main | 主内容区 | max-width: 520px | P0 |
| AUTH-LAYOUT-004 | 主题切换按钮 | #themeToggle | 固定定位，右上角 | P1 |
| AUTH-LAYOUT-005 | 响应式(<1024px) | 侧边栏隐藏 | display: none | P0 |
| AUTH-LAYOUT-006 | 响应式(<1024px) | 主内容区全宽 | max-width: 100% | P0 |

---

## 2. 主题切换按钮测试

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| AUTH-THEME-001 | 按钮位置 | .auth-theme-toggle | fixed定位，top:1rem, right:1rem | P1 |
| AUTH-THEME-002 | 按钮尺寸 | CSS | 2.5rem x 2.5rem | P1 |
| AUTH-THEME-003 | 太阳图标 | .icon-sun | 默认显示（亮色主题） | P1 |
| AUTH-THEME-004 | 月亮图标 | .icon-moon | 默认隐藏 | P1 |
| AUTH-THEME-005 | 暗黑主题 | .theme-dark | 隐藏太阳，显示月亮 | P1 |
| AUTH-THEME-006 | 护眼主题 | .theme-eye-care | 隐藏太阳，显示月亮 | P1 |
| AUTH-THEME-007 | 点击切换 | click事件 | 循环切换4种主题 | P0 |
| AUTH-THEME-008 | 本地存储 | localStorage | 保存novelhub-theme | P0 |

---

## 3. 侧边栏组件测试

### 3.1 Logo区域

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| AUTH-LOGO-001 | .auth-logo | 点击跳转 | 跳转至index.html | P0 |
| AUTH-LOGO-002 | Logo图标 | SVG显示 | 书本图标，2.5rem大小 | P1 |
| AUTH-LOGO-003 | Logo文本 | 显示内容 | "NovelHub"，1.5rem，加粗 | P1 |

### 3.2 侧边栏内容

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| AUTH-SIDE-001 | 标题(.auth-sidebar-title) | 显示内容 | "开启你的阅读之旅" | P1 |
| AUTH-SIDE-002 | 描述(.auth-sidebar-desc) | 显示内容 | "加入我们，探索由 AI 创作的无限精彩小说世界" | P1 |

### 3.3 功能特性列表

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| AUTH-FEAT-001 | 特性数量 | 初始显示 | 3个特性 | P0 |
| AUTH-FEAT-002 | 特性1 | 个人书架 | 书签图标+标题+描述 | P1 |
| AUTH-FEAT-003 | 特性2 | 阅读进度同步 | 时钟图标+标题+描述 | P1 |
| AUTH-FEAT-004 | 特性3 | 评论互动 | 消息图标+标题+描述 | P1 |

---

## 4. Tab切换组件测试

### 4.1 Tab结构

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| AUTH-TAB-001 | Tab容器 | .auth-tabs | flex布局，圆角背景 | P0 |
| AUTH-TAB-002 | 登录Tab | data-tab="login" | 默认active类 | P0 |
| AUTH-TAB-003 | 注册Tab | data-tab="register" | 默认无active类 | P0 |
| AUTH-TAB-004 | Tab样式 | .auth-tab | flex:1，圆角，无边框 | P1 |
| AUTH-TAB-005 | 激活样式 | .auth-tab.active | 主色背景，白色文字 | P0 |

### 4.2 Tab交互

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| AUTH-TAB-CLICK-001 | 点击登录Tab | click事件 | 显示登录表单，隐藏注册表单 | P0 |
| AUTH-TAB-CLICK-002 | 点击注册Tab | click事件 | 显示注册表单，隐藏登录表单 | P0 |
| AUTH-TAB-CLICK-003 | 切换动画 | CSS transition | 平滑过渡效果 | P1 |
| AUTH-TAB-CLICK-004 | 状态同步 | active类 | 点击时切换active类 | P0 |

---

## 5. 登录表单测试

### 5.1 表单头部

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| AUTH-LOGIN-HEAD-001 | 表单标题 | 显示内容 | "欢迎回来" | P1 |
| AUTH-LOGIN-HEAD-002 | 表单副标题 | 显示内容 | "登录您的账户，继续精彩阅读" | P1 |

### 5.2 邮箱输入框

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| AUTH-LOGIN-EMAIL-001 | 标签 | 显示内容 | "邮箱地址" | P0 |
| AUTH-LOGIN-EMAIL-002 | 输入框ID | #loginEmail | type="email"，required | P0 |
| AUTH-LOGIN-EMAIL-003 | 占位符 | placeholder | "请输入您的邮箱" | P1 |

### 5.3 密码输入框

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| AUTH-LOGIN-PWD-001 | 标签行 | .form-label-row | 标签+忘记密码链接 | P0 |
| AUTH-LOGIN-PWD-002 | 标签 | 显示内容 | "密码" | P0 |
| AUTH-LOGIN-PWD-003 | 忘记密码链接 | 链接 | "忘记密码？"，href="#" | P0 |
| AUTH-LOGIN-PWD-004 | 输入框ID | #loginPassword | type="password"，required | P0 |
| AUTH-LOGIN-PWD-005 | 占位符 | placeholder | "请输入密码" | P1 |
| AUTH-LOGIN-PWD-006 | 密码切换 | .password-toggle | 显示/隐藏密码 | P0 |

### 5.4 记住我复选框

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| AUTH-LOGIN-REM-001 | 复选框 | input type="checkbox" | 默认checked | P0 |
| AUTH-LOGIN-REM-002 | 标签文本 | 显示内容 | "记住我" | P0 |

### 5.5 登录按钮

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| AUTH-LOGIN-BTN-001 | 按钮类型 | type属性 | "submit" | P0 |
| AUTH-LOGIN-BTN-002 | 按钮文本 | 显示内容 | "登录" | P0 |
| AUTH-LOGIN-BTN-003 | 按钮样式 | .btn-primary.btn-full | 主色，全宽 | P1 |

### 5.6 社交登录

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| AUTH-LOGIN-SOC-001 | 分隔线 | .auth-divider | "或使用以下方式登录" | P1 |
| AUTH-LOGIN-SOC-002 | 社交按钮数量 | .btn-social | 3个按钮（X, GitHub, Google） | P0 |
| AUTH-LOGIN-SOC-003 | X按钮 | 第一个按钮 | X图标 | P0 |
| AUTH-LOGIN-SOC-004 | GitHub按钮 | 第二个按钮 | GitHub图标 | P0 |
| AUTH-LOGIN-SOC-005 | Google按钮 | 第三个按钮 | Google彩色图标 | P0 |

---

## 6. 注册表单测试

### 6.1 表单头部

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| AUTH-REG-HEAD-001 | 表单标题 | 显示内容 | "创建账户" | P1 |
| AUTH-REG-HEAD-002 | 表单副标题 | 显示内容 | "加入 NovelHub，开启无限阅读之旅" | P1 |
| AUTH-REG-HEAD-003 | 初始状态 | style属性 | display: none | P0 |

### 6.2 用户名输入框

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| AUTH-REG-NAME-001 | 标签 | 显示内容 | "用户名" | P0 |
| AUTH-REG-NAME-002 | 输入框ID | #registerName | type="text"，required | P0 |
| AUTH-REG-NAME-003 | 占位符 | placeholder | "请输入用户名" | P1 |

### 6.3 邮箱输入框

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| AUTH-REG-EMAIL-001 | 标签 | 显示内容 | "邮箱地址" | P0 |
| AUTH-REG-EMAIL-002 | 输入框ID | #registerEmail | type="email"，required | P0 |
| AUTH-REG-EMAIL-003 | 占位符 | placeholder | "请输入您的邮箱" | P1 |

### 6.4 密码输入框

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| AUTH-REG-PWD-001 | 标签 | 显示内容 | "设置密码" | P0 |
| AUTH-REG-PWD-002 | 输入框ID | #registerPassword | type="password"，required | P0 |
| AUTH-REG-PWD-003 | 占位符 | placeholder | "至少8位，包含字母和数字" | P1 |
| AUTH-REG-PWD-004 | 密码切换 | .password-toggle | 显示/隐藏密码 | P0 |

### 6.5 确认密码输入框

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| AUTH-REG-CONFIRM-001 | 标签 | 显示内容 | "确认密码" | P0 |
| AUTH-REG-CONFIRM-002 | 输入框ID | #registerPasswordConfirm | type="password"，required | P0 |
| AUTH-REG-CONFIRM-003 | 占位符 | placeholder | "请再次输入密码" | P1 |

### 6.6 服务条款复选框

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| AUTH-REG-TERMS-001 | 复选框 | input type="checkbox" | required属性 | P0 |
| AUTH-REG-TERMS-002 | 标签文本 | 显示内容 | "我已阅读并同意 服务条款 和 隐私政策" | P0 |
| AUTH-REG-TERMS-003 | 服务条款链接 | 链接 | href="#" | P0 |
| AUTH-REG-TERMS-004 | 隐私政策链接 | 链接 | href="#" | P0 |

### 6.7 注册按钮

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| AUTH-REG-BTN-001 | 按钮类型 | type属性 | "submit" | P0 |
| AUTH-REG-BTN-002 | 按钮文本 | 显示内容 | "注册" | P0 |

### 6.8 社交注册

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| AUTH-REG-SOC-001 | 分隔线 | .auth-divider | "或使用以下方式注册" | P1 |
| AUTH-REG-SOC-002 | 社交按钮 | .btn-social | 3个按钮（X, GitHub, Google） | P0 |

---

## 7. 交互功能测试

### 7.1 密码显示切换

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| AUTH-PWD-TOGGLE-001 | 点击切换 | click事件 | password <-> text | P0 |
| AUTH-PWD-TOGGLE-002 | 图标切换 | SVG显示 | 睁眼/闭眼图标切换 | P1 |
| AUTH-PWD-TOGGLE-003 | 所有密码框 | .password-toggle | 每个密码输入都有切换按钮 | P0 |

---

## 8. 发现的问题汇总

### 8.1 功能问题

| 问题ID | 严重程度 | 问题描述 | 位置 | 建议修复 |
|--------|---------|---------|------|---------|
| AUTH-ISSUE-001 | Medium | 忘记密码链接指向# | .form-link | 应链接到forgot-password.html |
| AUTH-ISSUE-002 | Medium | 服务条款和隐私政策链接指向# | 注册表单 | 应实现相应页面或弹窗 |
| AUTH-ISSUE-003 | Low | 社交登录/注册功能未实现 | .btn-social | 实现OAuth或添加提示 |
| AUTH-ISSUE-004 | Low | 表单缺少验证逻辑 | loginForm/registerForm | 添加完整的表单验证 |
| AUTH-ISSUE-005 | Low | 表单提交无实际功能 | submit事件 | 实现登录/注册API调用 |

### 8.2 无障碍问题

| 问题ID | 严重程度 | 问题描述 | 位置 | 建议修复 |
|--------|---------|---------|------|---------|
| AUTH-A11Y-001 | Medium | Tab按钮缺少role="tab" | .auth-tab | 添加tab角色 |
| AUTH-A11Y-002 | Medium | Tab面板缺少role="tabpanel" | .auth-form | 添加tabpanel角色 |
| AUTH-A11Y-003 | Low | 密码切换按钮缺少aria-label | .password-toggle | 添加aria-label |
| AUTH-A11Y-004 | Low | 社交按钮缺少aria-label | .btn-social | 添加aria-label |

---

## 9. 测试执行清单

### 9.1 必须测试 (P0)

- [ ] AUTH-LAYOUT-001 ~ AUTH-LAYOUT-006: 布局响应式
- [ ] AUTH-TAB-001 ~ AUTH-TAB-005: Tab结构
- [ ] AUTH-TAB-CLICK-001 ~ AUTH-TAB-CLICK-004: Tab交互
- [ ] AUTH-LOGIN-EMAIL-001 ~ AUTH-LOGIN-EMAIL-003: 登录邮箱
- [ ] AUTH-LOGIN-PWD-001 ~ AUTH-LOGIN-PWD-006: 登录密码
- [ ] AUTH-LOGIN-REM-001 ~ AUTH-LOGIN-REM-002: 记住我
- [ ] AUTH-LOGIN-BTN-001 ~ AUTH-LOGIN-BTN-003: 登录按钮
- [ ] AUTH-REG-HEAD-003: 注册表单初始隐藏
- [ ] AUTH-REG-NAME-001 ~ AUTH-REG-NAME-003: 注册用户名
- [ ] AUTH-REG-EMAIL-001 ~ AUTH-REG-EMAIL-003: 注册邮箱
- [ ] AUTH-REG-PWD-001 ~ AUTH-REG-PWD-004: 注册密码
- [ ] AUTH-REG-CONFIRM-001 ~ AUTH-REG-CONFIRM-003: 确认密码
- [ ] AUTH-REG-TERMS-001 ~ AUTH-REG-TERMS-004: 服务条款
- [ ] AUTH-REG-BTN-001 ~ AUTH-REG-BTN-002: 注册按钮
- [ ] AUTH-PWD-TOGGLE-001 ~ AUTH-PWD-TOGGLE-003: 密码切换

### 9.2 建议测试 (P1)

- [ ] 所有样式测试
- [ ] 主题切换功能
- [ ] 响应式布局细节
- [ ] 社交按钮显示

---

**文档生成时间**: 2026-04-12
**测试分析师**: Test Results Analyzer
