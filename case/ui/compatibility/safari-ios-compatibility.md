# Safari/iOS 兼容性测试用例

## 测试概述

**测试目标**: 验证网站在 Safari 浏览器和 iOS 设备上的兼容性表现，确保 Apple 生态用户获得良好的使用体验
**测试范围**: Safari macOS、Safari iOS、WebKit 渲染引擎特性、触摸交互、PWA 支持
**关联需求**: CMP-SAF-001, CMP-IOS-001, CMP-WEBKIT-001, CMP-PWA-001
**优先级**: P2

---

## 测试用例列表

### TC-CMP-SAF-001: Safari macOS 基础兼容性

| 属性 | 内容 |
|------|------|
| **用例ID** | TC-CMP-SAF-001 |
| **用例名称** | Safari macOS 基础兼容性测试 |
| **前置条件** | 1. macOS Sonoma 或更新版本<br>2. Safari 17+ 已安装<br>3. 测试环境网络正常 |
| **优先级** | P2 |
| **所属需求** | CMP-SAF-001 |

**测试步骤**:
1. 在 Safari 中打开网站首页
2. 检查页面布局和样式渲染
3. 测试导航菜单展开/收起
4. 测试搜索功能
5. 测试用户登录/注册流程
6. 打开阅读器阅读章节内容
7. 检查 WebKit 特有 CSS 属性支持

**预期结果**:
- 页面布局正确，无 WebKit 渲染问题
- -webkit- 前缀 CSS 正确应用
- Flexbox 和 Grid 布局正常
- backdrop-filter 效果正常（如使用）
- 智能跟踪防护不影响核心功能
- 本地存储功能正常

**Safari 特有检查点**:
- [ ] CSS scroll-snap 行为正常
- [ ] -webkit-scrollbar 样式正确
- [ ] backdrop-filter 模糊效果正常
- [ ] -webkit-line-clamp 文本截断正常
- [ ] -webkit-box-orient 布局正常

---

### TC-CMP-SAF-002: Safari iOS 基础兼容性

| 属性 | 内容 |
|------|------|
| **用例ID** | TC-CMP-SAF-002 |
| **用例名称** | Safari iOS 基础兼容性测试 |
| **前置条件** | 1. iOS 17+ 设备或模拟器<br>2. Safari 浏览器<br>3. 测试环境网络正常 |
| **优先级** | P2 |
| **所属需求** | CMP-IOS-001 |

**测试步骤**:
1. 在 iOS Safari 中打开网站首页
2. 测试触摸滚动流畅性
3. 测试点击事件响应
4. 测试输入框聚焦和键盘弹出
5. 测试底部安全区域适配
6. 测试状态栏适配
7. 测试横竖屏切换

**预期结果**:
- 页面适配 iOS 安全区域（safe-area-inset）
- 触摸交互响应灵敏
- 软键盘弹出时页面布局正确
- 横竖屏切换后布局正确
- 状态栏和底部导航栏不遮挡内容

**iOS 特有检查点**:
- [ ] env(safe-area-inset-*) 正确应用
- [ ] -webkit-tap-highlight-color 设置合理
- [ ] 触摸延迟问题已修复（使用 viewport meta 或 touch-action）
- [ ] 禁止缩放设置不影响可访问性
- [ ] iOS 回弹效果（overscroll）正常

---

### TC-CMP-SAF-003: iOS 触摸交互适配

| 属性 | 内容 |
|------|------|
| **用例ID** | TC-CMP-SAF-003 |
| **用例名称** | iOS 触摸交互适配测试 |
| **前置条件** | 1. iOS 设备或模拟器<br>2. 触摸功能正常 |
| **优先级** | P2 |
| **所属需求** | CMP-IOS-001 |

**测试步骤**:
1. 测试滑动翻页功能
2. 测试捏合缩放（如阅读器支持）
3. 测试长按菜单
4. 测试双击缩放
5. 测试惯性滚动
6. 测试边缘滑动返回

