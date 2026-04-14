# NovelHub 找回密码页面 (forgot-password.html) 最小颗粒度测试文档

## 测试概览

| 属性 | 值 |
|------|-----|
| 页面路径 | html/pages/user/forgot-password.html |
| 页面类型 | 认证页面 |
| 测试日期 | 2026-04-12 |
| 测试分析师 | Test Results Analyzer |

---

## 1. 页面结构与布局测试

### 1.1 整体布局

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| FP-LAYOUT-001 | .auth-page | 页面容器 | flex布局，min-height: 100vh | P0 |
| FP-LAYOUT-002 | .auth-sidebar | 侧边栏 | 渐变背景，flex: 1 | P1 |
| FP-LAYOUT-003 | .auth-main | 主内容区 | max-width: 520px，居中显示 | P0 |
| FP-LAYOUT-004 | 响应式(<1024px) | 侧边栏隐藏 | display: none | P0 |
| FP-LAYOUT-005 | 响应式(<1024px) | 主内容区全宽 | max-width: 100% | P0 |
| FP-LAYOUT-006 | 响应式(<480px) | 步骤指示器 | 标签字体缩小 | P1 |

---

## 2. 侧边栏组件测试

### 2.1 Logo区域

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| FP-LOGO-001 | .auth-logo | 点击跳转 | 跳转至index.html | P0 |
| FP-LOGO-002 | Logo图标 | SVG显示 | 书本图标，2.5rem大小 | P1 |
| FP-LOGO-003 | Logo文本 | 显示内容 | "NovelHub"，1.5rem，加粗 | P1 |

### 2.2 侧边栏内容

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| FP-SIDE-001 | 标题(.auth-sidebar-title) | 显示内容 | "找回密码" | P1 |
| FP-SIDE-002 | 标题样式 | CSS | 2.5rem，加粗，行高1.2 | P1 |
| FP-SIDE-003 | 描述(.auth-sidebar-desc) | 显示内容 | "通过邮箱验证，快速找回你的账户" | P1 |

### 2.3 功能特性列表

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| FP-FEAT-001 | 特性数量 | 初始显示 | 2个特性 | P0 |
| FP-FEAT-002 | 特性1 | 安全验证 | 锁图标+标题+描述 | P1 |
| FP-FEAT-003 | 特性2 | 便捷操作 | 邮件图标+标题+描述 | P1 |

---

## 3. 表单头部测试

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| FP-HEAD-001 | 返回链接 | .back-link | 显示"返回登录"，跳转login.html | P0 |
| FP-HEAD-002 | 返回图标 | SVG | 箭头图标，1rem大小 | P1 |
| FP-HEAD-003 | 表单标题 | 显示内容 | "找回密码" | P1 |
| FP-HEAD-004 | 表单副标题 | 显示内容 | "按照以下步骤重置您的密码" | P1 |

---

## 4. 步骤指示器测试

### 4.1 步骤结构

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| FP-STEP-001 | 步骤数量 | .step | 3个步骤 | P0 |
| FP-STEP-002 | 步骤1 | data-step="1" | 验证邮箱 | P0 |
| FP-STEP-003 | 步骤2 | data-step="2" | 输入验证码 | P0 |
| FP-STEP-004 | 步骤3 | data-step="3" | 重置密码 | P0 |
| FP-STEP-005 | 连接线 | .step-line | 2条连接线 | P1 |

### 4.2 步骤状态

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| FP-STEP-ST-001 | 默认状态 | 步骤1 | .active类，主色背景 | P0 |
| FP-STEP-ST-002 | 完成状态 | 步骤完成 | .completed类，绿色背景 | P0 |
| FP-STEP-ST-003 | 步骤数字 | .step-number | 2.5rem圆形，居中显示 | P1 |
| FP-STEP-ST-004 | 步骤标签 | .step-label | 0.75rem，对应步骤名称 | P1 |
| FP-STEP-ST-005 | 激活标签 | .active .step-label | 主色，加粗 | P1 |
| FP-STEP-ST-006 | 完成标签 | .completed .step-label | 绿色 | P1 |

---

## 5. 步骤1：验证邮箱测试

