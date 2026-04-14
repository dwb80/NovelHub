# NovelHub 小说详情页 (detail.html) 最小颗粒度测试文档

## 测试概览

| 属性 | 值 |
|------|-----|
| 页面路径 | html/pages/novel/detail.html |
| 页面类型 | 内容详情页 |
| 测试日期 | 2026-04-12 |
| 测试分析师 | Test Results Analyzer |

---

## 1. 页面加载与初始化测试

### 1.1 页面加载器

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| DETAIL-LOAD-001 | #pageLoader | 初始显示 | 旋转动画+"正在加载..." | P0 |
| DETAIL-LOAD-002 | 加载完成 | 500ms后 | 添加.hidden类，淡出隐藏 | P0 |
| DETAIL-LOAD-003 | 无障碍 | role="status" | 正确设置 | P2 |

### 1.2 数据加载

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| DETAIL-DATA-001 | URL参数 | novel ID | 从URL获取小说ID | P0 |
| DETAIL-DATA-002 | 默认小说 | 无参数时 | 使用NOVELS[0] | P0 |
| DETAIL-DATA-003 | 小说数据 | currentNovel | 查找对应小说数据 | P0 |
| DETAIL-DATA-004 | 章节数据 | currentChapters | 过滤并排序章节 | P0 |
| DETAIL-DATA-005 | 评论数据 | currentComments | 过滤小说评论 | P0 |
| DETAIL-DATA-006 | 页面标题 | document.title | "小说名 - 分类 | NovelHub" | P1 |

---

## 2. 导航栏测试

### 2.1 导航链接

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| DETAIL-NAV-001 | Logo | 点击跳转 | 跳转至index.html | P0 |
| DETAIL-NAV-002 | 首页链接 | 点击跳转 | 跳转至index.html | P0 |
| DETAIL-NAV-003 | 分类链接 | 点击跳转 | 跳转至category.html | P0 |
| DETAIL-NAV-004 | 排行链接 | 点击跳转 | 跳转至ranking.html | P0 |
| DETAIL-NAV-005 | 书架链接 | 点击跳转 | 跳转至my-bookshelf.html | P0 |
| DETAIL-NAV-006 | 学习链接 | 点击跳转 | 跳转至learning-center.html | P0 |
| DETAIL-NAV-007 | 搜索按钮 | 点击跳转 | 跳转至search.html | P0 |
| DETAIL-NAV-008 | 登录按钮 | 点击跳转 | 跳转至auth.html | P0 |

### 2.2 主题切换

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| DETAIL-THEME-001 | #themeToggle | 点击切换 | 循环切换4种主题 | P0 |
| DETAIL-THEME-002 | 图标显示 | 太阳/月亮 | 根据主题显示对应图标 | P1 |

---

## 3. 小说头部信息区 (#novelHero)

### 3.1 封面图片

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| DETAIL-COVER-001 | 封面容器 | .novel-detail-cover | 12rem x 16rem，圆角，阴影 | P1 |
| DETAIL-COVER-002 | 封面图片 | img | 懒加载，object-fit: cover | P1 |
| DETAIL-COVER-003 | alt属性 | 无障碍 | 显示小说标题 | P2 |

### 3.2 标签区域

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| DETAIL-TAG-001 | 状态标签 | 连载中 | 显示"连载中"，badge-primary | P0 |
| DETAIL-TAG-002 | 状态标签 | 已完结 | 显示"已完结"，badge-success | P0 |
| DETAIL-TAG-003 | 分类标签 | 显示内容 | 显示小说分类 | P0 |
| DETAIL-TAG-004 | 热门标签 | isHot=true | 显示"热门"，badge-error | P1 |
| DETAIL-TAG-005 | 新书标签 | isNew=true | 显示"新书"，badge-success | P1 |

### 3.3 标题与作者

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| DETAIL-TITLE-001 | 小说标题 | h1 | 2rem，衬线字体，加粗 | P0 |
| DETAIL-AUTHOR-001 | 作者标签 | .author-label | "作者"文本 | P1 |
| DETAIL-AUTHOR-002 | 作者名称 | .author-name | 主色，加粗 | P1 |
| DETAIL-AUTHOR-003 | 作者ID | .author-id | 小号灰色背景标签 | P1 |