**预期结果**:
- 滑动操作流畅，无卡顿
- 捏合手势响应正确
- 长按不触发系统默认菜单（如有自定义菜单）
- 惯性滚动自然流畅
- 边缘滑动返回不干扰应用内导航

**触摸事件检查点**:
```css
/* 应使用的 CSS 属性 */
{
  "touch-action": "pan-y pinch-zoom", /* 或根据需要设置 */
  "-webkit-overflow-scrolling": "touch",
  "-webkit-tap-highlight-color": "transparent"
}
```

---

### TC-CMP-SAF-004: WebKit CSS 特性兼容性

| 属性 | 内容 |
|------|------|
| **用例ID** | TC-CMP-SAF-004 |
| **用例名称** | WebKit CSS 特性兼容性测试 |
| **前置条件** | 1. Safari 17+ 浏览器<br>2. 测试页面包含各种 CSS 特性 |
| **优先级** | P2 |
| **所属需求** | CMP-WEBKIT-001 |

**测试步骤**:
1. 检查 CSS Grid 布局
2. 检查 CSS Flexbox 布局
3. 检查 CSS 动画和过渡
4. 检查 backdrop-filter 效果
5. 检查 CSS 变量支持
6. 检查 container queries 支持

**预期结果**:
- 所有现代 CSS 特性正常渲染
- 无前缀 CSS 优先使用，带前缀作为后备
- 动画性能流畅（60fps）

**WebKit CSS 检查清单**:
```json
{
  "webkit_properties": [
    "-webkit-backdrop-filter",
    "-webkit-line-clamp",
    "-webkit-box-orient",
    "-webkit-overflow-scrolling",
    "-webkit-tap-highlight-color",
    "-webkit-scrollbar",
    "-webkit-scrollbar-thumb",
    "-webkit-scrollbar-track"
  ],
  "modern_css": [
    "grid",
    "flexbox",
    "custom-properties",
    "container-queries",
    "aspect-ratio",
    "backdrop-filter"
  ]
}
```

---

### TC-CMP-SAF-005: Safari 存储和 Cookie 策略

| 属性 | 内容 |
|------|------|
| **用例ID** | TC-CMP-SAF-005 |
| **用例名称** | Safari 存储和 Cookie 策略测试 |
| **前置条件** | 1. Safari 浏览器<br>2. 智能跟踪防护开启 |
| **优先级** | P2 |
| **所属需求** | CMP-SAF-001 |

**测试步骤**:
1. 测试 LocalStorage 数据持久化
2. 测试 SessionStorage 功能
3. 测试 Cookie 设置和读取
4. 测试 IndexedDB 功能
5. 测试智能跟踪防护影响
6. 测试隐私模式下的存储行为

**预期结果**:
- LocalStorage 数据正常持久化
- Cookie 在 SameSite 策略下正常工作
- 智能跟踪防护不阻断第一方 Cookie
- IndexedDB 正常可用

**存储策略配置**:
```javascript
{
  "cookie_settings": {
    "SameSite": "Lax", // 或 Strict
    "Secure": true,    // HTTPS 环境
    "HttpOnly": true   // 防 XSS
  },
  "storage_fallback": "使用内存存储作为后备方案"
}
```

---

### TC-CMP-SAF-006: iOS PWA 支持测试

| 属性 | 内容 |
|------|------|
| **用例ID** | TC-CMP-SAF-006 |
| **用例名称** | iOS PWA 支持测试 |
| **前置条件** | 1. iOS 设备<br>2. 网站已配置 manifest.json<br>3. 已添加必要的 meta 标签 |
| **优先级** | P2 |
| **所属需求** | CMP-PWA-001 |

**测试步骤**:
1. 测试添加到主屏幕功能
2. 测试启动画面显示
3. 测试全屏模式运行
4. 测试离线缓存功能
5. 测试后台刷新
6. 测试推送通知（如支持）

**预期结果**:
- 可正常添加到 iOS 主屏幕
- 启动时显示自定义启动画面
- 以全屏模式运行（无 Safari 导航栏）
- Service Worker 缓存正常工作

