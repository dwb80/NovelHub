# NovelHub UI组件规范文档

## 概述

本文档定义了NovelHub小说阅读平台的统一UI组件规范，确保整个产品界面风格一致、用户体验统一。

---

## 1. 设计原则

### 1.1 一致性原则
- 所有页面使用统一的组件样式
- 保持视觉语言的一致性
- 交互行为统一

### 1.2 可访问性原则
- 符合WCAG 2.1 AA标准
- 支持键盘导航
- 支持屏幕阅读器

### 1.3 响应式原则
- 移动端优先设计
- 支持多种屏幕尺寸
- 适配不同设备

---

## 2. 颜色系统

### 2.1 主色调
```css
--color-primary: #6366f1;        /* 靛蓝 - 主品牌色 */
--color-primary-hover: #4f46e5;  /* 悬停状态 */
--color-primary-active: #4338ca; /* 激活状态 */
--color-primary-light: #e0e7ff;  /* 浅色背景 */
--color-primary-dark: #4338ca;   /* 深色 */
```

### 2.2 辅助色
```css
--color-secondary: #8b5cf6;        /* 紫色 */
--color-secondary-hover: #7c3aed;
```

### 2.3 语义色
```css
/* 成功 */
--color-success: #10b981;
--color-success-light: #d1fae5;
--color-success-dark: #059669;

/* 警告 */
--color-warning: #f59e0b;
--color-warning-light: #fef3c7;
--color-warning-dark: #d97706;

/* 错误 */
--color-error: #ef4444;
--color-error-light: #fee2e2;
--color-error-dark: #dc2626;

/* 信息 */
--color-info: #3b82f6;
--color-info-light: #dbeafe;
--color-info-dark: #2563eb;
```

### 2.4 文字颜色
```css
--color-text-primary: #1e293b;   /* 主要文字 */
--color-text-secondary: #64748b; /* 次要文字 */
--color-text-muted: #94a3b8;     /* 弱化文字 */
--color-text-inverse: #ffffff;   /* 反色文字 */
--color-text-link: #6366f1;      /* 链接文字 */
```

### 2.5 背景颜色
```css
--color-bg-primary: #ffffff;     /* 主背景 */
--color-bg-secondary: #f8fafc;   /* 次级背景 */
--color-bg-tertiary: #f1f5f9;    /* 第三层背景 */
--color-bg-elevated: #ffffff;    /* 提升背景 */
--color-bg-overlay: rgba(0, 0, 0, 0.5); /* 遮罩背景 */
```

### 2.6 边框颜色
```css
--color-border: #e2e8f0;         /* 默认边框 */
--color-border-hover: #cbd5e1;   /* 悬停边框 */
--color-border-focus: #6366f1;   /* 聚焦边框 */
--color-border-strong: #94a3b8;  /* 强调边框 */
```

---

## 3. 字体系统

### 3.1 字体家族
```css
--font-sans: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-serif: 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
--font-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
```

### 3.2 字体大小
```css
--text-h1: 2.5rem;      /* 40px - 页面标题 */
--text-h2: 2rem;        /* 32px - 区块标题 */
--text-h3: 1.5rem;      /* 24px - 卡片标题 */
--text-h4: 1.25rem;     /* 20px - 小标题 */
--text-body-l: 1.125rem; /* 18px - 大正文 */
--text-body: 1rem;      /* 16px - 正文 */
--text-body-s: 0.875rem; /* 14px - 小正文 */
--text-caption: 0.75rem; /* 12px - 辅助文字 */
```

### 3.3 行高
```css
--leading-none: 1;           /* 无行高 */
--leading-tight: 1.25;       /* 紧凑 */
--leading-snug: 1.375;       /* 较紧凑 */
--leading-normal: 1.5;       /* 正常 */
--leading-relaxed: 1.625;    /* 较宽松 */
--leading-loose: 2;          /* 宽松 */
```

### 3.4 字重
```css
--font-normal: 400;   /* 常规 */
--font-medium: 500;   /* 中等 */
--font-semibold: 600; /* 半粗 */
--font-bold: 700;     /* 粗体 */
```

---

## 4. 间距系统

### 4.1 基础间距（8点网格）
```css
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
```

---

## 5. 圆角系统

```css
--radius-none: 0;
--radius-sm: 0.25rem;   /* 4px */
--radius-md: 0.5rem;    /* 8px */
--radius-lg: 0.75rem;   /* 12px */
--radius-xl: 1rem;      /* 16px */
--radius-2xl: 1.5rem;   /* 24px */
--radius-full: 9999px;  /* 完全圆角 */
```

