# NovelHub 设计Token规范 v1.0

## 文档信息

- **版本**: 1.0.0
- **创建日期**: 2026-04-25
- **风格**: 精致文学风
- **关联文档**: [24-UIUX设计.md](./24-UIUX设计.md)

---

## 1. Token 命名规范

### 命名结构
```
{类别}-{属性}-{变体}-{状态}
```

**示例**:
- `color-primary-default` - 主色默认状态
- `radius-button-sm` - 小型按钮圆角
- `shadow-card-hover` - 卡片悬停阴影

---

## 2. 颜色Token (Colors)

### 2.1 主色调

| Token | HSL值 | Hex值 | 用途 |
|-------|-------|-------|------|
| `--color-primary` | 222 47% 30% | `#1E3A8A` | 主按钮、链接 |
| `--color-primary-hover` | 222 47% 25% | `#172554` | 悬停状态 |
| `--color-primary-light` | 222 47% 95% | `#EFF6FF` | 背景高亮 |

### 2.2 中性色

| Token | HSL值 | Hex值 | 用途 |
|-------|-------|-------|------|
| `--color-background` | 40 20% 98% | `#FAFAF9` | 页面背景（暖白） |
| `--color-foreground` | 20 14% 10% | `#1C1917` | 主文字 |
| `--color-card` | 0 0% 100% | `#FFFFFF` | 卡片背景 |
| `--color-muted` | 40 10% 96% | `#F5F5F4` | 静音背景 |
| `--color-muted-foreground` | 25 8% 45% | `#78716C` | 次要文字 |
| `--color-border` | 30 10% 90% | `#E7E5E4` | 边框 |
| `--color-input` | 30 10% 82% | `#D6D3D1` | 输入框边框 |

### 2.3 功能色

| Token | HSL值 | Hex值 | 用途 |
|-------|-------|-------|------|
| `--color-success` | 142 76% 36% | `#16A34A` | 成功状态 |
| `--color-warning` | 38 92% 50% | `#F59E0B` | 警告状态 |
| `--color-error` | 0 72% 51% | `#EF4444` | 错误状态 |
| `--color-info` | 199 89% 48% | `#0EA5E9` | 信息提示 |

---

## 3. 圆角Token (Border Radius)

### 3.1 基础圆角

| Token | 值 | Tailwind类 | 用途 |
|-------|-----|-----------|------|
| `--radius-none` | 0 | `rounded-none` | 无圆角 |
| `--radius-xs` | 2px | `rounded-xs` | 极小元素 |
| `--radius-sm` | 4px | `rounded` / `rounded-sm` | 图片、输入框、微型按钮 |
| `--radius-md` | 6px | `rounded-sm` | 标准按钮 |
| `--radius-lg` | 8px | `rounded-md` | 小卡片、大按钮 |
| `--radius-xl` | 12px | `rounded-lg` | 大卡片、模块容器 |
| `--radius-2xl` | 16px | `rounded-xl` | 弹窗、模态框 |
| `--radius-full` | 9999px | `rounded-full` | 头像、标签、搜索框 |

### 3.2 组件圆角映射

| 组件 | Token | 值 | 说明 |
|------|-------|-----|------|
| 微型按钮 | `--radius-button-xs` | 4px | 图标按钮 |
| 标准按钮 | `--radius-button` | 6px | 主要操作 |
| 大按钮 | `--radius-button-lg` | 8px | CTA按钮 |
| 输入框 | `--radius-input` | 4px | 表单输入 |
| 搜索框 | `--radius-search` | 9999px | 搜索输入（特殊） |
| 小卡片 | `--radius-card` | 8px | 小说卡片 |
| 大卡片 | `--radius-card-lg` | 12px | 模块容器 |
| 弹窗 | `--radius-modal` | 16px | 模态框 |
| 图片 | `--radius-image` | 4px | 封面图 |
| 头像 | `--radius-avatar` | 9999px | 用户头像 |
| 标签 | `--radius-tag` | 9999px | 分类标签 |

---

## 4. 阴影Token (Shadows)

| Token | 值 | 用途 |
|-------|-----|------|
| `--shadow-none` | none | 默认状态 |
| `--shadow-hover` | `0 2px 8px rgba(0,0,0,0.08)` | 卡片悬停 |
| `--shadow-float` | `0 4px 16px rgba(0,0,0,0.12)` | 浮起状态 |
| `--shadow-modal` | `0 8px 32px rgba(0,0,0,0.16)` | 弹窗、模态框 |

---

## 5. 字体Token (Typography)

### 5.1 字体族

```css
--font-family-base: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei",
                    "WenQuanYi Micro Hei", -apple-system, BlinkMacSystemFont,
                    "Segoe UI", Roboto, sans-serif;
```

### 5.2 字体大小

