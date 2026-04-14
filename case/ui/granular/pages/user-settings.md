# NovelHub 个人设置页面 (settings.html) 最小颗粒度测试文档

## 测试概览

| 属性 | 值 |
|------|-----|
| 页面路径 | html/pages/user/settings.html |
| 页面类型 | 用户设置页面 |
| 测试日期 | 2026-04-12 |
| 测试分析师 | Test Results Analyzer |

---

## 1. 页面结构与布局测试

### 1.1 整体布局

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| SET-LAYOUT-001 | .settings-layout | 主布局 | grid布局，240px + 1fr | P0 |
| SET-LAYOUT-002 | .settings-sidebar | 左侧边栏 | 固定定位，sticky | P0 |
| SET-LAYOUT-003 | .settings-main | 主内容区 | 自适应宽度 | P0 |
| SET-LAYOUT-004 | 响应式(<1024px) | 布局切换 | 侧边栏水平滚动 | P0 |

---

## 2. 左侧边栏测试

### 2.1 用户卡片

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| SET-USER-001 | 头像 | .user-avatar | 80px圆形 | P1 |
| SET-USER-002 | 用户名 | .user-name | "爱读书的小明" | P1 |
| SET-USER-003 | 用户等级 | .user-level | "Lv.12 资深书虫" | P1 |

### 2.2 侧边导航

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| SET-NAV-001 | 导航项数量 | .sidebar-nav-item | 5个导航项 | P0 |
| SET-NAV-002 | 我的书架 | 链接 | 跳转bookshelf.html，badge=10 | P0 |
| SET-NAV-003 | 阅读历史 | 链接 | 跳转history.html | P0 |
| SET-NAV-004 | 收藏夹 | 链接 | 跳转favorites.html | P0 |
| SET-NAV-005 | 通知中心 | 链接 | 跳转notifications.html，badge-error=3 | P0 |
| SET-NAV-006 | 个人设置 | 链接 | .active类，当前页面 | P0 |
| SET-NAV-007 | 激活样式 | .active | 主色背景，主色文字 | P1 |

---

## 3. 设置标签页测试

### 3.1 Tab结构

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| SET-TAB-001 | Tab数量 | .settings-tab | 5个标签 | P0 |
| SET-TAB-002 | 个人资料 | data-tab="profile" | 默认active | P0 |
| SET-TAB-003 | 账户安全 | data-tab="account" | 非active | P0 |
| SET-TAB-004 | 阅读偏好 | data-tab="reading" | 非active | P0 |
| SET-TAB-005 | 通知设置 | data-tab="notifications" | 非active | P0 |
| SET-TAB-006 | 隐私设置 | data-tab="privacy" | 非active | P0 |

### 3.2 Tab交互

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| SET-TAB-CLICK-001 | 点击切换 | click事件 | 切换active类和面板 | P0 |
| SET-TAB-CLICK-002 | 面板显示 | .settings-panel | 对应面板显示 | P0 |
| SET-TAB-CLICK-003 | 水平滚动 | overflow-x | 小屏幕可滚动 | P1 |

---

## 4. 个人资料面板测试

### 4.1 头像与昵称

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| SET-PROF-001 | 头像预览 | #currentAvatar | 100px圆形 | P0 |
| SET-PROF-002 | 更换头像按钮 | .avatar-upload-btn | 显示相机图标 | P0 |
| SET-PROF-003 | 昵称输入 | #nicknameInput | value="爱读书的小明" | P0 |
| SET-PROF-004 | 签名输入 | #bioInput | value="书山有路勤为径" | P0 |

### 4.2 基本信息

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| SET-BASIC-001 | 性别选择 | #genderSelect | 选项：保密/男/女 | P0 |
| SET-BASIC-002 | 生日选择 | #birthdayInput | type="date" | P0 |
| SET-BASIC-003 | 省份选择 | #provinceSelect | 下拉选项 | P0 |
| SET-BASIC-004 | 城市选择 | #citySelect | 下拉选项 | P0 |

