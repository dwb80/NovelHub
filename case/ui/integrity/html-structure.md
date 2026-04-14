# NovelHub HTML结构完整性测试用例

## 测试概述

本测试用例集用于验证NovelHub项目所有45个HTML页面的结构完整性，包括必要的meta标签、SEO标签、ARIA属性、链接和脚本引用等。

---

## 1. 基础HTML结构测试

### TC-UI-HTML-001: DOCTYPE声明验证
- **测试对象**: 所有45个HTML页面
- **测试内容**: 验证每个页面包含正确的DOCTYPE声明
- **验证方法**: 
  1. 打开每个HTML文件
  2. 检查第一行是否为 `<!DOCTYPE html>`
- **预期结果**: 所有页面第一行均为 `<!DOCTYPE html>`
- **优先级**: P0 (Critical)

### TC-UI-HTML-002: HTML根元素验证
- **测试对象**: 所有45个HTML页面
- **测试内容**: 验证html标签包含正确的lang和dir属性
- **验证方法**:
  1. 检查 `<html lang="zh-CN" dir="ltr">` 属性
  2. 验证lang值为"zh-CN"
  3. 验证dir值为"ltr"
- **预期结果**: 所有页面html标签包含 lang="zh-CN" dir="ltr"
- **优先级**: P0 (Critical)

### TC-UI-HTML-003: Head区域完整性验证
- **测试对象**: 所有45个HTML页面
- **测试内容**: 验证head区域包含必要的基础标签
- **验证方法**:
  1. 检查 `<meta charset="UTF-8">`
  2. 检查 `<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">`
  3. 检查 `<meta http-equiv="X-UA-Compatible" content="IE=edge">`
- **预期结果**: 所有页面head区域包含上述三个meta标签
- **优先级**: P0 (Critical)

---

## 2. Meta标签测试

### TC-UI-HTML-004: Primary Meta Tags验证
- **测试对象**: 所有45个HTML页面
- **测试内容**: 验证主要meta标签完整性
- **验证方法**:
  1. 检查 description meta标签存在且内容非空
  2. 检查 keywords meta标签存在
  3. 检查 author meta标签为"NovelHub Team"
  4. 检查 robots meta标签为"index, follow"
- **预期结果**: 
  - description: 包含页面描述，长度50-160字符
  - keywords: 包含相关关键词
  - author: "NovelHub Team"
  - robots: "index, follow"
- **优先级**: P1 (High)

### TC-UI-HTML-005: Open Graph标签验证
- **测试对象**: 所有45个HTML页面
- **测试内容**: 验证Open Graph社交分享标签
- **验证方法**:
  1. 检查 `og:type` 标签
  2. 检查 `og:url` 标签
  3. 检查 `og:title` 标签
  4. 检查 `og:description` 标签
  5. 检查 `og:image` 标签
  6. 检查 `og:locale` 标签为"zh_CN"
  7. 检查 `og:site_name` 标签为"NovelHub"
- **预期结果**: 所有og标签存在且值正确
- **优先级**: P1 (High)

### TC-UI-HTML-006: Twitter Card标签验证
- **测试对象**: 所有45个HTML页面
- **测试内容**: 验证Twitter Card标签
- **验证方法**:
  1. 检查 `twitter:card` 为"summary_large_image"
  2. 检查 `twitter:url` 存在
  3. 检查 `twitter:title` 存在
  4. 检查 `twitter:description` 存在
  5. 检查 `twitter:image` 存在
- **预期结果**: 所有twitter标签存在且值正确
- **优先级**: P2 (Medium)

### TC-UI-HTML-007: PWA相关Meta标签验证
- **测试对象**: 所有45个HTML页面
- **测试内容**: 验证PWA和移动端相关meta标签
- **验证方法**:
  1. 检查 `mobile-web-app-capable` 为"yes"
  2. 检查 `apple-mobile-web-app-capable` 为"yes"
  3. 检查 `apple-mobile-web-app-status-bar-style` 存在
  4. 检查 `apple-mobile-web-app-title` 为"NovelHub"
  5. 检查 `application-name` 为"NovelHub"
  6. 检查 `theme-color` 存在
  7. 检查 `msapplication-TileColor` 存在
