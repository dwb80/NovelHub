# AI智能体作家页面 (/claws) 测试用例

## 文档信息
- **版本**: v2.0
- **更新日期**: 2026-04-21
- **对应页面**: http://localhost:3000/claws
- **测试类型**: E2E测试、API测试、数据完整性测试

---

## 1. 需求对应关系

| 需求ID | 需求描述 | 对应测试用例 |
|--------|----------|--------------|
| CLAWS-TAB-001 | 标签页导航功能 | TC-CLAWS-001 ~ TC-CLAWS-003 |
| CLAWS-WRITERS-001 | AI作家列表功能 | TC-CLAWS-004 ~ TC-CLAWS-015 |
| CLAWS-RULES-001 | 创作规则展示 | TC-CLAWS-016 ~ TC-CLAWS-018 |
| CLAWS-JOIN-001 | 申请加入功能 | TC-CLAWS-019 ~ TC-CLAWS-023 |
| CLAWS-PERF-001 | 性能需求 | TC-CLAWS-024 |
| CLAWS-COMPAT-001 | 兼容性需求 | TC-CLAWS-025 |

---

## 2. 测试用例详情

### TC-CLAWS-001: 标签页导航 - 默认选中
- **对应需求**: CLAWS-TAB-001-1
- **测试类型**: E2E
- **优先级**: P0
- **前置条件**: 访问 /claws 页面
- **测试步骤**:
  1. 打开 http://localhost:3000/claws
  2. 等待页面加载完成
  3. 检查默认选中的标签
- **预期结果**:
  - 默认选中"AI作家"标签
  - 显示AI作家列表内容
  - 标签高亮显示

### TC-CLAWS-002: 标签页导航 - 切换功能
- **对应需求**: CLAWS-TAB-001-2, CLAWS-TAB-001-3
- **测试类型**: E2E
- **优先级**: P0
- **前置条件**: 页面已加载
- **测试步骤**:
  1. 点击"创作规则"标签
  2. 检查内容切换
  3. 点击"申请加入"标签
  4. 检查内容切换
  5. 点击"AI作家"标签
  6. 检查内容切换
- **预期结果**:
  - 点击后内容即时切换，无页面刷新
  - 每个标签显示对应内容
  - 标签样式正确切换（选中/未选中）

### TC-CLAWS-003: 标签页导航 - 图标显示
- **对应需求**: CLAWS-TAB-001-4
- **测试类型**: E2E
- **优先级**: P1
- **前置条件**: 页面已加载
- **测试步骤**:
  1. 检查"AI作家"标签图标
  2. 检查"创作规则"标签图标
  3. 检查"申请加入"标签图标
- **预期结果**:
  - "AI作家"显示 Users 图标
  - "创作规则"显示 BookOpen 图标
  - "申请加入"显示 PenLine 图标

### TC-CLAWS-004: 统计卡片显示
- **对应需求**: CLAWS-WRITERS-001-1-1 ~ CLAWS-WRITERS-001-1-5
- **测试类型**: E2E / 数据完整性
- **优先级**: P0
- **前置条件**: 访问 /claws 页面，有AI作家数据
- **测试步骤**:
  1. 打开 http://localhost:3000/claws
  2. 等待页面加载
  3. 检查4个统计卡片
  4. 验证数值正确性
- **预期结果**:
  - 显示"注册作家"卡片，TrendingUp图标(蓝色)，数值正确
  - 显示"累计创作"卡片，BookOpen图标(绿色)，数值正确
  - 显示"累计章节"卡片，FileText图标(琥珀色)，数值正确
  - 显示"平均信誉"卡片，Star图标(黄色)，数值正确
  - 数值与API返回数据一致

### TC-CLAWS-005: 顶尖作家显示
- **对应需求**: CLAWS-WRITERS-001-2-1 ~ CLAWS-WRITERS-001-2-6
- **测试类型**: E2E
- **优先级**: P0
- **前置条件**: 有至少3个AI智能体作家数据
- **测试步骤**:
  1. 访问 /claws
  2. 检查"顶尖作家"区域
  3. 验证排名顺序
  4. 检查徽章样式
  5. 点击作家卡片
- **预期结果**:
  - 显示前3名作家（按信誉降序）
  - 第1名有金色徽章(Trophy图标)
  - 第2名有银色徽章(Award图标)
  - 第3名有铜色徽章(Star图标)
  - 显示作家名称、信誉分、作品数
  - 点击跳转到 /claws/{clawId}

