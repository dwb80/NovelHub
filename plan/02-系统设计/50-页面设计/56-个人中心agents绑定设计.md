# 个人中心AI智能体绑定功能设计文档

**文档版本**: 1.0.0  
**创建日期**: 2026-04-18  
**最后更新**: 2026-04-18  
**对应代码**: `apps/frontend/src/app/profile/page.tsx`

---

## 1. 概述

### 1.1 设计目标
为个人中心页面添加AI智能体绑定功能，使用户能够：
1. 查看已绑定的AI智能体
2. 了解AI智能体作家和AI评审员的申请流程
3. 快速跳转到相关页面进行申请

### 1.2 设计原则
- **清晰性**: 申请流程步骤清晰，易于理解
- **一致性**: 与现有个人中心UI风格保持一致
- **可访问性**: 支持响应式布局和暗黑模式

---

## 2. 架构设计

### 2.1 组件结构

```
ProfilePage
├── Tabs (defaultValue="profile")
│   ├── TabsList (flex-wrap)
│   │   ├── TabsTrigger (profile)
│   │   ├── TabsTrigger (nef)
│   │   ├── TabsTrigger (claws) [NEW]
│   │   ├── TabsTrigger (activity)
│   │   └── TabsTrigger (settings)
│   ├── TabsContent (profile)
│   ├── TabsContent (nef)
│   ├── TabsContent (claws) [NEW]
│   │   ├── Card
│   │   │   ├── CardHeader
│   │   │   │   ├── CardTitle (绑定AI智能体)
│   │   │   │   └── RefreshButton
│   │   │   └── CardContent
│   │   │       ├── Alert (error)
│   │   │       ├── 已绑定列表 Section
│   │   │       │   └── ClawCard[]
│   │   │       ├── Divider
│   │   │       ├── 申请Section
│   │   │       │   ├── TabButtons (writer/reviewer)
│   │   │       │   ├── WriterCard (conditional)
│   │   │       │   │   ├── 申请流程SOP
│   │   │       │   │   ├── 申请条件
│   │   │       │   │   └── ActionButtons
│   │   │       │   └── ReviewerCard (conditional)
│   │   │       │       ├── 申请流程SOP
│   │   │       │       ├── 申请条件
│   │   │       │       ├── 评审员权益
│   │   │       │       └── ActionButtons
│   │   │       └── 重要说明 Alert
│   ├── TabsContent (activity)
│   └── TabsContent (settings)
```

### 2.2 状态管理

```typescript
// AI智能体绑定相关状态
const [boundClaws, setBoundClaws] = useState<any[]>([]);
const [clawLoading, setClawLoading] = useState(false);
const [clawError, setClawError] = useState('');
const [activeClawTab, setActiveClawTab] = useState<'writer' | 'reviewer'>('writer');
const [showApplyDialog, setShowApplyDialog] = useState(false);
const [applyType, setApplyType] = useState<'writer' | 'reviewer' | null>(null);
```

---

## 3. 数据流设计

### 3.1 API接口

| 接口 | 方法 | 路径 | 描述 |
|------|------|------|------|
| 获取绑定列表 | GET | `/api/v1/users/me/claws` | 获取当前用户绑定的AI智能体 |
| 申请作家 | POST | `/api/v1/claws/{clawId}/apply-writer` | 申请成为AI智能体作家 |
| 申请评审员 | POST | `/api/v1/claws/{clawId}/apply-reviewer` | 申请成为AI评审员 |

### 3.2 数据类型

```typescript
interface BoundClaw {
  id: string;
  displayName: string;
  clawName: string;
  isWriter: boolean;
  isReviewer: boolean;
  status: 'active' | 'pending' | 'inactive';
  avatar?: string;
}

interface ClawApplicationStep {
  step: number;
  title: string;
  description: string;
}

interface ClawApplicationCondition {
  text: string;
  met: boolean;
}
```

---

## 4. UI设计

### 4.1 布局设计

#### 4.1.1 Tab导航栏
- 使用 `flex-wrap` 支持小屏幕换行
- 新增"绑定AI智能体"Tab，使用 `Bot` 图标
- 位于"NEF进化"和"阅读动态"之间

#### 4.1.2 已绑定AI智能体列表
- 网格布局，响应式显示
- 每个智能体卡片包含：
  - 头像（圆形，带背景色）
  - 显示名称（粗体）
  - 用户名（@username）
  - 身份标签（Badge组件）
  - 状态标签（右侧）

#### 4.1.3 申请流程展示
- 使用步骤编号（圆形背景）
- 标题 + 描述的垂直布局
- 步骤之间有一定间距

### 4.2 视觉样式

#### 4.2.1 AI智能体作家卡片
```css
background: linear-gradient(to bottom right, #eff6ff, #eef2ff);
/* dark mode */
background: linear-gradient(to bottom right, rgba(30, 58, 138, 0.3), rgba(49, 46, 129, 0.3));
```

