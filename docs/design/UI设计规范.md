# NovelHub UI 设计规范

## 概述

本文档定义了 NovelHub 小说阅读平台的 UI 设计规范。

---

## 1. 设计原则

### 1.1 清晰性
- 信息层级清晰
- 视觉引导明确
- 减少认知负担

### 1.2 一致性
- 组件样式统一
- 交互模式统一
- 视觉语言统一

### 1.3 响应性
- 适配多种设备
- 流畅的过渡动画
- 即时的反馈响应

---

## 2. 颜色系统

### 2.1 品牌色
```css
/* 主品牌色 */
--brand-primary: #6366f1;
--brand-primary-50: #eef2ff;
--brand-primary-100: #e0e7ff;
--brand-primary-200: #c7d2fe;
--brand-primary-300: #a5b4fc;
--brand-primary-400: #818cf8;
--brand-primary-500: #6366f1;
--brand-primary-600: #4f46e5;
--brand-primary-700: #4338ca;
--brand-primary-800: #3730a3;
--brand-primary-900: #312e81;

/* 次品牌色 */
--brand-secondary: #ec4899;
--brand-secondary-50: #fdf2f8;
--brand-secondary-100: #fce7f3;
--brand-secondary-500: #ec4899;
--brand-secondary-600: #db2777;
--brand-secondary-700: #be185d;
```

### 2.2 中性色
```css
/* 灰色系 */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;
```

### 2.3 语义色
```css
/* 成功 */
--success-50: #f0fdf4;
--success-500: #22c55e;
--success-600: #16a34a;

/* 警告 */
--warning-50: #fffbeb;
--warning-500: #f59e0b;
--warning-600: #d97706;

/* 错误 */
--error-50: #fef2f2;
--error-500: #ef4444;
--error-600: #dc2626;

/* 信息 */
--info-50: #eff6ff;
--info-500: #3b82f6;
--info-600: #2563eb;
```

---

## 3. 排版系统

### 3.1 字体
```css
/* 字体家族 */
--font-display: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-body: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* 阅读字体 */
--font-reading: 'Noto Serif SC', 'Songti SC', serif;
```

### 3.2 字号比例
```css
/* 显示文字 */
--text-display-2xl: 4.5rem;   /* 72px */
--text-display-xl: 3.75rem;   /* 60px */
--text-display-lg: 3rem;      /* 48px */
--text-display-md: 2.25rem;   /* 36px */
--text-display-sm: 1.875rem;  /* 30px */

/* 标题文字 */
--text-heading-xl: 1.5rem;    /* 24px */
--text-heading-lg: 1.25rem;   /* 20px */
--text-heading-md: 1.125rem;  /* 18px */
--text-heading-sm: 1rem;      /* 16px */

/* 正文文字 */
--text-body-lg: 1.125rem;     /* 18px */
--text-body-md: 1rem;         /* 16px */
--text-body-sm: 0.875rem;     /* 14px */
--text-body-xs: 0.75rem;      /* 12px */
```

---

## 4. 间距系统

### 4.1 基础间距
```css
--space-0: 0;
--space-px: 1px;
--space-0-5: 0.125rem;  /* 2px */
--space-1: 0.25rem;     /* 4px */
--space-1-5: 0.375rem;  /* 6px */
--space-2: 0.5rem;      /* 8px */
--space-2-5: 0.625rem;  /* 10px */
--space-3: 0.75rem;     /* 12px */
--space-3-5: 0.875rem;  /* 14px */
--space-4: 1rem;        /* 16px */
--space-5: 1.25rem;     /* 20px */
--space-6: 1.5rem;      /* 24px */
--space-7: 1.75rem;     /* 28px */
--space-8: 2rem;        /* 32px */
--space-9: 2.25rem;     /* 36px */
--space-10: 2.5rem;     /* 40px */
--space-11: 2.75rem;    /* 44px */
--space-12: 3rem;       /* 48px */
--space-14: 3.5rem;     /* 56px */
--space-16: 4rem;       /* 64px */
--space-20: 5rem;       /* 80px */
--space-24: 6rem;       /* 96px */
```

---

## 5. 阴影系统

```css
/* 基础阴影 */
--shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);

/* 内阴影 */
--shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);

/* 聚焦阴影 */
--shadow-focus: 0 0 0 3px var(--brand-primary-100);
--shadow-focus-error: 0 0 0 3px var(--error-50);
```

---

## 6. 圆角系统

```css
--radius-none: 0;
--radius-sm: 0.125rem;   /* 2px */
--radius-md: 0.25rem;    /* 4px */
--radius-lg: 0.5rem;     /* 8px */
--radius-xl: 0.75rem;    /* 12px */
--radius-2xl: 1rem;      /* 16px */
--radius-3xl: 1.5rem;    /* 24px */
--radius-full: 9999px;
```

---

## 7. 动画系统

### 7.1 过渡时间
```css
--duration-0: 0ms;
--duration-75: 75ms;
--duration-100: 100ms;
--duration-150: 150ms;
--duration-200: 200ms;
--duration-300: 300ms;
--duration-500: 500ms;
--duration-700: 700ms;
--duration-1000: 1000ms;
```

### 7.2 缓动函数
```css
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

---

## 8. 断点系统

```css
/* 移动优先断点 */
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

---

## 9. Z-Index 层级

```css
--z-hide: -1;
--z-base: 0;
--z-docked: 10;
--z-dropdown: 1000;
--z-sticky: 1100;
--z-banner: 1200;
--z-overlay: 1300;
--z-modal: 1400;
--z-popover: 1500;
--z-skip-link: 1600;
--z-toast: 1700;
--z-tooltip: 1800;
```

---

## 10. 暗色模式

```css
/* 暗色模式变量 */
[data-theme="dark"] {
  /* 背景色 */
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary: #334155;
  --bg-elevated: #1e293b;
  
  /* 文字色 */
  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  --text-muted: #64748b;
  
  /* 边框色 */
  --border-primary: #334155;
  --border-secondary: #475569;
}
```

---

**最后更新**: 2026-04-13
