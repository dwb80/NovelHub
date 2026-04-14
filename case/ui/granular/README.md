# NovelHub 最小颗粒度UI测试文档

## 文档概述

本文档包含NovelHub小说阅读平台的最小颗粒度UI测试用例，覆盖所有HTML页面的每个交互元素、每种状态和每种交互行为。

## 测试范围

### 已完成的测试文档

| 页面 | 文件路径 | 测试用例数 | 状态 |
|------|---------|-----------|------|
| 首页 | [pages/index.md](./pages/index.md) | 200+ | 已完成 |
| 登录页 | [pages/auth-login.md](./pages/auth-login.md) | 100+ | 已完成 |
| 小说详情页 | [pages/novel-detail.md](./pages/novel-detail.md) | 150+ | 已完成 |

### 待完成的测试文档

| 页面类别 | 页面数量 | 优先级 |
|---------|---------|--------|
| 用户认证相关 | 4页 (register, auth, forgot-password) | P0 |
| 用户中心 | 6页 (profile, settings, notifications, favorites, history, bookshelf) | P0 |
| 阅读器 | 2页 (reading, settings) | P0 |
| 发现页面 | 5页 (search, category, ranking, results) | P0 |
| 书架页面 | 2页 (my-bookshelf, reading-history) | P1 |
| 作者中心 | 2页 (author-center, detail) | P1 |
| 社区页面 | 2页 (forum, topic) | P1 |
| 审核页面 | 1页 (pending) | P2 |
| OpenClaw学习中心 | 1页 (learning-center) | P1 |
| AI小说阅读器 | 13页 (index, reader, chapter_01-11) | P0 |
| 管理后台 | 8页 (dashboard, novels, chapters, comments, users, openclaw, sensitive, settings) | P1 |

## 测试颗粒度定义

### 1. 页面级 (Page Level)
- 页面加载行为
- 页面初始化流程
- 页面间导航
- 页面状态管理

### 2. 组件级 (Component Level)
- 导航栏组件
- 轮播组件
- 表单组件
- 卡片组件
- 列表组件
- 侧边栏组件
- 页脚组件

### 3. 元素级 (Element Level)
- 每个按钮
- 每个输入框
- 每个链接
- 每个图标
- 每个标签
- 每个下拉菜单

### 4. 状态级 (State Level)
- 默认状态
- 悬停状态 (Hover)
- 聚焦状态 (Focus)
- 激活状态 (Active)
- 禁用状态 (Disabled)
- 加载状态 (Loading)
- 错误状态 (Error)
- 成功状态 (Success)

## 测试优先级定义

| 优先级 | 定义 | 测试要求 |
|--------|------|---------|
| P0 | 核心功能 | 必须100%通过，阻塞发布 |
| P1 | 重要功能 | 必须95%通过，影响用户体验 |
| P2 | 增强功能 | 建议90%通过，提升体验 |

## 测试维度

### 功能测试
- 元素存在性
- 交互行为
- 数据展示
- 表单验证
- 状态切换

### 视觉测试
- 布局正确性
- 样式一致性
- 响应式适配
- 主题切换

### 无障碍测试
- ARIA属性
- 键盘导航
- 屏幕阅读器
- 焦点管理

### 性能测试
- 加载时间
- 动画流畅度
- 内存占用
- 资源懒加载

## 问题追踪

### 已发现问题汇总

#### 首页 (index.html)
| 问题ID | 严重程度 | 问题描述 | 状态 |
|--------|---------|---------|------|
| IDX-ISSUE-001 | Medium | 页脚链接全部指向index.html | 待修复 |
| IDX-ISSUE-002 | Low | Agent卡片无点击跳转功能 | 待修复 |
| IDX-ISSUE-003 | Low | 分类卡片使用内联样式 | 待优化 |
| IDX-A11Y-ISSUE-001 | Low | 轮播图缺少暂停按钮 | 待修复 |
| IDX-A11Y-ISSUE-002 | Low | 小说卡片缺少aria-label | 待修复 |

#### 登录页 (login.html)
| 问题ID | 严重程度 | 问题描述 | 状态 |
|--------|---------|---------|------|
| LOGIN-ISSUE-001 | Low | 社交登录功能未实现 | 待实现 |
| LOGIN-ISSUE-002 | Low | 密码切换按钮tabindex=-1 | 待优化 |
| LOGIN-A11Y-001 | Medium | 表单缺少role="form" | 待修复 |
| LOGIN-A11Y-002 | Low | 错误消息缺少aria-live | 待修复 |

#### 小说详情页 (detail.html)
| 问题ID | 严重程度 | 问题描述 | 状态 |
|--------|---------|---------|------|
| DETAIL-ISSUE-001 | Medium | 页脚链接部分为# | 待修复 |
| DETAIL-ISSUE-002 | Low | 加载更多评论无实际功能 | 待实现 |
| DETAIL-ISSUE-003 | Low | 评论过滤提示始终隐藏 | 待接入API |
| DETAIL-A11Y-ISSUE-001 | Low | 章节列表项缺少aria-label | 待修复 |

## 测试执行指南

### 环境准备
1. 启动本地服务器: `npm run dev` 或 `npx serve html`
2. 确保Mock数据已加载
3. 准备不同分辨率的测试设备

### 测试执行顺序
1. 先执行P0级别测试用例
2. 再执行P1级别测试用例
3. 最后执行P2级别测试用例

### 测试记录
- 使用测试用例ID标记测试结果
- 记录发现的任何问题
- 截图保存视觉问题

## 文档维护

### 更新频率
- 页面功能变更时立即更新
- 每周进行一次全面审查
- 发布前进行最终确认

### 版本历史

| 版本 | 日期 | 更新内容 | 更新者 |
|------|------|---------|--------|
| v1.0 | 2026-04-12 | 初始版本，完成首页、登录页、小说详情页测试文档 | Test Results Analyzer |

---

**文档维护**: Test Results Analyzer
**最后更新**: 2026-04-12
**下次审查**: 2026-04-19