---

## 6. 阴影系统

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
--shadow-none: none;
--shadow-focus: 0 0 0 3px var(--color-primary-light);
```

---

## 7. 导航栏组件

### 7.1 HTML结构
```html
<header class="navbar" role="banner">
    <div class="navbar-inner">
        <!-- Logo -->
        <a href="index.html" class="logo" aria-label="NovelHub 首页">
            <svg class="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            <span class="logo-text">NovelHub</span>
        </a>
        
        <!-- 主导航 -->
        <nav class="nav-menu" role="navigation" aria-label="主导航">
            <a href="index.html" class="nav-link active" data-page="home">首页</a>
            <a href="pages/discover/category.html" class="nav-link" data-page="category">分类</a>
            <a href="pages/discover/ranking.html" class="nav-link" data-page="ranking">排行</a>
            <a href="pages/bookshelf/my-bookshelf.html" class="nav-link" data-page="bookshelf">书架</a>
            <a href="pages/AI智能体/learning-center.html" class="nav-link" data-page="learning">学习</a>
        </nav>
        
        <!-- 操作区 -->
        <div class="nav-actions">
            <button type="button" class="btn-icon search-btn" aria-label="搜索">
                <svg><!-- 搜索图标 --></svg>
            </button>
            <div class="user-menu">
                <button type="button" class="btn-primary">登录</button>
            </div>
        </div>
        
        <!-- 主题切换 -->
        <button type="button" class="theme-toggle" aria-label="切换主题">
            <svg class="icon-sun"><!-- 太阳图标 --></svg>
            <svg class="icon-moon"><!-- 月亮图标 --></svg>
        </button>
        
        <!-- 移动端菜单按钮 -->
        <button type="button" class="mobile-menu-toggle" aria-label="打开菜单">
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
        </button>
    </div>
</header>

<!-- 移动端导航菜单 -->
<nav class="mobile-nav-menu" aria-label="移动端导航">
    <div class="mobile-nav-overlay"></div>
    <div class="mobile-nav-content">
        <div class="mobile-nav-header">
            <span class="mobile-nav-title">菜单</span>
            <button type="button" class="mobile-nav-close" aria-label="关闭">
                <svg><!-- 关闭图标 --></svg>
            </button>
        </div>
        <div class="mobile-nav-links">
            <a href="index.html" class="mobile-nav-link active">
                <svg><!-- 图标 --></svg>首页
            </a>
            <!-- 其他链接 -->
        </div>
    </div>
</nav>
```

### 7.2 CSS类名
- `.navbar` - 导航栏容器
- `.navbar-inner` - 内部容器
- `.logo` - Logo链接
- `.nav-menu` - 导航菜单
- `.nav-link` - 导航链接
- `.nav-actions` - 操作按钮区
- `.mobile-menu-toggle` - 移动端菜单按钮
- `.mobile-nav-menu` - 移动端导航菜单

---

## 8. 页脚组件

### 8.1 HTML结构
```html
<footer class="footer" role="contentinfo">
    <div class="footer-content">
        <div class="footer-brand">
            <svg class="logo-icon"><!-- Logo图标 --></svg>
            <span>NovelHub</span>
        </div>
        <nav class="footer-links" aria-label="页脚导航">
            <a href="pages/about.html">关于我们</a>
            <a href="pages/terms.html">使用条款</a>
            <a href="pages/privacy.html">隐私政策</a>
            <a href="pages/contact.html">联系客服</a>
        </nav>
        <p class="footer-copyright">© 2026 NovelHub. AI 驱动的小说阅读平台</p>
    </div>
</footer>
```

### 8.2 CSS类名
- `.footer` - 页脚容器
- `.footer-content` - 内容容器
- `.footer-brand` - 品牌区
- `.footer-links` - 链接导航
- `.footer-copyright` - 版权信息

---

## 9. 按钮组件

### 9.1 按钮变体
```html
<!-- 主要按钮 -->
<button class="btn btn-primary">主要按钮</button>

<!-- 次要按钮 -->
<button class="btn btn-secondary">次要按钮</button>

<!-- 幽灵按钮 -->
<button class="btn btn-ghost">幽灵按钮</button>

<!-- 危险按钮 -->
<button class="btn btn-danger">危险按钮</button>

<!-- 图标按钮 -->
<button class="btn btn-icon">
    <svg><!-- 图标 --></svg>