### 5.1 邮箱表单

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| FP-S1-FORM-001 | 表单容器 | #step1 | 默认显示 | P0 |
| FP-S1-FORM-002 | 表单ID | #emailForm | novalidate属性 | P0 |
| FP-S1-FORM-003 | 邮箱标签 | 显示内容 | "邮箱地址" | P0 |
| FP-S1-FORM-004 | 邮箱输入框 | #resetEmail | type="email"，required | P0 |
| FP-S1-FORM-005 | 占位符 | placeholder | "请输入注册时的邮箱" | P1 |
| FP-S1-FORM-006 | 自动完成 | autocomplete | "email" | P1 |
| FP-S1-FORM-007 | 提示文本 | .form-hint | "我们将向您的邮箱发送验证码" | P1 |

### 5.2 发送验证码按钮

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| FP-S1-BTN-001 | 按钮ID | #sendCodeBtn | type="submit" | P0 |
| FP-S1-BTN-002 | 默认文本 | .btn-text | "发送验证码" | P0 |
| FP-S1-BTN-003 | 加载状态 | .btn-loading | 隐藏，spinner+"发送中..." | P0 |
| FP-S1-BTN-004 | 禁用状态 | disabled | 加载时禁用 | P0 |

### 5.3 邮箱验证

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| FP-S1-VAL-001 | 空值验证 | 未输入 | 显示"请输入邮箱地址" | P0 |
| FP-S1-VAL-002 | 格式验证 | 无效格式 | 显示"请输入有效的邮箱地址" | P0 |
| FP-S1-VAL-003 | 成功发送 | 有效邮箱 | 显示Toast，进入步骤2 | P0 |
| FP-S1-VAL-004 | 模拟延迟 | setTimeout | 1000ms延迟 | P1 |

---

## 6. 步骤2：输入验证码测试

### 6.1 验证码表单

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| FP-S2-FORM-001 | 表单容器 | #step2 | 默认display: none | P0 |
| FP-S2-FORM-002 | 表单ID | #codeForm | novalidate属性 | P0 |
| FP-S2-FORM-003 | 验证码标签 | 显示内容 | "验证码" | P0 |
| FP-S2-FORM-004 | 验证码输入框 | #verifyCode | type="text"，maxlength="6" | P0 |
| FP-S2-FORM-005 | 输入模式 | inputmode | "numeric" | P1 |
| FP-S2-FORM-006 | 模式验证 | pattern | "[0-9]*" | P1 |
| FP-S2-FORM-007 | 自动完成 | autocomplete | "one-time-code" | P1 |
| FP-S2-FORM-008 | 样式 | .code-input | 居中，字间距0.5em，1.25rem | P1 |

### 6.2 重发按钮

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| FP-S2-RESEND-001 | 按钮ID | #resendCode | 初始disabled | P0 |
| FP-S2-RESEND-002 | 倒计时文本 | .resend-text | "60秒后重发" | P0 |
| FP-S2-RESEND-003 | 倒计时功能 | setInterval | 每秒减1，60秒后启用 | P0 |
| FP-S2-RESEND-004 | 启用状态 | disabled=false | 显示"重新发送" | P0 |
| FP-S2-RESEND-005 | 点击重发 | click事件 | 重新发送验证码，重置倒计时 | P0 |

### 6.3 提示信息

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| FP-S2-HINT-001 | 成功提示 | .form-hint.success | "验证码已发送到 xxx" | P0 |
| FP-S2-HINT-002 | 邮箱掩码 | #maskedEmail | 显示掩码后的邮箱 | P0 |
| FP-S2-HINT-003 | 掩码格式 | maskEmail函数 | 前2位+***+末位@域名 | P1 |

### 6.4 验证按钮

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| FP-S2-BTN-001 | 按钮ID | #verifyBtn | type="submit" | P0 |
| FP-S2-BTN-002 | 默认文本 | .btn-text | "验证" | P0 |
| FP-S2-BTN-003 | 加载状态 | .btn-loading | spinner+"验证中..." | P0 |

### 6.5 验证码验证

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| FP-S2-VAL-001 | 空值验证 | 未输入 | 显示"请输入验证码" | P0 |
| FP-S2-VAL-002 | 长度验证 | 非6位 | 显示"请输入6位验证码" | P0 |
| FP-S2-VAL-003 | 数字过滤 | input事件 | 自动过滤非数字字符 | P0 |
| FP-S2-VAL-004 | 成功验证 | 6位数字 | 显示Toast，进入步骤3 | P0 |
| FP-S2-VAL-005 | 模拟延迟 | setTimeout | 800ms延迟 | P1 |

---

## 7. 步骤3：重置密码测试

### 7.1 密码表单

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| FP-S3-FORM-001 | 表单容器 | #step3 | 默认display: none | P0 |
| FP-S3-FORM-002 | 表单ID | #passwordForm | novalidate属性 | P0 |