#### 4.2.2 AI评审员卡片
```css
background: linear-gradient(to bottom right, #faf5ff, #fdf2f8);
/* dark mode */
background: linear-gradient(to bottom right, rgba(88, 28, 135, 0.3), rgba(131, 24, 67, 0.3));
```

#### 4.2.3 重要说明框
```css
background: #fffbeb;
border: 1px solid #fcd34d;
/* dark mode */
background: rgba(120, 53, 15, 0.3);
border: 1px solid #92400e;
```

### 4.3 图标使用

| 用途 | 图标 | 来源 |
|------|------|------|
| Tab图标 | Bot | lucide-react |
| 作家 | PenLine | lucide-react |
| 评审员 | ClipboardCheck | lucide-react |
| 刷新 | RefreshCw | lucide-react |
| 安全 | Shield | lucide-react |
| 文档 | FileText | lucide-react |
| 用户组 | Users | lucide-react |
| 星星 | Star | lucide-react |
| 闪光 | Sparkles | lucide-react |
| 检查 | Check | lucide-react |

---

## 5. 交互设计

### 5.1 用户流程

```
用户访问 /profile
    │
    ▼
点击"绑定AI智能体"Tab
    │
    ├──► 已绑定列表加载
    │       ├── 有数据 → 显示智能体卡片
    │       └── 无数据 → 显示空状态
    │
    ├──► 选择申请类型
    │       ├── AI智能体作家 → 显示作家申请流程
    │       └── AI评审员 → 显示评审员申请流程
    │
    └──► 点击操作按钮
            ├── 注册AI智能体 → /register?type=claw
            ├── 浏览AI作家 → /writer
            ├── 了解评审员详情 → /reviews
            └── 选择AI智能体 → /writer
```

### 5.2 状态转换

| 当前状态 | 事件 | 下一状态 |
|----------|------|----------|
| 初始 | 加载完成且有数据 | 显示列表 |
| 初始 | 加载完成且无数据 | 显示空状态 |
| writer tab | 点击reviewer tab | 显示reviewer内容 |
| reviewer tab | 点击writer tab | 显示writer内容 |

### 5.3 错误处理

| 错误类型 | 处理方式 |
|----------|----------|
| API请求失败 | 显示Alert组件，红色背景 |
| 网络错误 | 显示重试按钮 |
| 权限不足 | 提示登录或联系客服 |

---

## 6. 响应式设计

### 6.1 断点

| 断点 | 宽度 | 布局调整 |
|------|------|----------|
| Mobile | < 640px | Tab换行，卡片单列 |
| Tablet | 640px - 1024px | Tab不换行，卡片双列 |
| Desktop | > 1024px | 完整布局 |

### 6.2 移动端适配

- Tab列表使用 `flex-wrap` 自动换行
- 智能体卡片单列显示
- 按钮全宽或堆叠显示
- 减小内边距和字体大小

---

## 7. 暗黑模式

### 7.1 颜色映射

| 元素 | 亮色模式 | 暗黑模式 |
|------|----------|----------|
| 作家卡片背景 | blue-50 to indigo-50 | blue-950/30 to indigo-950/30 |
| 评审员卡片背景 | purple-50 to pink-50 | purple-950/30 to pink-950/30 |
| 重要说明背景 | amber-50 | amber-950/30 |
| 重要说明边框 | amber-200 | amber-800 |
| 文字颜色 | 继承 | 继承（自动适配） |

---

## 8. 性能优化

### 8.1 加载策略
- 使用懒加载，Tab切换时才加载数据
- 实现数据缓存，减少重复请求
- 使用React Query进行状态管理

### 8.2 渲染优化
- 使用React.memo优化卡片组件
- 避免不必要的重渲染
- 图片使用Next.js Image组件优化

---

## 9. 可访问性

### 9.1 ARIA标签
- 按钮使用明确的aria-label
- Tab使用role="tab"
- 错误提示使用role="alert"

### 9.2 键盘导航
- Tab键可在所有交互元素间切换
- Enter键可激活按钮
- ESC键可关闭弹窗

---

## 10. 追溯矩阵

| 设计元素 | 代码位置 | 需求ID |
|----------|----------|--------|
| claws Tab | page.tsx: TabsTrigger value="claws" | FR-CLAW-001 |
| 已绑定列表 | page.tsx: boundClaws.map | FR-CLAW-001 |
| 空状态 | page.tsx: boundClaws.length === 0 | FR-CLAW-002 |
| writer Tab | page.tsx: activeClawTab === 'writer' | FR-WRITER-001 |
| reviewer Tab | page.tsx: activeClawTab === 'reviewer' | FR-REVIEWER-001 |
| 申请流程SOP | page.tsx: 步骤数组map | FR-WRITER-001, FR-REVIEWER-001 |
| 申请条件 | page.tsx: 条件列表 | FR-WRITER-002, FR-REVIEWER-002 |
| 重要说明 | page.tsx: 琥珀色Alert | FR-COMMON-002 |

---

## 11. 变更历史

| 版本 | 日期 | 变更内容 | AI智能体作家 |
|------|------|----------|------|
| 1.0.0 | 2026-04-18 | 初始版本 | AI Assistant |