</button>
```

### 9.2 按钮尺寸
```html
<button class="btn btn-primary btn-sm">小按钮</button>
<button class="btn btn-primary btn-md">中按钮（默认）</button>
<button class="btn btn-primary btn-lg">大按钮</button>
```

### 9.3 按钮状态
```html
<button class="btn btn-primary" disabled>禁用状态</button>
<button class="btn btn-primary btn-loading">加载中</button>
```

### 9.4 CSS类名规范
- `.btn` - 基础按钮
- `.btn-primary` - 主要按钮
- `.btn-secondary` - 次要按钮
- `.btn-ghost` - 幽灵按钮
- `.btn-danger` - 危险按钮
- `.btn-icon` - 图标按钮
- `.btn-sm` / `.btn-md` / `.btn-lg` - 尺寸
- `.btn-block` - 块级按钮
- `.btn-loading` - 加载状态

---

## 10. 表单组件

### 10.1 输入框
```html
<div class="form-group">
    <label class="form-label" for="username">用户名</label>
    <input type="text" id="username" class="form-input" placeholder="请输入用户名">
</div>

<!-- 带错误状态 -->
<div class="form-group form-group-error">
    <label class="form-label" for="email">邮箱</label>
    <input type="email" id="email" class="form-input form-input-error" placeholder="请输入邮箱">
    <span class="form-error">请输入有效的邮箱地址</span>
</div>
```

### 10.2 文本域
```html
<div class="form-group">
    <label class="form-label" for="comment">评论</label>
    <textarea id="comment" class="form-input form-textarea" rows="4"></textarea>
</div>
```

### 10.3 选择框
```html
<div class="form-group">
    <label class="form-label" for="category">分类</label>
    <select id="category" class="form-input form-select">
        <option>请选择</option>
    </select>
</div>
```

### 10.4 复选框和单选框
```html
<label class="form-check">
    <input type="checkbox" class="form-check-input">
    <span class="form-check-label">记住我</span>
</label>
```

### 10.5 开关
```html
<label class="switch">
    <input type="checkbox" class="switch-input">
    <span class="switch-slider"></span>
</label>
```

### 10.6 CSS类名规范
- `.form-group` - 表单组
- `.form-label` - 标签
- `.form-input` - 输入框
- `.form-textarea` - 文本域
- `.form-select` - 选择框
- `.form-check` - 复选/单选容器
- `.form-error` - 错误提示
- `.form-helper` - 辅助文字

---

## 11. 卡片组件

### 11.1 小说卡片
```html
<a href="detail.html" class="novel-card">
    <div class="novel-cover">
        <img src="cover.jpg" alt="小说封面">
        <span class="novel-badge badge badge-error">热门</span>
    </div>
    <div class="novel-info">
        <h3 class="novel-title">小说标题</h3>
        <p class="novel-author">作者名</p>
        <div class="novel-stats">
            <span class="novel-stat">
                <svg><!-- 图标 --></svg>1.2万
            </span>
            <span class="novel-stat">
                <svg><!-- 图标 --></svg>9.5
            </span>
        </div>
    </div>
</a>
```

### 11.2 通用卡片
```html
<div class="card">
    <div class="card-header">
        <h3 class="card-title">卡片标题</h3>
    </div>
    <div class="card-body">
        卡片内容
    </div>
    <div class="card-footer">
        <button class="btn btn-primary">操作</button>
    </div>
</div>
```

### 11.3 CSS类名规范
- `.novel-card` - 小说卡片
- `.novel-cover` - 封面容器
- `.novel-info` - 信息区
- `.novel-title` - 标题
- `.novel-author` - 作者
- `.novel-stats` - 统计信息
- `.card` - 通用卡片
- `.card-header` / `.card-body` / `.card-footer` - 卡片分区

---

## 12. 徽章组件

```html
<span class="badge badge-primary">主要</span>
<span class="badge badge-success">成功</span>
<span class="badge badge-warning">警告</span>
<span class="badge badge-error">错误</span>
<span class="badge badge-neutral">中性</span>
```

---

## 13. 提示组件

### 13.1 Toast提示
```html
<div class="toast toast-success">
    <span class="toast-icon"><!-- 图标 --></span>
    <span class="toast-message">操作成功</span>
</div>
```

### 13.2 Alert警告
```html
<div class="alert alert-info">
    <svg class="alert-icon"><!-- 图标 --></svg>
    <div class="alert-content">
        <div class="alert-title">提示</div>
        <div class="alert-description">这是一条提示信息</div>
    </div>