- **预期结果**: 所有PWA相关标签存在且值正确
- **优先级**: P2 (Medium)

### TC-UI-HTML-008: Canonical URL验证
- **测试对象**: 所有45个HTML页面
- **测试内容**: 验证Canonical URL标签
- **验证方法**:
  1. 检查 `<link rel="canonical" href="...">` 存在
  2. 验证href值格式正确
- **预期结果**: 每个页面包含正确的canonical链接
- **优先级**: P1 (High)

---

## 3. 资源引用测试

### TC-UI-HTML-009: CSS文件引用验证
- **测试对象**: 所有45个HTML页面
- **测试内容**: 验证CSS文件引用完整性
- **验证方法**:
  1. 检查基础CSS引用:
     - base.css
     - components.css
     - layout.css
     - themes.css
     - accessibility.css
  2. 验证所有CSS文件路径正确
  3. 检查CSS文件是否可访问
- **预期结果**: 
  - 所有基础CSS文件被引用
  - 路径格式: `assets/css/xxx.css`
  - 无404错误
- **优先级**: P0 (Critical)

### TC-UI-HTML-010: JavaScript文件引用验证
- **测试对象**: 所有45个HTML页面
- **测试内容**: 验证JS文件引用完整性
- **验证方法**:
  1. 检查全局JS引用:
     - mock/data-global.js
     - 页面特定JS文件
  2. 验证JS文件路径正确
  3. 检查JS文件是否可访问
- **预期结果**:
  - 所有必要JS文件被引用
  - 路径格式正确
  - 无404错误
- **优先级**: P0 (Critical)

### TC-UI-HTML-011: 字体引用验证
- **测试对象**: 所有45个HTML页面
- **测试内容**: 验证Google Fonts字体引用
- **验证方法**:
  1. 检查Google Fonts预连接: `preconnect` 链接
  2. 检查Noto Serif SC字体加载
  3. 检查Noto Sans SC字体加载
- **预期结果**:
  - 包含 `fonts.googleapis.com` 和 `fonts.gstatic.com` 的preconnect
  - 正确加载中文字体
- **优先级**: P1 (High)

### TC-UI-HTML-012: Favicon验证
- **测试对象**: 所有45个HTML页面
- **测试内容**: 验证Favicon图标引用
- **验证方法**:
  1. 检查SVG favicon存在
  2. 检查Apple Touch Icon引用
- **预期结果**:
  - 包含SVG格式的favicon
  - 包含apple-touch-icon链接
- **优先级**: P2 (Medium)

---

## 4. ARIA属性测试

### TC-UI-HTML-013: 导航栏ARIA属性验证
- **测试对象**: 所有45个HTML页面
- **测试内容**: 验证导航栏ARIA属性
- **验证方法**:
  1. 检查 `<header role="banner">`
  2. 检查 `<nav role="navigation" aria-label="主导航">`
  3. 检查当前页面链接有 `aria-current="page"`
  4. 检查搜索按钮有 `aria-label="搜索小说"`
- **预期结果**: 所有导航相关ARIA属性正确设置
- **优先级**: P1 (High)

### TC-UI-HTML-014: 主内容区ARIA属性验证
- **测试对象**: 所有45个HTML页面
- **测试内容**: 验证主内容区域ARIA属性
- **验证方法**:
  1. 检查 `<main role="main">` 或 `<main class="main-content" id="mainContent" role="main">`
  2. 检查跳过链接 `<a href="#mainContent" class="skip-link sr-only">跳转到主要内容</a>`
- **预期结果**: 主内容区正确标记，支持无障碍跳转
- **优先级**: P1 (High)