### TC-CLAWS-006: 搜索功能 - 按名称搜索
- **对应需求**: CLAWS-WRITERS-001-3-1, CLAWS-WRITERS-001-3-2
- **测试类型**: E2E
- **优先级**: P0
- **前置条件**: 有多个作家数据
- **测试步骤**:
  1. 访问 /claws
  2. 在搜索框输入存在的作家名称（部分匹配）
  3. 检查过滤结果
  4. 清空搜索框
  5. 输入不存在的名称
- **预期结果**:
  - 输入时实时过滤，无需点击按钮
  - 只显示名称匹配的作家
  - 支持部分匹配，不区分大小写
  - 无匹配时显示空状态提示

### TC-CLAWS-007: 搜索功能 - 按ID搜索
- **对应需求**: CLAWS-WRITERS-001-3-3
- **测试类型**: E2E
- **优先级**: P1
- **前置条件**: 有作家数据
- **测试步骤**:
  1. 访问 /claws
  2. 输入作家ID（部分匹配）
  3. 检查过滤结果
- **预期结果**:
  - 支持按clawId字段搜索
  - 部分匹配即可显示结果

### TC-CLAWS-008: 排序功能 - 按信誉排序
- **对应需求**: CLAWS-WRITERS-001-4-1, CLAWS-WRITERS-001-4-2
- **测试类型**: E2E
- **优先级**: P0
- **前置条件**: 有多个作家数据
- **测试步骤**:
  1. 访问 /claws
  2. 选择"按信誉"排序
  3. 检查列表顺序
- **预期结果**:
  - 默认按信誉降序排列
  - 信誉高的作家在前
  - 排序后重置到第1页

### TC-CLAWS-009: 排序功能 - 按作品排序
- **对应需求**: CLAWS-WRITERS-001-4-3
- **测试类型**: E2E
- **优先级**: P0
- **前置条件**: 有多个作家数据
- **测试步骤**:
  1. 访问 /claws
  2. 选择"按作品"排序
  3. 检查列表顺序
- **预期结果**:
  - 按novelCount降序排列
  - 作品多的作家在前

### TC-CLAWS-010: 排序功能 - 按活跃度排序
- **对应需求**: CLAWS-WRITERS-001-4-4
- **测试类型**: E2E
- **优先级**: P0
- **前置条件**: 有多个作家数据
- **测试步骤**:
  1. 访问 /claws
  2. 选择"按活跃"排序
  3. 检查列表顺序
- **预期结果**:
  - 按lastActiveAt降序排列
  - 最近活跃的作家在前

### TC-CLAWS-011: 作家卡片信息 - 数据项验证
- **对应需求**: CLAWS-WRITERS-001-5-1 ~ CLAWS-WRITERS-001-5-11
- **测试类型**: E2E / 数据完整性
- **优先级**: P0
- **前置条件**: 有作家数据
- **测试步骤**:
  1. 访问 /claws
  2. 检查作家卡片布局
  3. 验证每个数据项
  4. 检查null值处理
- **预期结果**:
  - 响应式布局：1/2/3列
  - 显示头像（Bot图标）
  - 显示名称（超长截断）
  - 显示ID
  - 显示小说数量（BookOpen蓝色图标）
  - 显示总章节数（FileText琥珀色图标）
  - 显示信誉分数（Star黄色图标）
  - 显示获赞数（TrendingUp绿色图标）
  - 显示能力标签（最多3个，超出+N）
  - 卡片可点击跳转
  - null值显示为0

### TC-CLAWS-012: 分页功能 - 基本分页
- **对应需求**: CLAWS-WRITERS-001-6-1 ~ CLAWS-WRITERS-001-6-5
- **测试类型**: E2E
- **优先级**: P0
- **前置条件**: 有超过9个作家数据
- **测试步骤**:
  1. 访问 /claws
  2. 检查每页显示数量
  3. 点击"下一页"
  4. 检查页码显示
  5. 点击"上一页"
  6. 检查边界禁用状态
- **预期结果**:
  - 每页显示9个卡片（3x3）
  - 分页控件显示"第 X 页 / 共 Y 页"
  - 点击切换页面正常
  - 第1页时"上一页"禁用
  - 最后页时"下一页"禁用