</div>
```

---

## 14. 主题系统

### 14.1 浅色主题（默认）
```css
.theme-light {
    --color-bg-primary: #ffffff;
    --color-bg-secondary: #f8fafc;
    --color-text-primary: #1e293b;
    --color-border: #e2e8f0;
}
```

### 14.2 深色主题
```css
.theme-dark {
    --color-bg-primary: #0f172a;
    --color-bg-secondary: #1e293b;
    --color-text-primary: #f1f5f9;
    --color-border: #334155;
}
```

### 14.3 护眼主题
```css
.theme-eye-care {
    --color-bg-primary: #f5f0e6;
    --color-bg-secondary: #ebe5d9;
    --color-text-primary: #2d2a22;
    --color-border: #d4cfc3;
}
```

### 14.4 纸张主题
```css
.theme-paper {
    --color-bg-primary: #faf8f5;
    --color-bg-secondary: #f5f2ed;
    --color-text-primary: #3d3a33;
    --color-border: #e5dfd5;
}
```

---

## 15. 响应式断点

```css
/* 超小屏幕 */
@media (max-width: 319px) { }

/* 小屏幕 - 手机 */
@media (min-width: 320px) and (max-width: 767px) { }

/* 中等屏幕 - 平板 */
@media (min-width: 768px) and (max-width: 1023px) { }

/* 大屏幕 - 小桌面 */
@media (min-width: 1024px) and (max-width: 1439px) { }

/* 超大屏幕 - 大桌面 */
@media (min-width: 1440px) { }
```

---

## 16. 动画规范

### 16.1 过渡时间
```css
--duration-fast: 150ms;   /* 快速反馈 */
--duration-base: 200ms;   /* 标准过渡 */
--duration-slow: 300ms;   /* 较慢过渡 */
--duration-slower: 500ms; /* 慢速动画 */
```

### 16.2 缓动函数
```css
--ease-default: ease-out;
--ease-in: ease-in;
--ease-out: ease-out;
--ease-in-out: ease-in-out;
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

---

## 17. Z-Index层级

```css
--z-dropdown: 100;        /* 下拉菜单 */
--z-sticky: 200;          /* 粘性定位 */
--z-fixed: 300;           /* 固定定位 */
--z-modal-backdrop: 400;  /* 模态框遮罩 */
--z-modal: 500;           /* 模态框 */
--z-popover: 600;         /* 弹出层 */
--z-tooltip: 700;         /* 提示框 */
```

---

## 18. 使用示例

### 18.1 完整页面结构
```html
<!DOCTYPE html>
<html lang="zh-CN" class="theme-light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>页面标题 - NovelHub</title>
    <link rel="stylesheet" href="../../assets/css/unified.css">
</head>
<body>
    <!-- 导航栏 -->
    <header class="navbar">...</header>
    
    <!-- 主内容 -->
    <main class="main-content">
        <div class="container">
            <!-- 页面内容 -->
        </div>
    </main>
    
    <!-- 页脚 -->
    <footer class="footer">...</footer>
    
    <!-- Toast容器 -->
    <div class="toast-container" id="toastContainer"></div>
</body>
</html>
```

---

## 19. 文件引用规范

### 19.1 CSS文件引用顺序
```html
<link rel="stylesheet" href="assets/css/unified.css">
```

### 19.2 页面级别CSS
```html
<style>
    /* 页面特有样式 */
</style>
```

---

## 20. 命名规范

### 20.1 BEM命名法
- **Block**: `.btn`, `.card`, `.form`
- **Element**: `.btn__icon`, `.card__title`, `.form__input`
- **Modifier**: `.btn--primary`, `.card--large`, `.form--inline`

### 20.2 状态类名
- `.is-active` / `.active` - 激活状态
- `.is-disabled` / `.disabled` - 禁用状态
- `.is-loading` / `.loading` - 加载状态
- `.is-error` / `.error` - 错误状态
- `.is-success` / `.success` - 成功状态

---

## 附录A: 图标使用规范

所有图标使用SVG内联方式，保持统一的尺寸规范：
- 小图标: 16x16px
- 标准图标: 20x20px
- 大图标: 24x24px

---

## 附录B: 图片使用规范

- 小说封面: 3:4 比例
- Banner图: 3:1 比例
- 头像: 1:1 比例，圆形裁剪

---

**文档版本**: 1.0  
**最后更新**: 2026-04-12  
**维护者**: Frontend Architect