### 7.2 新密码输入

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| FP-S3-PWD-001 | 标签 | 显示内容 | "新密码" | P0 |
| FP-S3-PWD-002 | 输入框ID | #newPassword | type="password"，required | P0 |
| FP-S3-PWD-003 | 占位符 | placeholder | "至少8位，包含字母和数字" | P1 |
| FP-S3-PWD-004 | 最小长度 | minlength | 8 | P0 |
| FP-S3-PWD-005 | 自动完成 | autocomplete | "new-password" | P1 |
| FP-S3-PWD-006 | 密码切换 | .password-toggle | 显示/隐藏密码 | P0 |
| FP-S3-PWD-007 | 密码强度 | #passwordStrength | 4级强度条 | P1 |

### 7.3 确认新密码输入

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| FP-S3-CONFIRM-001 | 标签 | 显示内容 | "确认新密码" | P0 |
| FP-S3-CONFIRM-002 | 输入框ID | #confirmPassword | type="password"，required | P0 |
| FP-S3-CONFIRM-003 | 占位符 | placeholder | "请再次输入新密码" | P1 |
| FP-S3-CONFIRM-004 | 密码切换 | .password-toggle | 显示/隐藏密码 | P0 |
| FP-S3-CONFIRM-005 | 密码匹配 | input事件 | 实时验证一致性 | P0 |

### 7.4 重置按钮

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| FP-S3-BTN-001 | 按钮ID | #resetBtn | type="submit" | P0 |
| FP-S3-BTN-002 | 默认文本 | .btn-text | "重置密码" | P0 |
| FP-S3-BTN-003 | 加载状态 | .btn-loading | spinner+"重置中..." | P0 |

### 7.5 密码验证

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| FP-S3-VAL-001 | 空值验证 | 未输入 | 显示"请输入新密码" | P0 |
| FP-S3-VAL-002 | 长度验证 | <8位 | 显示"密码长度至少8位" | P0 |
| FP-S3-VAL-003 | 字母验证 | 无字母 | 显示"密码必须包含字母" | P0 |
| FP-S3-VAL-004 | 数字验证 | 无数字 | 显示"密码必须包含数字" | P0 |
| FP-S3-VAL-005 | 确认空值 | 未输入 | 显示"请确认新密码" | P0 |
| FP-S3-VAL-006 | 匹配验证 | 不一致 | 显示"两次输入的密码不一致" | P0 |
| FP-S3-VAL-007 | 成功重置 | 验证通过 | 显示Toast，进入成功页 | P0 |
| FP-S3-VAL-008 | 模拟延迟 | setTimeout | 1200ms延迟 | P1 |

---

## 8. 成功状态测试

### 8.1 成功消息

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| FP-SUCCESS-001 | 容器 | #successMessage | 默认display: none | P0 |
| FP-SUCCESS-002 | 成功图标 | .success-icon | 绿色圆形背景，对勾SVG | P1 |
| FP-SUCCESS-003 | 图标尺寸 | CSS | 5rem圆形，2.5rem图标 | P1 |
| FP-SUCCESS-004 | 标题 | h3 | "密码重置成功" | P0 |
| FP-SUCCESS-005 | 描述 | p | "您的密码已成功重置，请使用新密码登录" | P0 |
| FP-SUCCESS-006 | 返回按钮 | 链接 | "返回登录"，跳转login.html | P0 |

### 8.2 成功页显示

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| FP-SUCCESS-SHOW-001 | 步骤指示器 | .step-indicator | 隐藏 | P0 |
| FP-SUCCESS-SHOW-002 | 表单容器 | .step-container | 全部隐藏 | P0 |
| FP-SUCCESS-SHOW-003 | 成功消息 | #successMessage | 显示block | P0 |

---

## 9. 密码强度测试

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| FP-STRENGTH-001 | 强度计算 | checkPasswordStrength | 基于5个条件计算 | P1 |
| FP-STRENGTH-002 | 条件1 | 长度>=8 | 强度+1 | P1 |
| FP-STRENGTH-003 | 条件2 | 大小写字母 | 强度+1 | P1 |
| FP-STRENGTH-004 | 条件3 | 包含数字 | 强度+1 | P1 |
| FP-STRENGTH-005 | 条件4 | 特殊字符 | 强度+1 | P1 |
| FP-STRENGTH-006 | 条件5 | 长度>=12 | 强度+1 | P1 |
| FP-STRENGTH-007 | 弱密码 | <=2级 | 红色 | P1 |
| FP-STRENGTH-008 | 一般密码 | 3级 | 橙色 | P1 |
| FP-STRENGTH-009 | 良好密码 | 4级 | 蓝色 | P1 |
| FP-STRENGTH-010 | 强密码 | >=5级 | 绿色 | P1 |