**iOS PWA 配置检查**:
```html
<!-- 必需的 meta 标签 -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="NovelHub">
<link rel="apple-touch-icon" href="/icon-192x192.png">
<link rel="apple-touch-startup-image" href="/splash-1125x2436.png">
```

---

### TC-CMP-SAF-007: Safari 性能优化测试

| 属性 | 内容 |
|------|------|
| **用例ID** | TC-CMP-SAF-007 |
| **用例名称** | Safari 性能优化测试 |
| **前置条件** | 1. Safari 浏览器<br>2. 性能监控工具就绪 |
| **优先级** | P2 |
| **所属需求** | CMP-SAF-001 |

**测试步骤**:
1. 使用 Safari Web Inspector 分析性能
2. 测试页面加载时间
3. 测试滚动性能（FPS）
4. 测试内存占用
5. 测试电池消耗
6. 测试动画流畅度

**预期结果**:
- 页面加载时间 < 3s
- 滚动 FPS >= 55
- 内存占用合理，无泄漏
- 动画流畅（60fps）

**Safari 性能指标**:
```json
{
  "performance_targets": {
    "FCP": "< 1.8s",
    "LCP": "< 2.5s",
    "TTI": "< 3.8s",
    "scroll_fps": ">= 55",
    "animation_fps": "60"
  }
}
```

---

### TC-CMP-SAF-008: iPad 适配测试

| 属性 | 内容 |
|------|------|
| **用例ID** | TC-CMP-SAF-008 |
| **用例名称** | iPad 适配测试 |
| **前置条件** | 1. iPad 设备或模拟器<br>2. iPadOS 17+ |
| **优先级** | P2 |
| **所属需求** | CMP-IOS-001 |

**测试步骤**:
1. 测试横屏模式布局
2. 测试竖屏模式布局
3. 测试分屏模式（Split View）
4. 测试 Slide Over 模式
5. 测试鼠标/触控板支持
6. 测试键盘快捷键

**预期结果**:
- 横竖屏布局切换正确
- 分屏模式下布局自适应
- 鼠标悬停效果正常
- 键盘快捷键可用

**iPad 特有检查点**:
- [ ] 支持 pointer 媒体查询
- [ ] hover 状态在触控板下正常
- [ ] 分屏模式下最小宽度适配
- [ ] 支持键盘导航

---

### TC-CMP-SAF-009: Safari 隐私功能兼容性

| 属性 | 内容 |
|------|------|
| **用例ID** | TC-CMP-SAF-009 |
| **用例名称** | Safari 隐私功能兼容性测试 |
| **前置条件** | 1. Safari 17+<br>2. 隐私功能开启 |
| **优先级** | P2 |
| **所属需求** | CMP-SAF-001 |

**测试步骤**:
1. 测试智能跟踪防护（ITP）影响
2. 测试隐私报告功能
3. 测试隐藏邮件地址功能（如使用 Sign in with Apple）
4. 测试跨站追踪阻止
5. 测试本地存储限制
6. 测试指纹防护

**预期结果**:
- 核心功能在隐私模式下正常工作
- 第一方 Cookie 正常可用
- 用户登录状态保持正常
- 本地存储数据不丢失

---

### TC-CMP-SAF-010: iOS 版本兼容性矩阵

| 属性 | 内容 |
|------|------|
| **用例ID** | TC-CMP-SAF-010 |
| **用例名称** | iOS 版本兼容性矩阵测试 |
| **前置条件** | 1. 多个 iOS 版本测试环境<br>2. BrowserStack 或类似工具 |
| **优先级** | P2 |
| **所属需求** | CMP-IOS-001 |

**测试矩阵**:

| iOS 版本 | Safari 版本 | 测试状态 | 备注 |
|----------|-------------|----------|------|
| iOS 17.2 | Safari 17.2 | 待测试 | 最新版本 |
| iOS 17.1 | Safari 17.1 | 待测试 | 主流版本 |
| iOS 16.6 | Safari 16.6 | 待测试 | 最低支持版本 |
| iPadOS 17.2 | Safari 17.2 | 待测试 | iPad 最新版 |
| iPadOS 16.6 | Safari 16.6 | 待测试 | iPad 最低版 |