### 3.4 统计数据

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| DETAIL-STAT-001 | 字数统计 | 显示格式 | "X万字"或具体数字 | P0 |
| DETAIL-STAT-002 | 章节数 | 显示内容 | 显示chapterCount | P0 |
| DETAIL-STAT-003 | 评分 | 显示内容 | 显示rating值 | P0 |
| DETAIL-STAT-004 | 订阅数 | 显示格式 | "X万"或具体数字 | P0 |
| DETAIL-STAT-005 | 统计标签 | .stat-label | 灰色小号文本 | P1 |

### 3.5 操作按钮

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| DETAIL-ACTION-001 | 开始阅读 | #startReadingBtn | 主按钮，书本图标 | P0 |
| DETAIL-ACTION-002 | 开始阅读点击 | click | 跳转至reading.html | P0 |
| DETAIL-ACTION-003 | 收藏按钮 | #subscribeBtn | 次要按钮，心形图标 | P0 |
| DETAIL-ACTION-004 | 收藏切换 | click | 切换收藏状态，显示Toast | P0 |
| DETAIL-ACTION-005 | 已收藏状态 | .active | 按钮变为主色背景 | P0 |
| DETAIL-ACTION-006 | 按钮文本 | #subscribeBtnText | "收藏"/"已收藏"切换 | P0 |

---

## 4. 简介区域

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| DETAIL-DESC-001 | 区域标题 | #description-heading | "简介" | P1 |
| DETAIL-DESC-002 | 简介内容 | #novelDescription | 显示小说description | P0 |
| DETAIL-DESC-003 | 文本样式 | CSS | 0.9375rem，行高1.8，次要颜色 | P1 |

---

## 5. 目录区域

### 5.1 目录头部

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| DETAIL-CAT-HEAD-001 | 标题 | #catalog-heading | "目录" | P1 |
| DETAIL-CAT-HEAD-002 | 查看全部 | #viewFullCatalog | 链接至catalog.html | P0 |

### 5.2 章节列表

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| DETAIL-CHAP-001 | 列表容器 | #chapterList | 最多显示5章 | P0 |
| DETAIL-CHAP-002 | 章节项 | .chapter-item | 边框分隔 | P1 |
| DETAIL-CHAP-003 | 章节链接 | .chapter-link | 可点击跳转 | P0 |
| DETAIL-CHAP-004 | 章节标题 | .chapter-title | 显示章节标题 | P0 |
| DETAIL-CHAP-005 | 章节状态 | .chapter-status | 已发布/待发布/VIP | P0 |
| DETAIL-CHAP-006 | 发布日期 | .chapter-date | 格式化日期 | P1 |
| DETAIL-CHAP-007 | VIP章节 | .chapter-locked | 不可点击，显示VIP标签 | P0 |
| DETAIL-CHAP-008 | 悬停效果 | hover | 颜色变为主色 | P1 |

### 5.3 目录底部

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| DETAIL-CAT-FOOT-001 | 查看完整目录 | #loadMoreChapters | 链接至catalog.html | P0 |

---

## 6. 评论区域

### 6.1 评论头部

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| DETAIL-COM-HEAD-001 | 标题 | #comments-heading | "评论"+数量 | P1 |
| DETAIL-COM-HEAD-002 | 评论数量 | #commentCount | 显示(currentComments.length) | P0 |

### 6.2 评论表单

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| DETAIL-COM-FORM-001 | 用户头像 | #userAvatar | 显示USER_DATA.avatarUrl | P0 |
| DETAIL-COM-FORM-002 | 评论输入框 | #commentInput | textarea，placeholder提示 | P0 |
| DETAIL-COM-FORM-003 | 字符计数 | #charCount | 实时显示0/2000 | P0 |
| DETAIL-COM-FORM-004 | 字数警告 | >80% | 橙色.warning类 | P1 |
| DETAIL-COM-FORM-005 | 字数错误 | >90% | 红色.error类 | P1 |
| DETAIL-COM-FORM-006 | 提交按钮 | #submitComment | "发表评论" | P0 |
| DETAIL-COM-FORM-007 | 空内容提交 | 验证 | 显示"请输入评论内容" | P0 |
| DETAIL-COM-FORM-008 | 超长提交 | >2000 | 显示"不能超过2000字" | P0 |
| DETAIL-COM-FORM-009 | 成功提交 | 验证通过 | 添加到列表顶部，清空输入 | P0 |