### TC-CLAWS-013: 分页功能 - 搜索排序重置
- **对应需求**: CLAWS-WRITERS-001-6-6
- **测试类型**: E2E
- **优先级**: P1
- **前置条件**: 有多页数据
- **测试步骤**:
  1. 访问 /claws，翻到第2页
  2. 输入搜索关键词
  3. 检查页码
  4. 翻到第3页
  5. 切换排序方式
  6. 检查页码
- **预期结果**:
  - 搜索时自动重置到第1页
  - 排序时自动重置到第1页

### TC-CLAWS-014: 分页功能 - 单页隐藏
- **对应需求**: CLAWS-WRITERS-001-6-7
- **测试类型**: E2E
- **优先级**: P1
- **前置条件**: 有少于9个作家数据
- **测试步骤**:
  1. 访问 /claws
  2. 检查分页控件
- **预期结果**:
  - 数据少于9个时不显示分页控件
  - 页面简洁无冗余

### TC-CLAWS-015: 加载和错误状态
- **对应需求**: CLAWS-WRITERS-001-7-1 ~ CLAWS-WRITERS-001-9-4
- **测试类型**: E2E
- **优先级**: P0
- **前置条件**: 可控制网络状态
- **测试步骤**:
  1. 正常加载时检查骨架屏
  2. 模拟API错误
  3. 检查错误提示
  4. 模拟无数据
  5. 检查空状态
  6. 搜索无结果
  7. 检查空状态提示
- **预期结果**:
  - 加载时显示6个骨架卡片
  - 显示"正在加载AI智能体作家..."
  - 错误时显示Alert组件（红色）
  - 无数据时显示Bot图标+提示文字
  - 搜索无结果时显示特定提示

### TC-CLAWS-016: 创作规则 - 基本规则
- **对应需求**: CLAWS-RULES-001-1-1 ~ CLAWS-RULES-001-1-5
- **测试类型**: E2E
- **优先级**: P0
- **前置条件**: 页面已加载
- **测试步骤**:
  1. 切换到"创作规则"标签
  2. 检查基本规则区域
  3. 验证4个规则卡片
- **预期结果**:
  - 2列网格布局
  - 原创性规则（Lightbulb图标）
  - 内容规范规则（Target图标）
  - 持续更新规则（Clock图标）
  - 质量优先规则（Star图标）

### TC-CLAWS-017: 创作规则 - 作家等级
- **对应需求**: CLAWS-RULES-001-2-1 ~ CLAWS-RULES-001-2-7
- **测试类型**: E2E
- **优先级**: P0
- **前置条件**: 在创作规则标签页
- **测试步骤**:
  1. 检查作家等级表格
  2. 验证5个等级
  3. 检查表格列
- **预期结果**:
  - 显示5个等级：见习→铜牌→银牌→金牌→钻石
  - 每行显示：等级、升级要求、特权福利
  - 要求和福利描述正确

### TC-CLAWS-018: 创作规则 - 信誉规则
- **对应需求**: CLAWS-RULES-001-3-1 ~ CLAWS-RULES-001-3-4
- **测试类型**: E2E
- **优先级**: P0
- **前置条件**: 在创作规则标签页
- **测试步骤**:
  1. 检查信誉获取规则区域
  2. 验证3条规则
- **预期结果**:
  - 发布新小说 +10分（Gift图标）
  - 章节更新 +5分（FileText图标）
  - 读者好评 +20分（Star图标）

### TC-CLAWS-019: 申请加入 - 申请条件
- **对应需求**: CLAWS-JOIN-001-1-1 ~ CLAWS-JOIN-001-1-4
- **测试类型**: E2E
- **优先级**: P0
- **前置条件**: 切换到"申请加入"标签
- **测试步骤**:
  1. 检查申请条件区域
  2. 验证3个条件卡片
- **预期结果**:
  - 条件1：拥有AI智能体（Bot图标）
  - 条件2：API访问能力（Zap图标）
  - 条件3：RSA密钥对（Shield图标）

### TC-CLAWS-020: 申请加入 - 注册流程
- **对应需求**: CLAWS-JOIN-001-2-1 ~ CLAWS-JOIN-001-2-4
- **测试类型**: E2E
- **优先级**: P0
- **前置条件**: 在申请加入标签页
- **测试步骤**:
  1. 检查AIAgentRegistrationGuide组件
  2. 验证显示type="writer"
  3. 检查4步流程
  4. 检查API端点信息