**测试内容**:
- 核心功能可用性
- 布局渲染正确性
- 触摸交互响应
- 存储功能正常

---

## 测试数据

### Safari 版本矩阵

```json
{
  "safari_matrix": {
    "macos": [
      { "version": "17.2", "os": "macOS Sonoma 14.2" },
      { "version": "17.1", "os": "macOS Sonoma 14.1" },
      { "version": "16.6", "os": "macOS Ventura 13.6" }
    ],
    "ios": [
      { "version": "17.2", "os": "iOS 17.2", "devices": ["iPhone 15", "iPhone 14"] },
      { "version": "17.1", "os": "iOS 17.1", "devices": ["iPhone 15", "iPhone 13"] },
      { "version": "16.6", "os": "iOS 16.6", "devices": ["iPhone 12", "iPhone 11"] }
    ],
    "ipados": [
      { "version": "17.2", "os": "iPadOS 17.2", "devices": ["iPad Pro 12.9", "iPad Air"] },
      { "version": "16.6", "os": "iPadOS 16.6", "devices": ["iPad Pro 11", "iPad mini"] }
    ]
  }
}
```

### WebKit 特性检测

```javascript
// WebKit 特性检测脚本
function detectWebKitFeatures() {
  return {
    backdropFilter: CSS.supports('backdrop-filter', 'blur(10px)') || 
                    CSS.supports('-webkit-backdrop-filter', 'blur(10px)'),
    scrollSnap: CSS.supports('scroll-snap-type', 'x mandatory'),
    lineClamp: CSS.supports('-webkit-line-clamp', '3'),
    containerQueries: CSS.supports('container-type', 'inline-size'),
    aspectRatio: CSS.supports('aspect-ratio', '16/9'),
    grid: CSS.supports('display', 'grid'),
    flexbox: CSS.supports('display', 'flex')
  };
}
```

---

## 测试环境

### 物理设备

- iPhone 15 Pro (iOS 17.2)
- iPhone 14 (iOS 17.1)
- iPhone 12 (iOS 16.6)
- iPad Pro 12.9" (iPadOS 17.2)
- iPad Air (iPadOS 16.6)
- MacBook Pro (macOS Sonoma 14.2, Safari 17.2)

### 模拟器/仿真器

- iOS Simulator (Xcode 15)
- BrowserStack Safari 测试
- LambdaTest iOS 测试

### 测试工具

- Safari Web Inspector
- Xcode Simulator
- BrowserStack
- LambdaTest

---

## 已知 Safari/iOS 兼容性问题

### 常见问题及解决方案

| 问题 | 影响 | 解决方案 |
|------|------|----------|
| 300ms 触摸延迟 | 点击响应慢 | 使用 `touch-action: manipulation` 或 FastClick |
| 固定定位抖动 | 滚动时 header 抖动 | 使用 `transform: translateZ(0)` |
| 输入框缩放 | 聚焦时页面缩放 | 设置 `maximum-scale=1` 或使用 CSS 修复 |
| 底部安全区域 | iPhone X+ 底部被遮挡 | 使用 `env(safe-area-inset-bottom)` |
| 弹性滚动 | 页面整体弹性滚动 | 使用 `overscroll-behavior: none` |
| backdrop-filter 性能 | 模糊效果卡顿 | 谨慎使用，避免大面积应用 |

---

## 相关文档

- [浏览器兼容性测试](./browser.md)
- [用户需求报告 - 移动端兼容性](../../requirement/用户需求报告.md)
- [Apple WebKit CSS 支持文档](https://developer.apple.com/documentation/webkit/css)
- [Safari Web Inspector 指南](https://developer.apple.com/documentation/safari-developer-tools)

---

**编制**: 兼容性测试工程师  
**审核**: 待审核  
**更新日期**: 2026-04-12