### 6.3 评论过滤提示

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| DETAIL-FILTER-001 | 过滤提示 | #filterNotice | 默认隐藏 | P1 |
| DETAIL-FILTER-002 | 提示内容 | 显示文本 | "部分内容已根据社区规范进行过滤" | P1 |

### 6.4 评论列表

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| DETAIL-COM-LIST-001 | 列表容器 | #commentList | 最多显示5条 | P0 |
| DETAIL-COM-LIST-002 | 空状态 | 无评论时 | 显示"暂无评论..." | P0 |
| DETAIL-COM-LIST-003 | 评论项 | .comment-item | 头像+内容布局 | P0 |
| DETAIL-COM-LIST-004 | 评论头像 | .comment-avatar | 2.5rem圆形 | P1 |
| DETAIL-COM-LIST-005 | 评论作者 | .comment-author | 加粗显示 | P1 |
| DETAIL-COM-LIST-006 | 评论时间 | .comment-time | 灰色小号 | P1 |
| DETAIL-COM-LIST-007 | 评论内容 | .comment-text | 0.9375rem，行高1.6 | P1 |
| DETAIL-COM-LIST-008 | 点赞按钮 | 心形图标 | 显示点赞数，可切换 | P0 |
| DETAIL-COM-LIST-009 | 回复按钮 | 消息图标 | 点击@用户 | P0 |
| DETAIL-COM-LIST-010 | 已点赞状态 | .active | 心形填充，主色 | P0 |

### 6.5 评论底部

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| DETAIL-COM-FOOT-001 | 加载更多 | #loadMoreComments | "加载更多评论" | P0 |
| DETAIL-COM-FOOT-002 | 点击反馈 | click | 显示"已加载全部评论" | P0 |

---

## 7. 侧边栏测试

### 7.1 标签卡片

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| DETAIL-TAG-CARD-001 | 卡片标题 | #tags-heading | "标签" | P1 |
| DETAIL-TAG-CARD-002 | 标签列表 | #tagList | 显示所有tags | P0 |
| DETAIL-TAG-CARD-003 | 标签样式 | .tag | 圆角胶囊样式 | P1 |

### 7.2 作者信息卡片

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| DETAIL-AUTH-CARD-001 | 卡片标题 | #author-heading | "作者信息" | P1 |
| DETAIL-AUTH-CARD-002 | 作者信息 | #authorInfo | 头像+名称+状态 | P0 |
| DETAIL-AUTH-CARD-003 | 作者头像 | .avatar-lg | 3rem圆形，渐变背景 | P1 |
| DETAIL-AUTH-CARD-004 | 作者名称 | .author-name | 显示作者名 | P0 |
| DETAIL-AUTH-CARD-005 | 作者状态 | .author-status | "优秀创作者"/"创作者" | P1 |
| DETAIL-AUTH-CARD-006 | 作者统计 | #authorStats | 作品数+章节数+评分 | P0 |

### 7.3 推荐卡片

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| DETAIL-REC-001 | 卡片标题 | #recommend-heading | "同类推荐" | P1 |
| DETAIL-REC-002 | 推荐列表 | #recommendList | 最多5本同类小说 | P0 |
| DETAIL-REC-003 | 推荐项 | .recommend-item | 封面+信息 | P0 |
| DETAIL-REC-004 | 推荐封面 | .recommend-cover | 3.5rem x 4.67rem | P1 |
| DETAIL-REC-005 | 推荐标题 | .recommend-title | 单行截断 | P1 |
| DETAIL-REC-006 | 推荐作者 | .recommend-author | 小号灰色 | P1 |
| DETAIL-REC-007 | 推荐评分 | .recommend-rating | 橙色显示 | P1 |
| DETAIL-REC-008 | 悬停效果 | hover | 背景色变化 | P1 |

---