### TC-UI-HTML-015: 页面加载器ARIA属性验证
- **测试对象**: 所有45个HTML页面
- **测试内容**: 验证页面加载器ARIA属性
- **验证方法**:
  1. 检查 `<div id="pageLoader" role="status" aria-live="polite" aria-label="页面加载中">`
  2. 检查加载动画有 `aria-hidden="true"`
- **预期结果**: 加载器正确标记，屏幕阅读器可识别
- **优先级**: P2 (Medium)

### TC-UI-HTML-016: 轮播组件ARIA属性验证
- **测试对象**: 首页 (index.html)
- **测试内容**: 验证Banner轮播ARIA属性
- **验证方法**:
  1. 检查 `<section role="region" aria-label="热门推荐">`
  2. 检查 `<div role="list">` 和 `<div role="listitem">`
  3. 检查轮播点有 `role="tablist"` 和 `aria-label`
  4. 检查每个轮播点有 `role="tab"` 和 `aria-selected`
  5. 检查每个轮播点有 `aria-label` 描述
- **预期结果**: 轮播组件完全支持屏幕阅读器
- **优先级**: P1 (High)

### TC-UI-HTML-017: 按钮和交互元素ARIA属性验证
- **测试对象**: 所有45个HTML页面
- **测试内容**: 验证按钮和交互元素ARIA属性
- **验证方法**:
  1. 检查主题切换按钮有 `aria-label="切换主题"`
  2. 检查所有图标按钮有 `aria-label`
  3. 检查SVG图标有 `aria-hidden="true"`
  4. 检查Tab组件有 `role="tablist"` 和 `role="tab"`
- **预期结果**: 所有交互元素可访问性良好
- **优先级**: P1 (High)

### TC-UI-HTML-018: 表单ARIA属性验证
- **测试对象**: 用户相关页面 (登录、注册、设置等)
- **测试内容**: 验证表单元素ARIA属性
- **验证方法**:
  1. 检查输入框有关联的label
  2. 检查必填字段有 `aria-required="true"`
  3. 检查错误提示有 `role="alert"`
  4. 检查表单有 `aria-label` 或 `aria-labelledby`
- **预期结果**: 表单完全支持屏幕阅读器
- **优先级**: P1 (High)

---

## 5. 页面结构测试

### TC-UI-HTML-019: 页脚ARIA属性验证
- **测试对象**: 所有45个HTML页面
- **测试内容**: 验证页脚ARIA属性
- **验证方法**:
  1. 检查 `<footer role="contentinfo">`
  2. 检查页脚导航有 `aria-label="页脚导航"`
- **预期结果**: 页脚区域正确标记
- **优先级**: P2 (Medium)

### TC-UI-HTML-020: 侧边栏ARIA属性验证
- **测试对象**: 包含侧边栏的页面
- **测试内容**: 验证侧边栏ARIA属性
- **验证方法**:
  1. 检查 `<aside role="complementary" aria-label="...">`
  2. 检查侧边栏标题有 `id` 属性
  3. 检查内容区域有 `aria-labelledby` 关联标题
- **预期结果**: 侧边栏正确标记为辅助内容
- **优先级**: P2 (Medium)

### TC-UI-HTML-021: Toast通知ARIA属性验证
- **测试对象**: 所有45个HTML页面
- **测试内容**: 验证Toast容器ARIA属性
- **验证方法**:
  1. 检查 `<div class="toast-container" role="status" aria-live="polite" aria-atomic="true">`
- **预期结果**: Toast容器正确配置实时区域
- **优先级**: P2 (Medium)

### TC-UI-HTML-022: 网络状态指示器ARIA验证
- **测试对象**: 所有45个HTML页面
- **测试内容**: 验证网络状态指示器ARIA属性
- **验证方法**:
  1. 检查 `<div id="networkStatus" role="status" aria-live="polite">`
- **预期结果**: 网络状态指示器正确配置
- **优先级**: P3 (Low)

---

## 6. SEO优化测试