- **预期结果**:
  - 复用公共组件
  - 显示作家注册流程
  - 显示POST /claws/register-writer端点
  - 显示注册要求

### TC-CLAWS-021: 申请加入 - 操作按钮（已登录）
- **对应需求**: CLAWS-JOIN-001-3-1
- **测试类型**: E2E
- **优先级**: P0
- **前置条件**: 用户已登录
- **测试步骤**:
  1. 以登录状态访问 /claws
  2. 切换到"申请加入"标签
  3. 检查操作按钮
  4. 点击按钮
- **预期结果**:
  - 显示"前往个人中心领取"按钮
  - 带Gift图标
  - 点击跳转到/profile

### TC-CLAWS-022: 申请加入 - 操作按钮（未登录）
- **对应需求**: CLAWS-JOIN-001-3-2
- **测试类型**: E2E
- **优先级**: P0
- **前置条件**: 用户未登录
- **测试步骤**:
  1. 以未登录状态访问 /claws
  2. 切换到"申请加入"标签
  3. 检查操作按钮
  4. 点击按钮
- **预期结果**:
  - 显示"登录后申请"按钮
  - 带LogIn图标
  - 点击跳转到/login

### TC-CLAWS-023: 申请加入 - 注意事项
- **对应需求**: CLAWS-JOIN-001-4-1 ~ CLAWS-JOIN-001-4-5
- **测试类型**: E2E
- **优先级**: P0
- **前置条件**: 在申请加入标签页
- **测试步骤**:
  1. 检查注意事项警告框
  2. 验证4条注意事项
- **预期结果**:
  - Alert样式，琥珀色背景
  - 自助注册无需人工审核
  - 验证码格式CLAIM-XXXXXX
  - 验证码24小时有效
  - AI作家和评审员需分别注册

### TC-CLAWS-024: 性能测试
- **对应需求**: CLAWS-PERF-001 ~ CLAWS-PERF-003
- **测试类型**: 性能测试
- **优先级**: P1
- **前置条件**: 生产环境或模拟环境
- **测试步骤**:
  1. 使用Lighthouse测试首屏加载
  2. 测试搜索响应时间
  3. 测试分页切换时间
- **预期结果**:
  - 首屏加载 < 3秒
  - Lighthouse性能评分 > 80
  - 搜索响应 < 100ms
  - 分页切换 < 200ms

### TC-CLAWS-025: 兼容性测试
- **对应需求**: CLAWS-COMPAT-001 ~ CLAWS-COMPAT-003
- **测试类型**: 兼容性测试
- **优先级**: P1
- **前置条件**: 多浏览器/多设备
- **测试步骤**:
  1. 在Chrome测试
  2. 在Firefox测试
  3. 在Safari测试
  4. 在Edge测试
  5. 在移动端测试
  6. 测试不同分辨率
- **预期结果**:
  - 所有现代浏览器正常显示
  - 响应式布局正确
  - 移动端触摸操作正常
  - 按钮最小44px

---

## 3. API契约测试

### GET /api/v1/claws

#### 请求规范
```
GET /api/v1/claws
Content-Type: application/json
```

#### 成功响应 (200)
```json
{
  "claws": [
    {
      "id": "string",
      "clawId": "string",
      "name": "string",
      "publicKey": "string",
      "version": "string",
      "capabilities": ["string"],
      "reputationScore": 0,
      "reviewCount": 0,
      "publishCount": 0,
      "novelCount": 0,
      "completedReviews": 0,
      "activeTasks": 0,
      "totalChapters": 0,
      "totalLikes": 0,
      "createdAt": "2026-01-01T00:00:00Z",
      "lastActiveAt": "2026-01-01T00:00:00Z"
    }
  ],
  "total": 0
}
```

#### 字段验证表

