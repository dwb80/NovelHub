# NovelHub 用户资料页面 (profile.html) 最小颗粒度测试文档

## 测试概览

| 属性 | 值 |
|------|-----|
| 页面路径 | html/pages/user/profile.html |
| 页面类型 | 用户中心页面 |
| 测试日期 | 2026-04-12 |
| 测试分析师 | Test Results Analyzer |

---

## 1. 页面结构与布局测试

### 1.1 整体布局

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| PROF-LAYOUT-001 | .app-container | 页面容器 | 标准布局结构 | P0 |
| PROF-LAYOUT-002 | .profile-layout | 主布局 | grid布局，300px + 1fr | P0 |
| PROF-LAYOUT-003 | .profile-sidebar | 左侧边栏 | 固定宽度300px | P1 |
| PROF-LAYOUT-004 | .profile-main | 主内容区 | 自适应宽度 | P0 |
| PROF-LAYOUT-005 | 响应式(<1024px) | 布局切换 | 单列布局 | P0 |

---

## 2. 导航栏测试

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| PROF-NAV-001 | Logo | 点击跳转 | 跳转至index.html | P0 |
| PROF-NAV-002 | 导航链接 | 首页 | 链接到index.html | P0 |
| PROF-NAV-003 | 导航链接 | 分类 | 链接到category.html | P0 |
| PROF-NAV-004 | 导航链接 | 排行 | 链接到ranking.html | P0 |
| PROF-NAV-005 | 导航链接 | 书架 | 链接到my-bookshelf.html | P0 |
| PROF-NAV-006 | 导航链接 | 学习 | 链接到learning-center.html | P0 |
| PROF-NAV-007 | 搜索按钮 | 点击跳转 | 跳转至search.html | P0 |
| PROF-NAV-008 | 登录按钮 | 未登录状态 | 显示"登录"，跳转auth.html | P0 |
| PROF-NAV-009 | 主题切换 | #themeToggle | 4种主题循环切换 | P1 |

---

## 3. 左侧边栏测试

### 3.1 用户卡片

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| PROF-CARD-001 | 头像 | .profile-avatar | 100px圆形，带边框 | P0 |
| PROF-CARD-002 | 头像编辑 | .avatar-edit-btn | 悬浮编辑按钮，32px | P0 |
| PROF-CARD-003 | 头像上传 | #avatarInput | accept="image/*" | P0 |
| PROF-CARD-004 | 用户名 | #profileName | 默认"爱读书的小明" | P0 |
| PROF-CARD-005 | 用户等级 | .profile-level | "Lv.12 资深书虫" | P1 |
| PROF-CARD-006 | 个性签名 | #profileBio | 默认签名文本 | P1 |
| PROF-CARD-007 | 统计项 | .profile-stats | 3个统计（本/章/天） | P0 |
| PROF-CARD-008 | 编辑资料按钮 | 链接 | 跳转settings.html | P0 |

### 3.2 成就徽章

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| PROF-ACH-001 | 成就标题 | 显示内容 | "我的成就" | P1 |
| PROF-ACH-002 | 成就数量 | .achievement-item | 4个成就 | P1 |
| PROF-ACH-003 | 已解锁成就 | 非.locked | 3个（周常/百章/收藏家） | P1 |
| PROF-ACH-004 | 锁定成就 | .locked | 1个（千章），透明度0.4 | P1 |
| PROF-ACH-005 | 成就图标 | .achievement-icon | 1.5rem表情符号 | P1 |

---

## 4. 主内容区测试

### 4.1 最近阅读

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| PROF-RECENT-001 | 区块标题 | 显示内容 | "最近阅读" | P1 |
| PROF-RECENT-002 | 查看更多 | 链接 | 跳转reading-history.html | P0 |
| PROF-RECENT-003 | 书籍列表 | #recentBooks | 动态渲染，最多3本 | P0 |
| PROF-RECENT-004 | 书籍封面 | .recent-book-cover | 60x80px，圆角 | P1 |
| PROF-RECENT-005 | 书籍标题 | .recent-book-title | 单行显示，省略号 | P0 |
| PROF-RECENT-006 | 章节信息 | .recent-book-chapter | 显示当前章节 | P0 |
| PROF-RECENT-007 | 进度条 | .progress-bar-small | 4px高度，显示进度 | P0 |
| PROF-RECENT-008 | 进度百分比 | 文本 | 显示具体百分比 | P0 |
| PROF-RECENT-009 | 空状态 | .empty-text | "暂无阅读记录" | P0 |

### 4.2 我的书架

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| PROF-SHELF-001 | 区块标题 | 显示内容 | "我的书架" | P1 |
| PROF-SHELF-002 | 查看更多 | 链接 | 跳转my-bookshelf.html | P0 |
| PROF-SHELF-003 | 书架网格 | #bookshelfGrid | 4列网格，最多4本 | P0 |
| PROF-SHELF-004 | 书籍卡片 | .bookshelf-card | 3:4比例封面 | P0 |
| PROF-SHELF-005 | 书籍标题 | .bookshelf-card-title | 单行省略 | P0 |
| PROF-SHELF-006 | 作者名 | .bookshelf-card-author | 0.75rem，灰色 | P1 |
| PROF-SHELF-007 | 悬停效果 | hover | translateY(-4px) | P1 |
| PROF-SHELF-008 | 空状态 | .empty-text | "书架为空" | P0 |