### TC-UI-HTML-023: Title标签优化验证
- **测试对象**: 所有45个HTML页面
- **测试内容**: 验证Title标签内容和格式
- **验证方法**:
  1. 检查每个页面有唯一的title
  2. 验证title长度在30-60字符之间
  3. 验证title包含"NovelHub"品牌名
  4. 验证title描述页面内容
- **预期结果**:
  - 首页: "NovelHub - AI 驱动的小说创作与阅读平台 | 发现精彩故事"
  - 其他页面: "页面名 - NovelHub"
- **优先级**: P1 (High)

### TC-UI-HTML-024: 结构化数据验证
- **测试对象**: 关键页面 (首页、小说详情页等)
- **测试内容**: 验证Schema.org结构化数据
- **验证方法**:
  1. 检查是否包含JSON-LD格式的结构化数据
  2. 验证WebSite、WebPage、Book等类型
- **预期结果**: 关键页面包含适当的结构化数据
- **优先级**: P2 (Medium)

### TC-UI-HTML-025: H1标签唯一性验证
- **测试对象**: 所有45个HTML页面
- **测试内容**: 验证每个页面只有一个H1标签
- **验证方法**:
  1. 检查每个页面H1标签数量
  2. 验证H1内容与页面主题相关
- **预期结果**: 每个页面有且只有一个H1标签
- **优先级**: P1 (High)

---

## 7. 性能优化测试

### TC-UI-HTML-026: 资源预连接验证
- **测试对象**: 所有45个HTML页面
- **测试内容**: 验证DNS预取和预连接
- **验证方法**:
  1. 检查 `<link rel="preconnect">` 标签
  2. 检查 `<link rel="dns-prefetch">` 标签
  3. 验证预连接指向Google Fonts和Picsum
- **预期结果**: 包含必要的预连接优化
- **优先级**: P2 (Medium)

### TC-UI-HTML-027: 图片加载优化验证
- **测试对象**: 所有45个HTML页面
- **测试内容**: 验证图片懒加载属性
- **验证方法**:
  1. 检查非首屏图片有 `loading="lazy"`
  2. 检查首屏关键图片有 `loading="eager"`
  3. 检查图片有 `decoding="async"`
- **预期结果**: 图片懒加载正确配置
- **优先级**: P2 (Medium)

---

## 8. 页面清单 (45个页面)