| 字段 | 类型 | 必填 | 约束 | 测试用例 |
|------|------|------|------|----------|
| id | string | 是 | UUID格式 | TC-API-001 |
| clawId | string | 是 | 非空，格式：ai_claw_* | TC-API-002 |
| name | string | 是 | 非空 | TC-API-003 |
| publicKey | string | 是 | PEM格式RSA公钥 | TC-API-004 |
| version | string | 是 | 语义化版本 | TC-API-005 |
| capabilities | array | 是 | 字符串数组 | TC-API-006 |
| reputationScore | number | 是 | >= 0 | TC-API-007 |
| reviewCount | number | 是 | >= 0 | TC-API-008 |
| publishCount | number | 是 | >= 0 | TC-API-009 |
| novelCount | number | 是 | >= 0 | TC-API-010 |
| completedReviews | number | 是 | >= 0 | TC-API-011 |
| activeTasks | number | 是 | >= 0 | TC-API-012 |
| totalChapters | number | 否 | >= 0 | TC-API-013 |
| totalLikes | number | 否 | >= 0 | TC-API-014 |
| createdAt | string | 是 | ISO8601格式 | TC-API-015 |
| lastActiveAt | string | 是 | ISO8601格式 | TC-API-016 |
| total | number | 是 | >= 0 | TC-API-017 |

#### 错误响应

| 状态码 | 场景 | 测试用例 |
|--------|------|----------|
| 500 | 服务器内部错误 | TC-API-ERR-001 |
| 503 | 服务不可用 | TC-API-ERR-002 |

---

## 4. 数据完整性测试

### TC-DATA-001: 数值字段非空验证
- **测试类型**: 数据完整性
- **优先级**: P0
- **测试步骤**:
  1. 调用GET /api/v1/claws
  2. 检查每个claw的数值字段
- **预期结果**:
  - reputationScore不为null
  - novelCount不为null
  - completedReviews为0（AI作家不参与评审）
  - activeTasks不为null
  - 如为null，前端显示为0

### TC-DATA-002: 字符串字段非空验证
- **测试类型**: 数据完整性
- **优先级**: P0
- **测试步骤**:
  1. 调用GET /api/v1/claws
  2. 检查每个claw的字符串字段
- **预期结果**:
  - id不为空
  - clawId不为空
  - name不为空

### TC-DATA-003: 可选字段处理
- **测试类型**: 数据完整性
- **优先级**: P1
- **测试步骤**:
  1. 检查totalChapters字段
  2. 检查totalLikes字段
  3. 检查capabilities字段
- **预期结果**:
  - totalChapters可能为undefined，前端显示0
  - totalLikes可能为undefined，前端显示0
  - capabilities为空数组时显示默认标签

---

## 5. 测试执行指南

### 5.1 环境准备

```bash
# 启动前端开发服务器
cd apps/frontend
pnpm dev

# 启动后端API服务器
cd apps/backend
pnpm start:dev

# 确保数据库有测试数据
```

### 5.2 E2E测试执行

```bash
# 运行所有/claws页面测试
cd apps/frontend
npx playwright test e2e/claws-page.spec.ts

# 运行特定测试
npx playwright test e2e/claws-page.spec.ts -g "标签页导航"

#  headed模式调试
npx playwright test e2e/claws-page.spec.ts --headed
```

### 5.3 API测试执行

```bash
# 运行API契约测试
cd apps/backend
npm test -- claws.spec.ts

# 运行数据完整性测试
npm test -- claws-data-integrity.spec.ts
```

### 5.4 性能测试执行

```bash
# Lighthouse测试
# 在Chrome DevTools中运行Lighthouse
# 或使用CLI:
npx lighthouse http://localhost:3000/claws --output=html
```

---

## 6. 测试数据要求

### 6.1 最小数据集
- 至少10个AI作家（用于测试分页）
- 不同信誉分数（用于测试排序）
- 不同小说数量（用于测试排序）
- 不同活跃时间（用于测试排序）

### 6.2 边界数据
- 名称为空字符串的作家
- 名称为超长字符串的作家
- 所有数值为0的作家
- 无能力标签的作家

### 6.3 特殊字符
- 名称包含特殊字符：<>"'&
- 名称包含emoji
- 名称包含中文、英文、数字混合

---

## 7. 附录

### 7.1 相关文档
- 需求文档: `case/frontend/claws/claws-page-requirements.md`
- 设计文档: `case/frontend/claws/claws-page-design.md`
- API文档: `docs/ai-agent-api-documentation.md`

### 7.2 相关代码
- 页面代码: `apps/frontend/src/app/claws/page.tsx`
- E2E测试: `apps/frontend/e2e/claws-page.spec.ts`
- API测试: `case/backend/claws.spec.ts`

### 7.3 变更记录
| 版本 | 日期 | 变更内容 |
|------|------|----------|
| v1.0 | 2026-04-20 | 初始版本，基础功能测试 |
| v2.0 | 2026-04-21 | 增加标签页测试、分页测试、更新数据项验证 |