### 4.3 阅读统计

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| PROF-STATS-001 | 区块标题 | 显示内容 | "阅读统计" | P1 |
| PROF-STATS-002 | 统计网格 | .stats-grid | 4列布局 | P1 |
| PROF-STATS-003 | 统计卡片1 | 本周章节 | "156 本周阅读章节" | P1 |
| PROF-STATS-004 | 统计卡片2 | 本周时长 | "42h 本周阅读时长" | P1 |
| PROF-STATS-005 | 统计卡片3 | 连续天数 | "12 连续阅读天数" | P1 |
| PROF-STATS-006 | 统计卡片4 | 书评数 | "28 发表书评" | P1 |
| PROF-STATS-007 | 统计图标 | .stats-icon | 1.5rem表情符号 | P1 |
| PROF-STATS-008 | 统计数值 | .stats-value | 1.25rem，加粗 | P1 |

---

## 5. 页脚测试

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| PROF-FOOT-001 | Logo | 显示 | NovelHub Logo | P1 |
| PROF-FOOT-002 | 描述 | 显示 | "AI 驱动的小说创作与阅读平台" | P1 |
| PROF-FOOT-003 | 阅读栏目 | 3个链接 | 分类/排行/搜索 | P0 |
| PROF-FOOT-004 | 我的栏目 | 3个链接 | 书架/历史/设置 | P0 |
| PROF-FOOT-005 | 关于栏目 | 3个链接 | 关于/条款/隐私 | P0 |
| PROF-FOOT-006 | 版权信息 | 显示 | "© 2026 NovelHub..." | P1 |

---

## 6. 功能测试

### 6.1 头像上传

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| PROF-FUNC-001 | 点击编辑 | onclick | 触发文件选择 | P0 |
| PROF-FUNC-002 | 文件大小限制 | uploadAvatar | 最大2MB | P0 |
| PROF-FUNC-003 | 超大文件提示 | alert | "图片大小不能超过 2MB" | P0 |
| PROF-FUNC-004 | 图片预览 | FileReader | 实时显示上传图片 | P0 |

### 6.2 数据加载

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| PROF-DATA-001 | 用户设置 | localStorage | 读取novelhub_settings | P0 |
| PROF-DATA-002 | 昵称显示 | loadUserData | 显示保存的昵称 | P0 |
| PROF-DATA-003 | 签名显示 | loadUserData | 显示保存的签名 | P0 |
| PROF-DATA-004 | 阅读历史 | MockData | 读取READING_HISTORY | P0 |
| PROF-DATA-005 | 书架数据 | MockData | 读取BOOKSHELF_DATA | P0 |

---

## 7. 发现的问题汇总

### 7.1 功能问题

| 问题ID | 严重程度 | 问题描述 | 位置 | 建议修复 |
|--------|---------|---------|------|---------|
| PROF-ISSUE-001 | Medium | 头像上传无实际保存 | uploadAvatar | 实现后端API保存 |
| PROF-ISSUE-002 | Low | 成就系统为静态展示 | .achievements-grid | 接入动态成就数据 |
| PROF-ISSUE-003 | Low | 阅读统计为静态数据 | .stats-grid | 接入真实统计数据 |
| PROF-ISSUE-004 | Low | 页脚关于链接指向index | 关于栏目 | 创建关于我们页面 |

### 7.2 无障碍问题

| 问题ID | 严重程度 | 问题描述 | 位置 | 建议修复 |
|--------|---------|---------|------|---------|
| PROF-A11Y-001 | Medium | 头像编辑按钮缺少aria-label | .avatar-edit-btn | 添加aria-label |
| PROF-A11Y-002 | Low | 成就项缺少title属性 | .achievement-item | 添加描述性title |

---

## 8. 测试执行清单

### 8.1 必须测试 (P0)

- [ ] PROF-LAYOUT-001 ~ PROF-LAYOUT-005: 布局响应式
- [ ] PROF-NAV-001 ~ PROF-NAV-008: 导航功能
- [ ] PROF-CARD-001 ~ PROF-CARD-008: 用户卡片
- [ ] PROF-RECENT-001 ~ PROF-RECENT-009: 最近阅读
- [ ] PROF-SHELF-001 ~ PROF-SHELF-008: 我的书架
- [ ] PROF-FUNC-001 ~ PROF-FUNC-004: 头像上传
- [ ] PROF-DATA-001 ~ PROF-DATA-005: 数据加载

### 8.2 建议测试 (P1)

- [ ] 所有样式测试
- [ ] 主题切换功能
- [ ] 成就徽章显示
- [ ] 阅读统计展示

---

**文档生成时间**: 2026-04-12
**测试分析师**: Test Results Analyzer