---

## 10. Toast通知测试

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| FP-TOAST-001 | 发送成功 | 步骤1 | "验证码已发送，请查收" | P0 |
| FP-TOAST-002 | 发送失败 | 步骤1 | "发送失败，请稍后重试" | P0 |
| FP-TOAST-003 | 验证成功 | 步骤2 | "验证成功" | P0 |
| FP-TOAST-004 | 验证失败 | 步骤2 | "验证失败，请检查验证码" | P0 |
| FP-TOAST-005 | 重发成功 | 重发按钮 | "验证码已重新发送" | P0 |
| FP-TOAST-006 | 重置成功 | 步骤3 | "密码重置成功" | P0 |
| FP-TOAST-007 | 重置失败 | 步骤3 | "重置失败，请稍后重试" | P0 |
| FP-TOAST-008 | 自动消失 | 定时器 | 3秒后移除 | P1 |

---

## 11. 主题切换测试

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| FP-THEME-001 | 主题恢复 | 页面加载 | 读取novelhub-theme恢复 | P0 |
| FP-THEME-002 | 降级处理 | 模块加载失败 | 使用全局fallback | P1 |

---

## 12. 发现的问题汇总

### 12.1 功能问题

| 问题ID | 严重程度 | 问题描述 | 位置 | 建议修复 |
|--------|---------|---------|------|---------|
| FP-ISSUE-001 | Low | 密码切换按钮tabindex=-1 | .password-toggle | 考虑改为0以支持键盘 |
| FP-ISSUE-002 | Medium | 验证码接受任意6位数字 | #verifyCode | 应验证实际发送的验证码 |
| FP-ISSUE-003 | Low | 邮箱存在性检查仅console提示 | emailForm | 应给用户明确提示 |

### 12.2 无障碍问题

| 问题ID | 严重程度 | 问题描述 | 位置 | 建议修复 |
|--------|---------|---------|------|---------|
| FP-A11Y-001 | Medium | 步骤指示器缺少aria-label | .step-indicator | 添加进度指示角色 |
| FP-A11Y-002 | Low | 错误消息缺少aria-live | .form-error | 添加aria-live="polite" |
| FP-A11Y-003 | Medium | 成功页面缺少role="alert" | #successMessage | 添加alert角色 |

---

## 13. 测试执行清单

### 13.1 必须测试 (P0)

- [ ] FP-LAYOUT-001 ~ FP-LAYOUT-005: 布局响应式
- [ ] FP-HEAD-001: 返回链接
- [ ] FP-STEP-001 ~ FP-STEP-004: 步骤指示器
- [ ] FP-S1-FORM-001 ~ FP-S1-FORM-007: 步骤1表单
- [ ] FP-S1-BTN-001 ~ FP-S1-BTN-004: 发送验证码按钮
- [ ] FP-S1-VAL-001 ~ FP-S1-VAL-003: 邮箱验证
- [ ] FP-S2-FORM-001 ~ FP-S2-FORM-008: 步骤2表单
- [ ] FP-S2-RESEND-001 ~ FP-S2-RESEND-005: 重发功能
- [ ] FP-S2-BTN-001 ~ FP-S2-BTN-003: 验证按钮
- [ ] FP-S2-VAL-001 ~ FP-S2-VAL-004: 验证码验证
- [ ] FP-S3-FORM-001 ~ FP-S3-FORM-002: 步骤3表单
- [ ] FP-S3-PWD-001 ~ FP-S3-PWD-007: 新密码输入
- [ ] FP-S3-CONFIRM-001 ~ FP-S3-CONFIRM-005: 确认密码
- [ ] FP-S3-BTN-001 ~ FP-S3-BTN-003: 重置按钮
- [ ] FP-S3-VAL-001 ~ FP-S3-VAL-007: 密码验证
- [ ] FP-SUCCESS-001 ~ FP-SUCCESS-006: 成功状态
- [ ] 所有Toast通知测试

### 13.2 建议测试 (P1)

- [ ] 所有样式测试
- [ ] 密码强度指示器
- [ ] 倒计时功能
- [ ] 响应式布局细节

---

**文档生成时间**: 2026-04-12
**测试分析师**: Test Results Analyzer