### 4.3 操作按钮

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| SET-ACT-001 | 保存修改 | onclick="saveProfile()" | 保存到localStorage | P0 |
| SET-ACT-002 | 重置 | onclick="resetProfile()" | 恢复默认值 | P0 |
| SET-ACT-003 | 昵称验证 | saveProfile | 空值提示"请输入昵称" | P0 |

---

## 5. 账户安全面板测试

### 5.1 登录密码

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| SET-SEC-001 | 密码项标题 | .security-title | "登录密码" | P0 |
| SET-SEC-002 | 密码项描述 | .security-desc | 建议定期更换密码 | P1 |
| SET-SEC-003 | 修改密码按钮 | onclick="changePassword()" | 显示Toast"开发中" | P0 |

### 5.2 绑定手机

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| SET-PHONE-001 | 手机状态 | .security-desc | "已绑定：138****8888" | P0 |
| SET-PHONE-002 | 更换手机按钮 | onclick="changePhone()" | 显示Toast"开发中" | P0 |

### 5.3 绑定邮箱

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| SET-EMAIL-001 | 邮箱状态 | .security-desc | "未绑定" | P0 |
| SET-EMAIL-002 | 绑定邮箱按钮 | onclick="bindEmail()" | 显示Toast"开发中" | P0 |

### 5.4 第三方账号

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| SET-3RD-001 | 微信绑定 | 状态 | "未绑定" | P0 |
| SET-3RD-002 | QQ绑定 | 状态 | "未绑定" | P0 |
| SET-3RD-003 | 绑定按钮 | onclick | 显示Toast"开发中" | P0 |

### 5.5 危险操作

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| SET-DANGER-001 | 危险区域样式 | .danger-zone | 红色边框 | P1 |
| SET-DANGER-002 | 注销账户标题 | .text-error | 红色文字 | P1 |
| SET-DANGER-003 | 注销按钮 | onclick="deleteAccount()" | 红色按钮，confirm确认 | P0 |
| SET-DANGER-004 | 确认对话框 | confirm | 显示警告信息 | P0 |

---

## 6. 阅读偏好面板测试

### 6.1 默认阅读设置

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| SET-READ-001 | 字体大小 | #fontSizeSelect | 小/中/大/特大，默认中 | P0 |
| SET-READ-002 | 行间距 | #lineHeightSelect | 紧凑/标准/宽松，默认标准 | P0 |
| SET-READ-003 | 默认主题 | #readerThemeSelect | 浅色/深色/纸张/护眼 | P0 |

### 6.2 阅读行为

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| SET-BEHAVIOR-001 | 自动翻页 | #autoPageToggle | 默认关闭 | P0 |
| SET-BEHAVIOR-002 | 点击翻页 | #tapPageToggle | 默认开启 | P0 |
| SET-BEHAVIOR-003 | 音量键翻页 | #volumePageToggle | 默认开启 | P0 |
| SET-BEHAVIOR-004 | 开关样式 | .toggle-switch | 48x24px滑块开关 | P1 |

### 6.3 保存设置

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| SET-SAVE-001 | 保存按钮 | onclick="saveReadingPrefs()" | 保存到localStorage | P0 |
| SET-SAVE-002 | 保存成功 | showToast | "阅读偏好已保存" | P0 |

---

## 7. 通知设置面板测试

### 7.1 推送通知

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| SET-NOTIF-001 | 接收推送 | #pushToggle | 默认开启 | P0 |
| SET-NOTIF-002 | 更新提醒 | #updateToggle | 默认开启 | P0 |
| SET-NOTIF-003 | 评论回复 | #commentToggle | 默认开启 | P0 |
| SET-NOTIF-004 | 系统消息 | #systemToggle | 默认开启 | P0 |

