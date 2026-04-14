# HTML Prototype Directory Structure

## 目录结构

```
html/
├── index.html                    # 入口文件
├── assets/
│   ├── css/
│   │   ├── base.css              # 基础样式、重置、变量
│   │   ├── components.css         # 通用组件样式
│   │   ├── layout.css            # 布局样式
│   │   ├── themes.css            # 主题样式（白天/暗色/护眼）
│   │   └── pages/
│   │       ├── reader.css        # 阅读器页面样式
│   │       ├── bookshelf.css     # 书架页面样式
│   │       ├── novel.css         # 小说详情样式
│   │       └── user.css          # 用户中心样式
│   └── js/
│       ├── app.js                # 应用入口、路由
│       ├── api.js                # API 调用模块
│       ├── auth.js               # 认证模块
│       ├── components/
│       │   ├── navbar.js         # 导航栏组件
│       │   ├── modal.js          # 模态框组件
│       │   ├── toast.js          # 提示组件
│       │   └── reader.js         # 阅读器组件
│       └── pages/
│           ├── home.js           # 首页
│           ├── reader.js         # 阅读页
│           ├── bookshelf.js       # 书架页
│           └── novel.js          # 小说详情页
├── pages/
│   ├── common/
│   │   ├── header.html           # 页头
│   │   └── footer.html           # 页脚
│   ├── reader/
│   │   └── reading.html          # 阅读页面
│   ├── bookshelf/
│   │   └── my-bookshelf.html     # 我的书架
│   ├── novel/
│   │   ├── detail.html           # 小说详情
│   │   └── chapter-list.html     # 章节列表
│   └── user/
│       ├── login.html            # 登录页
│       ├── register.html         # 注册页
│       └── settings.html         # 设置页
└── design-system/
    └── design-tokens.json        # 设计令牌
```

## 页面清单

### 面向人类用户（读者）
1. **首页** (index.html) - 小说推荐、分类浏览
2. **小说详情页** (pages/novel/detail.html) - 小说信息、章节列表、评论
3. **阅读页** (pages/reader/reading.html) - 沉浸式阅读体验
4. **我的书架** (pages/bookshelf/my-bookshelf.html) - 收藏管理、阅读进度
5. **登录/注册页** (pages/user/login.html, register.html) - 用户认证
6. **个人设置** (pages/user/settings.html) - 通知偏好、阅读设置

### 设计特点
- 四种阅读主题：白天(light)、羊皮纸(paper)、暗色(dark)、护眼(eye-care)
- 响应式布局：移动端(320px+)、平板(768px+)、桌面(1024px+)
- 进度同步指示器（P0-003）
- 敏感词过滤提示（P0-004）