| Token | 大小 | 行高 | 字重 | 用途 |
|-------|------|------|------|------|
| `--font-size-page-title` | 28px | 36px | 600 | 页面大标题 |
| `--font-size-section-title` | 22px | 30px | 600 | 板块标题 |
| `--font-size-card-title` | 16px | 24px | 500 | 卡片标题 |
| `--font-size-body` | 15px | 26px | 400 | 正文阅读 |
| `--font-size-secondary` | 13px | 20px | 400 | 辅助信息 |
| `--font-size-tiny` | 12px | 16px | 400 | 标签、时间 |

### 5.3 字重

| Token | 值 | 用途 |
|-------|-----|------|
| `--font-weight-normal` | 400 | 正文 |
| `--font-weight-medium` | 500 | 卡片标题 |
| `--font-weight-semibold` | 600 | 板块标题 |

---

## 6. 间距Token (Spacing)

### 6.1 基础间距

| Token | 值 | 用途 |
|-------|-----|------|
| `--space-xs` | 4px | 图标内边距 |
| `--space-sm` | 8px | 行内元素间距 |
| `--space-md` | 16px | 组件内边距 |
| `--space-lg` | 24px | 组件间距 |
| `--space-xl` | 32px | 板块间距 |
| `--space-2xl` | 48px | 大区块间距 |
| `--space-3xl` | 64px | 页面边距 |

### 6.2 组件间距

| 组件 | 内边距 | 说明 |
|------|--------|------|
| 按钮小 | 6px 12px | 微型按钮 |
| 按钮中 | 10px 20px | 标准按钮 |
| 按钮大 | 12px 24px | CTA按钮 |
| 输入框 | 10px 12px | 表单输入 |
| 卡片 | 12px - 16px | 根据大小调整 |

---

## 7. 边框Token (Borders)

| Token | 宽度 | 颜色Token | 用途 |
|-------|------|-----------|------|
| `--border-default` | 1px | `--color-border` | 默认卡片边框 |
| `--border-hover` | 1px | `--color-primary` 20% | 悬停边框 |
| `--border-active` | 2px | `--color-primary` | 选中/激活 |
| `--border-input` | 1px | `--color-input` | 输入框默认 |
| `--border-input-focus` | 2px | `--color-primary` | 输入框聚焦 |
| `--border-divider` | 1px | `--color-border` | 分割线 |

---

## 8. 过渡Token (Transitions)

| Token | 值 | 用途 |
|-------|-----|------|
| `--transition-fast` | 150ms ease | 微交互 |
| `--transition-base` | 200ms ease | 标准过渡 |
| `--transition-slow` | 300ms ease | 大型动画 |

---

## 9. Z-Index层级

| Token | 值 | 用途 |
|-------|-----|------|
| `--z-dropdown` | 100 | 下拉菜单 |
| `--z-sticky` | 200 | 粘性元素 |
| `--z-modal` | 300 | 模态框 |
| `--z-popover` | 400 | 弹出层 |
| `--z-tooltip` | 500 | 提示框 |
| `--z-toast` | 600 | 通知提示 |

---

## 10. 使用示例

### 10.1 Tailwind中使用

```tsx
// 按钮
<button className="rounded-sm px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary-hover transition-fast">
  立即阅读
</button>

// 卡片
<div className="rounded-md border border-border bg-card shadow-hover hover:shadow-float transition-base">
  <img className="rounded" src="cover.jpg" />
  <div className="p-3">
    <h3 className="text-card-title font-medium">小说标题</h3>
    <p className="text-secondary text-sm">作者名字</p>
  </div>
</div>

// 输入框
<input className="rounded border border-input px-3 py-2.5 focus:border-primary focus:ring-2 focus:ring-ring" />

// 标签
<span className="rounded-full px-2 py-0.5 bg-muted text-muted-foreground text-tiny">科幻</span>
```

### 10.2 CSS变量使用

```css
.my-component {
  background-color: hsl(var(--color-card));
  border-radius: var(--radius-card);
  border: 1px solid hsl(var(--color-border));
  box-shadow: var(--shadow-hover);
  padding: var(--space-md);
  font-size: var(--font-size-body);
  transition: var(--transition-base);
}
```

---

## 11. 组件映射速查表

| 组件 | 圆角 | 阴影 | 边框 | 内边距 |
|------|------|------|------|--------|
| 微型按钮 | 4px | none | none | 6px 12px |
| 标准按钮 | 6px | none | none | 10px 20px |
| 大按钮 | 8px | none | none | 12px 24px |
| 次要按钮 | 6px | none | 1px border | 10px 20px |
| 输入框 | 4px | none | 1px input | 10px 12px |
| 搜索框 | 9999px | none | 1px border | 8px 16px |
| 小说卡片 | 8px | hover | 1px border | 0 (图片区) 12px (内容区) |
| 大卡片 | 12px | none | 1px border | 16px |
| 弹窗 | 16px | modal | none | 24px |
| 标签 | 9999px | none | none | 2px 8px |
| 头像 | 9999px | none | 2px white | 0 |

---

## 12. 版本记录

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| 1.0.0 | 2026-04-25 | 初始版本，建立精致文学风设计Token系统 |