### 7.2 邮件通知

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| SET-EMAIL-NOTIF-001 | 每周报告 | #weeklyReportToggle | 默认关闭 | P0 |
| SET-EMAIL-NOTIF-002 | 营销邮件 | #marketingToggle | 默认关闭 | P0 |

---

## 8. 隐私设置面板测试

### 8.1 个人资料可见性

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| SET-PRIV-001 | 阅读历史 | #historyVisibility | 公开/仅好友/私密，默认私密 | P0 |
| SET-PRIV-002 | 书架 | #bookshelfVisibility | 公开/仅好友/私密，默认私密 | P0 |

### 8.2 数据与隐私

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| SET-DATA-001 | 个性化推荐 | #personalizationToggle | 默认开启 | P0 |
| SET-DATA-002 | 阅读数据统计 | #analyticsToggle | 默认开启 | P0 |

### 8.3 数据管理

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| SET-MGMT-001 | 导出数据 | onclick="exportData()" | 显示Toast"导出中" | P0 |
| SET-MGMT-002 | 清除缓存 | onclick="clearCache()" | confirm确认后清除 | P0 |
| SET-MGMT-003 | 清除确认 | confirm | "确定要清除缓存吗？" | P0 |

---

## 9. 发现的问题汇总

### 9.1 功能问题

| 问题ID | 严重程度 | 问题描述 | 位置 | 建议修复 |
|--------|---------|---------|------|---------|
| SET-ISSUE-001 | Medium | 头像上传功能未实现 | .avatar-upload-btn | 实现文件上传 |
| SET-ISSUE-002 | Medium | 修改密码功能未实现 | changePassword | 实现密码修改流程 |
| SET-ISSUE-003 | Medium | 手机/邮箱绑定未实现 | bind函数 | 实现绑定流程 |
| SET-ISSUE-004 | Low | 第三方绑定未实现 | bindWechat/bindQQ | 实现OAuth绑定 |
| SET-ISSUE-005 | Low | 导出数据为模拟功能 | exportData | 实现真实数据导出 |

### 9.2 无障碍问题

| 问题ID | 严重程度 | 问题描述 | 位置 | 建议修复 |
|--------|---------|---------|------|---------|
| SET-A11Y-001 | Medium | 开关缺少aria-label | .toggle-switch | 添加aria-label |
| SET-A11Y-002 | Low | 标签页缺少role="tab" | .settings-tab | 添加tab角色 |

---

## 10. 测试执行清单

### 10.1 必须测试 (P0)

- [ ] SET-LAYOUT-001 ~ SET-LAYOUT-004: 布局响应式
- [ ] SET-NAV-001 ~ SET-NAV-007: 侧边导航
- [ ] SET-TAB-001 ~ SET-TAB-006: 设置标签
- [ ] SET-TAB-CLICK-001 ~ SET-TAB-CLICK-003: Tab交互
- [ ] SET-PROF-001 ~ SET-PROF-004: 个人资料
- [ ] SET-BASIC-001 ~ SET-BASIC-004: 基本信息
- [ ] SET-ACT-001 ~ SET-ACT-003: 操作按钮
- [ ] SET-SEC-001 ~ SET-SEC-003: 账户安全
- [ ] SET-DANGER-001 ~ SET-DANGER-004: 危险操作
- [ ] SET-READ-001 ~ SET-READ-003: 阅读偏好
- [ ] SET-BEHAVIOR-001 ~ SET-BEHAVIOR-004: 阅读行为
- [ ] SET-NOTIF-001 ~ SET-NOTIF-004: 推送通知
- [ ] SET-PRIV-001 ~ SET-PRIV-002: 隐私设置
- [ ] SET-MGMT-001 ~ SET-MGMT-003: 数据管理

### 10.2 建议测试 (P1)

- [ ] 所有样式测试
- [ ] 主题切换功能
- [ ] 开关动画效果
- [ ] 响应式布局细节

---

**文档生成时间**: 2026-04-12
**测试分析师**: Test Results Analyzer