| 序号 | 页面路径 | 页面名称 | 优先级 |
|------|----------|----------|--------|
| 1 | index.html | 首页 | P0 |
| 2 | preview.html | 预览页 | P1 |
| 3 | pages/admin/dashboard.html | 管理后台-仪表盘 | P1 |
| 4 | pages/admin/novels.html | 管理后台-小说管理 | P1 |
| 5 | pages/admin/chapters.html | 管理后台-章节管理 | P1 |
| 6 | pages/admin/comments.html | 管理后台-评论管理 | P1 |
| 7 | pages/admin/users.html | 管理后台-用户管理 | P1 |
| 8 | pages/admin/settings.html | 管理后台-系统设置 | P1 |
| 9 | pages/admin/openclaw.html | 管理后台-OpenClaw管理 | P1 |
| 10 | pages/admin/sensitive.html | 管理后台-敏感词管理 | P1 |
| 11 | pages/author/author-center.html | 作者中心 | P1 |
| 12 | pages/author/detail.html | 作者详情 | P1 |
| 13 | pages/bookshelf/my-bookshelf.html | 我的书架 | P1 |
| 14 | pages/bookshelf/reading-history.html | 阅读历史 | P1 |
| 15 | pages/community/forum.html | 社区论坛 | P2 |
| 16 | pages/community/topic.html | 话题详情 | P2 |
| 17 | pages/discover/category.html | 分类浏览 | P1 |
| 18 | pages/discover/ranking.html | 排行榜 | P1 |
| 19 | pages/discover/search.html | 搜索页 | P1 |
| 20 | pages/discover/ranking/index.html | 排行榜-索引 | P2 |
| 21 | pages/discover/search/results.html | 搜索结果 | P1 |
| 22 | pages/novel/catalog.html | 小说目录 | P1 |
| 23 | pages/novel/detail.html | 小说详情 | P1 |
| 24 | pages/novel/ai-awoking/index.html | AI觉醒之路-首页 | P1 |
| 25 | pages/novel/ai-awoking/reader.html | AI觉醒之路-阅读器 | P1 |
| 26 | pages/novel/ai-awoking/chapter_01.html | 章节1 | P2 |
| 27 | pages/novel/ai-awoking/chapter_02.html | 章节2 | P2 |
| 28 | pages/novel/ai-awoking/chapter_03.html | 章节3 | P2 |
| 29 | pages/novel/ai-awoking/chapter_04.html | 章节4 | P2 |
| 30 | pages/novel/ai-awoking/chapter_05.html | 章节5 | P2 |
| 31 | pages/novel/ai-awoking/chapter_06.html | 章节6 | P2 |
| 32 | pages/novel/ai-awoking/chapter_07.html | 章节7 | P2 |
| 33 | pages/novel/ai-awoking/chapter_08.html | 章节8 | P2 |
| 34 | pages/novel/ai-awoking/chapter_09.html | 章节9 | P2 |
| 35 | pages/novel/ai-awoking/chapter_10.html | 章节10 | P2 |
| 36 | pages/novel/ai-awoking/chapter_11.html | 章节11 | P2 |
| 37 | pages/openclaw/learning-center.html | OpenClaw学习中心 | P1 |
| 38 | pages/reader/reading.html | 阅读器 | P1 |
| 39 | pages/reader/settings.html | 阅读设置 | P1 |
| 40 | pages/review/pending.html | 待审核列表 | P1 |
| 41 | pages/user/auth.html | 用户认证 | P1 |
| 42 | pages/user/bookshelf.html | 用户书架 | P1 |
| 43 | pages/user/favorites.html | 用户收藏 | P1 |
| 44 | pages/user/forgot-password.html | 忘记密码 | P1 |
| 45 | pages/user/history.html | 阅读历史 | P1 |
| 46 | pages/user/login.html | 登录页 | P1 |
| 47 | pages/user/notifications.html | 通知中心 | P1 |
| 48 | pages/user/profile.html | 个人资料 | P1 |
| 49 | pages/user/register.html | 注册页 | P1 |
| 50 | pages/user/settings.html | 用户设置 | P1 |

---

## 9. 测试执行检查清单

### 执行前准备
- [ ] 确认所有HTML文件存在于正确路径
- [ ] 准备HTML验证工具 (W3C Validator)
- [ ] 准备ARIA检查工具 (axe DevTools)
- [ ] 准备SEO检查工具

### 执行步骤
1. **自动化扫描**: 使用工具批量检查所有页面
2. **人工复核**: 对关键页面进行人工检查
3. **无障碍测试**: 使用屏幕阅读器测试
4. **记录结果**: 记录所有发现的问题

### 通过标准
- P0级别用例: 100%通过
- P1级别用例: >=95%通过
- P2级别用例: >=90%通过
- P3级别用例: >=80%通过

---

## 10. 常见问题及修复建议

### 问题1: 缺少viewport meta标签
**影响**: 移动端显示异常
**修复**: 添加 `<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">`

### 问题2: 图片缺少alt属性
**影响**: 无障碍访问问题
**修复**: 为所有img标签添加描述性alt文本

### 问题3: 表单缺少label关联
**影响**: 屏幕阅读器无法识别
**修复**: 使用 `<label for="inputId">` 或 `aria-labelledby`

### 问题4: 重复的H1标签
**影响**: SEO排名下降
**修复**: 确保每个页面只有一个H1

### 问题5: 缺少lang属性
**影响**: 屏幕阅读器发音错误
**修复**: 在html标签添加 lang="zh-CN"

---

**测试文档版本**: 1.0
**最后更新**: 2026-04-12
**维护者**: Test Results Analyzer
