# 页面链接和内容检查测试用例

## 需求理解
检查 http://localhost:3000/ 中的所有链接，识别：
1. 需要登录才能访问的页面（除 /profile 外）
2. 使用 mock 数据的页面，并改为真实 API 调用

---

## 测试用例列表

### TC-001: 公开页面可访问性检查
| 项目 | 内容 |
|------|------|
| **测试用例ID** | TC-001 |
| **对应需求** | 所有公开页面应该可以正常访问 |
| **测试描述** | 验证所有不需要登录的页面可以正常访问 |
| **测试类型** | E2E 测试 |
| **前置条件** | 前端服务运行在 http://localhost:3000 |
| **测试步骤** | 1. 依次访问所有公开页面<br>2. 检查 HTTP 状态码 |
| **预期结果** | 所有页面返回 HTTP 200 |
| **优先级** | P0 |

### TC-002: 需要登录的页面识别
| 项目 | 内容 |
|------|------|
| **测试用例ID** | TC-002 |
| **对应需求** | 识别需要登录的页面（除 /profile 外） |
| **测试描述** | 验证受保护页面在未登录时的行为 |
| **测试类型** | E2E 测试 |
| **前置条件** | 用户未登录 |
| **测试步骤** | 1. 访问 /bookshelf<br>2. 访问 /author<br>3. 访问 /notifications<br>4. 观察页面行为 |
| **预期结果** | - /bookshelf: 显示登录提示<br>- /author: 重定向到登录页<br>- /notifications: 显示空状态 |
| **优先级** | P1 |

### TC-003: Notifications 页面 Mock 数据检查
| 项目 | 内容 |
|------|------|
| **测试用例ID** | TC-003 |
| **对应需求** | Notifications 页面应使用真实 API 数据 |
| **测试描述** | 验证 notifications 页面不使用 mock 数据 |
| **测试类型** | E2E 测试 |
| **前置条件** | 页面已加载 |
| **测试步骤** | 1. 访问 /notifications<br>2. 检查页面内容 |
| **预期结果** | 页面不包含以下 mock 数据标记：<br>- "AI觉醒之路"<br>- "深渊边缘"<br>- "DeepWriter"<br>- "小说更新提醒"<br>- "收到新评论" |
| **优先级** | P1 |

### TC-004: Category 页面 Mock 数据检查
| 项目 | 内容 |
|------|------|
| **测试用例ID** | TC-004 |
| **对应需求** | Category 页面应使用真实 API 数据 |
| **测试描述** | 验证 category 页面不使用 mock 数据 |
| **测试类型** | E2E 测试 |
| **前置条件** | 页面已加载 |
| **测试步骤** | 1. 访问 /category<br>2. 检查页面内容 |
| **预期结果** | 页面不包含以下 mock 数据标记：<br>- "AI觉醒之路"<br>- "DeepWriter"<br>- "CityDreamer"<br>- "星河纪元" |
| **优先级** | P1 |

### TC-005: AI-Writers 页面 Mock 数据检查
| 项目 | 内容 |
|------|------|
| **测试用例ID** | TC-005 |
| **对应需求** | AI-Writers 页面应使用真实 API 数据 |
| **测试描述** | 验证 ai-writers 页面不使用 mock 数据 |
| **测试类型** | E2E 测试 |
| **前置条件** | 页面已加载 |
| **测试步骤** | 1. 访问 /ai-writers<br>2. 检查页面内容 |
| **预期结果** | 页面不包含以下 mock 数据标记：<br>- "aiwriter-alpha"<br>- "DeepWriter"<br>- "StoryCrafter Pro"<br>- "Narrative Nexus" |
| **优先级** | P1 |

### TC-006: 后端 API 可用性检查
| 项目 | 内容 |
|------|------|
| **测试用例ID** | TC-006 |
| **对应需求** | 后端 API 应该正常运行并返回数据 |
| **测试描述** | 验证关键 API 端点可用 |
| **测试类型** | API 测试 |
| **前置条件** | 后端服务运行在 http://localhost:3001 |
| **测试步骤** | 1. 调用 /api/v1/health<br>2. 调用 /api/v1/novels<br>3. 调用 /api/v1/claws<br>4. 调用 /api/v1/reviewers |
| **预期结果** | 所有 API 返回 200 并包含有效数据 |
| **优先级** | P0 |

### TC-007: 首页链接完整性检查
| 项目 | 内容 |
|------|------|
| **测试用例ID** | TC-007 |
| **对应需求** | 首页应包含所有关键导航链接 |
| **测试描述** | 验证首页链接完整性 |
| **测试类型** | E2E 测试 |
| **前置条件** | 首页已加载 |
| **测试步骤** | 1. 访问 /<br>2. 获取所有链接元素 |
| **预期结果** | 包含以下链接：<br>- /novels<br>- /ranking<br>- /claws<br>- /reviews<br>- /ai-writers |
| **优先级** | P1 |

---

## 修复记录

### 修复 1: Notifications 页面
- **文件**: `apps/frontend/src/app/notifications/page.tsx`
- **问题**: 使用 mockNotifications 作为回退数据
- **修复**: 移除 mock 数据，仅使用 API 数据
- **状态**: ✅ 已修复

### 修复 2: Category 页面
- **文件**: `apps/frontend/src/app/category/page.tsx`
- **问题**: 使用 mockNovels 作为回退数据
- **修复**: 移除 mock 数据，仅使用 API 数据
- **状态**: ✅ 已修复

### 修复 3: AI-Writers 页面
- **文件**: `apps/frontend/src/app/ai-writers/page.tsx`
- **问题**: 使用 mockClaws 作为回退数据
- **修复**: 移除 mock 数据，仅使用 API 数据
- **状态**: ✅ 已修复

---

## 执行指南

### 运行测试
```bash
cd apps/frontend
npx playwright test e2e/page-link-check.spec.ts --project=chromium
```

### 检查 API 数据
```bash
cd case/coding
node check-api-data.js
```

---

## 风险与建议

### 潜在风险
1. 受保护页面使用客户端认证检查，可能被绕过
2. 如果后端 API 不可用，页面将显示空状态

### 建议
1. 考虑在服务端添加中间件保护需要登录的页面
2. 为 API 错误添加更友好的错误提示
3. 添加加载状态提升用户体验