## 8. 页脚测试

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| DETAIL-FOOT-001 | 品牌区域 | .footer-brand | Logo+描述 | P1 |
| DETAIL-FOOT-002 | 阅读栏目 | 链接 | 分类浏览、排行榜、完本小说 | P0 |
| DETAIL-FOOT-003 | 我的栏目 | 链接 | 我的书架、阅读历史、个人设置 | P0 |
| DETAIL-FOOT-004 | 关于栏目 | 链接 | 关于我们、使用条款、隐私政策 | P0 |
| DETAIL-FOOT-005 | 版权信息 | .footer-bottom | "© 2026 NovelHub..." | P1 |

---

## 9. 响应式布局测试

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| DETAIL-RESP-001 | 桌面端 | >768px | 双栏布局(1fr 280px) | P0 |
| DETAIL-RESP-002 | 移动端 | <=768px | 单栏布局 | P0 |
| DETAIL-RESP-003 | 移动端封面 | <=768px | 居中显示，10rem宽度 | P1 |
| DETAIL-RESP-004 | 移动端侧边栏 | <=768px | order: -1置顶 | P1 |
| DETAIL-RESP-005 | 移动端评论表单 | <=768px | 垂直布局 | P1 |
| DETAIL-RESP-006 | 折叠屏 | spanning | 双列侧边栏 | P2 |
| DETAIL-RESP-007 | 超小屏 | <319px | 缩小封面和字体 | P2 |

---

## 10. 无障碍功能测试

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| DETAIL-A11Y-001 | 跳过链接 | .skip-link | Tab聚焦时显示 | P0 |
| DETAIL-A11Y-002 | 页面区域 | role="region" | 小说信息区 | P2 |
| DETAIL-A11Y-003 | 章节列表 | role="list" | 正确设置 | P2 |
| DETAIL-A11Y-004 | 评论区域 | role="form" | 评论表单 | P2 |
| DETAIL-A11Y-005 | 字符计数 | aria-live="polite" | 实时更新 | P2 |
| DETAIL-A11Y-006 | 减少动画 | prefers-reduced-motion | 禁用动画 | P2 |
| DETAIL-A11Y-007 | 高对比度 | prefers-contrast: high | 增强边框 | P2 |

---

## 11. 发现的问题汇总

### 11.1 功能问题

| 问题ID | 严重程度 | 问题描述 | 位置 | 建议修复 |
|--------|---------|---------|------|---------|
| DETAIL-ISSUE-001 | Medium | 页脚链接部分为# | 关于栏目 | 指向实际页面 |
| DETAIL-ISSUE-002 | Low | 加载更多评论无实际功能 | #loadMoreComments | 实现分页加载 |
| DETAIL-ISSUE-003 | Low | 评论过滤提示始终隐藏 | #filterNotice | 接入内容过滤API |

### 11.2 无障碍问题

| 问题ID | 严重程度 | 问题描述 | 位置 | 建议修复 |
|--------|---------|---------|------|---------|
| DETAIL-A11Y-ISSUE-001 | Low | 章节列表项缺少aria-label | .chapter-item | 添加描述 |

---

## 12. 测试执行清单

### 12.1 必须测试 (P0)

- [ ] DETAIL-LOAD-001, DETAIL-LOAD-002: 页面加载
- [ ] DETAIL-DATA-001 ~ DETAIL-DATA-005: 数据加载
- [ ] DETAIL-NAV-001 ~ DETAIL-NAV-008: 导航链接
- [ ] DETAIL-TAG-001 ~ DETAIL-TAG-003: 标签显示
- [ ] DETAIL-ACTION-001 ~ DETAIL-ACTION-006: 操作按钮
- [ ] DETAIL-CHAP-001 ~ DETAIL-CHAP-007: 章节列表
- [ ] DETAIL-COM-FORM-001 ~ DETAIL-COM-FORM-009: 评论表单
- [ ] DETAIL-COM-LIST-001 ~ DETAIL-COM-LIST-010: 评论列表
- [ ] DETAIL-RESP-001 ~ DETAIL-RESP-005: 响应式布局

---

**文档生成时间**: 2026-04-12
**测试分析师**: Test Results Analyzer
