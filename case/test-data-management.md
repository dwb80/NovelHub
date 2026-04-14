# NovelHub 测试数据管理规范

**文档版本**: v1.0  
**编制日期**: 2026-04-12  
**适用范围**: 所有测试活动中的数据管理

---

## 1. 测试数据管理概述

### 1.1 管理目标

- 确保测试数据的一致性、完整性和可追溯性
- 提高测试数据准备效率
- 保护敏感数据安全
- 支持自动化测试执行

### 1.2 数据分类

| 分类 | 说明 | 示例 |
|------|------|------|
| 基础数据 | 系统运行的基础数据 | 用户账号、小说分类 |
| 业务数据 | 业务流程相关的数据 | 小说内容、评论 |
| 测试专用数据 | 为测试创建的数据 | 测试用户、测试小说 |
| 边界数据 | 用于边界测试的数据 | 超长字符串、特殊字符 |
| 性能数据 | 用于性能测试的数据 | 大量数据、大数据集 |

---

## 2. 测试数据目录结构

```
case/
├── test-data/
│   ├── README.md                    # 测试数据说明
│   ├── data-dictionary.md           # 数据字典
│   ├──
│   ├── users/                       # 用户相关数据
│   │   ├── valid-users.json         # 有效用户
│   │   ├── invalid-users.json       # 无效用户数据
│   │   ├── boundary-users.json      # 边界值用户
│   │   └── test-accounts.yaml       # 测试账号配置
│   │
│   ├── novels/                      # 小说相关数据
│   │   ├── sample-novels.json       # 样例小说
│   │   ├── vip-novels.json          # VIP小说
│   │   ├── novel-categories.json    # 小说分类
│   │   └── long-content/            # 长文本内容
│   │
│   ├── chapters/                    # 章节相关数据
│   │   ├── sample-chapters.json     # 样例章节
│   │   ├── chapter-templates/       # 章节模板
│   │   └── large-chapters/          # 大章节文件
│   │
│   ├── comments/                    # 评论相关数据
│   │   ├── sample-comments.json     # 样例评论
│   │   └── spam-comments.json       # 垃圾评论（安全测试）
│   │
│   ├── bookshelf/                   # 书架相关数据
│   │   ├── empty-bookshelf.json     # 空书架
│   │   └── full-bookshelf.json      # 满书架
│   │
│   ├── boundary/                    # 边界测试数据
│   │   ├── string-boundary.json     # 字符串边界
│   │   ├── number-boundary.json     # 数字边界
│   │   ├── date-boundary.json       # 日期边界
│   │   └── special-chars.json       # 特殊字符
│   │
│   ├── security/                    # 安全测试数据
│   │   ├── xss-payloads.json        # XSS攻击载荷
│   │   ├── sql-injection.json       # SQL注入
│   │   └── csrf-tests.json          # CSRF测试
│   │
│   ├── performance/                 # 性能测试数据
│   │   ├── load-test-data.sql       # 负载测试数据
│   │   ├── stress-test-config.yaml  # 压力测试配置
│   │   └── benchmark-data/          # 基准测试数据
│   │
│   └── fixtures/                    # 测试夹具
│       ├── init-data.sql            # 初始数据
│       ├── cleanup.sql              # 清理脚本
│       └── reset-data.sql           # 重置脚本
```

---

## 3. 测试数据命名规范

### 3.1 文件命名规范

```
[数据类型]_[描述]_[版本].[格式]
```

**示例**:
- `valid_users_v1.0.json`
- `boundary_string_length_v1.0.json`
- `performance_load_100k_v1.0.sql`

### 3.2 数据记录命名规范

```
[类型前缀]_[模块]_[描述]_[序号]
```

| 前缀 | 含义 | 示例 |
|------|------|------|
| USER | 用户数据 | USER_VALID_001 |
| NV | 小说数据 | NV_VIP_001 |
| CH | 章节数据 | CH_LONG_001 |
| CM | 评论数据 | CM_SPAM_001 |
| BS | 书架数据 | BS_EMPTY_001 |
| BDY | 边界数据 | BDY_MAX_001 |
| SEC | 安全测试数据 | SEC_XSS_001 |

---

## 4. 测试数据格式规范

### 4.1 JSON数据格式

```json
{
  "metadata": {
    "version": "1.0",
    "created_at": "2026-04-12",
    "description": "有效用户测试数据",
    "count": 10
  },
  "data": [
    {
      "id": "USER_VALID_001",
      "username": "test_user_001",
      "email": "test001@example.com",
      "password": "Test@123456",
      "status": "active",
      "created_at": "2026-01-01T00:00:00Z",
      "tags": ["valid", "standard"]
    }
  ]
}
```

### 4.2 YAML数据格式

```yaml
metadata:
  version: "1.0"
  created_at: "2026-04-12"
  description: "测试账号配置"

test_accounts:
  - id: "USER_ADMIN_001"
    role: "admin"
    username: "admin_test"
    password: "Admin@123456"
    email: "admin@test.com"
    status: "active"
    
  - id: "USER_NORMAL_001"
    role: "user"
    username: "user_test"
    password: "User@123456"
    email: "user@test.com"
    status: "active"
```

### 4.3 SQL数据格式

```sql
-- 测试数据插入脚本
-- 版本: 1.0
-- 创建时间: 2026-04-12
-- 描述: 初始化测试用户数据

-- 清理已有数据
DELETE FROM users WHERE username LIKE 'test_%';

-- 插入测试用户
INSERT INTO users (id, username, email, password, status, created_at) VALUES
('USER_001', 'test_user_001', 'test001@example.com', '$2a$10$...', 'active', NOW()),
('USER_002', 'test_user_002', 'test002@example.com', '$2a$10$...', 'active', NOW());

-- 插入测试小说
INSERT INTO novels (id, title, author, category, status, is_vip) VALUES
('NV_001', '测试小说001', '测试作者', '玄幻', 'ongoing', false),
('NV_002', 'VIP测试小说', '测试作者', '科幻', 'ongoing', true);
```

---

## 5. 敏感数据处理

### 5.1 敏感数据定义

| 数据类型 | 敏感级别 | 处理方式 |
|----------|----------|----------|
| 真实用户密码 | 高 | 禁止使用，使用测试密码 |
| 真实邮箱 | 高 | 使用测试邮箱 (@example.com) |
| 手机号 | 高 | 使用测试号段 (13800138000) |
| 身份证号 | 高 | 使用测试号码 |
| 银行卡号 | 高 | 使用测试卡号 |
| 真实姓名 | 中 | 使用化名 |
| 真实地址 | 中 | 使用虚构地址 |

### 5.2 数据脱敏规则

```javascript
// 密码脱敏 - 显示为掩码
function maskPassword(password) {
  return '*'.repeat(password.length);
}

// 邮箱脱敏 - 显示部分
function maskEmail(email) {
  const [name, domain] = email.split('@');
  return name.charAt(0) + '*'.repeat(name.length - 2) + name.charAt(name.length - 1) + '@' + domain;
}

// 手机号脱敏
function maskPhone(phone) {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}
```

### 5.3 测试数据安全原则

1. **禁止使用生产数据**: 测试环境禁止使用生产环境真实数据
2. **数据隔离**: 测试数据与生产数据物理隔离
3. **定期清理**: 定期清理过期测试数据
4. **访问控制**: 测试数据访问需授权
5. **加密存储**: 敏感测试数据加密存储

---

## 6. 测试数据生命周期

### 6.1 生命周期流程

```
需求分析 -> 数据设计 -> 数据创建 -> 数据验证 -> 数据使用 -> 数据清理
```

### 6.2 各阶段职责

| 阶段 | 负责人 | 输出物 |
|------|--------|--------|
| 需求分析 | 测试分析师 | 数据需求文档 |
| 数据设计 | 测试架构师 | 数据设计方案 |
| 数据创建 | 测试工程师 | 测试数据文件 |
| 数据验证 | 测试工程师 | 数据验证报告 |
| 数据使用 | 测试执行人员 | 测试执行记录 |
| 数据清理 | 运维工程师 | 清理日志 |

### 6.3 数据版本管理

```
test-data/
├── current/           # 当前版本数据（软链接）
├── v1.0/             # 版本1.0
├── v1.1/             # 版本1.1
├── v2.0/             # 版本2.0
└── archive/          # 归档数据
```

---

## 7. 自动化测试数据管理

### 7.1 数据准备脚本

```javascript
// test-data/setup.js
const { setupTestData, cleanupTestData } = require('./utils');

async function setup() {
  // 加载测试数据
  await setupTestData({
    users: './users/valid-users.json',
    novels: './novels/sample-novels.json',
    chapters: './chapters/sample-chapters.json'
  });
}

async function cleanup() {
  // 清理测试数据
  await cleanupTestData(['users', 'novels', 'chapters']);
}

module.exports = { setup, cleanup };
```

### 7.2 数据工厂模式

```javascript
// test-data/factories/user-factory.js
class UserFactory {
  static create(overrides = {}) {
    return {
      id: `USER_${Date.now()}`,
      username: `test_user_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'Test@123456',
      status: 'active',
      created_at: new Date().toISOString(),
      ...overrides
    };
  }

  static createBatch(count, overrides = {}) {
    return Array.from({ length: count }, (_, i) => 
      this.create({ ...overrides, id: `USER_BATCH_${i}` })
    );
  }
}

module.exports = UserFactory;
```

### 7.3 数据清理策略

```javascript
// test-data/cleanup.js
const cleanupStrategies = {
  // 测试完成后清理
  afterEach: async () => {
    await db.query('DELETE FROM test_data WHERE created_at < NOW() - INTERVAL 1 HOUR');
  },
  
  // 测试套件完成后清理
  afterAll: async () => {
    await db.query('TRUNCATE TABLE test_users, test_novels');
  },
  
  // 定时清理
  scheduled: async () => {
    await db.query('DELETE FROM test_data WHERE created_at < NOW() - INTERVAL 7 DAYS');
  }
};
```

---

## 8. 测试数据质量检查

### 8.1 质量检查清单

- [ ] 数据格式正确（JSON/YAML/SQL语法）
- [ ] 数据完整性（必填字段完整）
- [ ] 数据一致性（关联数据一致）
- [ ] 数据有效性（符合业务规则）
- [ ] 无敏感信息泄露
- [ ] 数据可重复创建
- [ ] 数据可清理

### 8.2 自动化检查脚本

```bash
#!/bin/bash
# test-data/validate.sh

echo "开始验证测试数据..."

# 验证JSON格式
for file in $(find . -name "*.json"); do
  if ! jq empty "$file" 2>/dev/null; then
    echo "错误: $file JSON格式不正确"
    exit 1
  fi
done

# 验证YAML格式
for file in $(find . -name "*.yaml" -o -name "*.yml"); do
  if ! python3 -c "import yaml; yaml.safe_load(open('$file'))" 2>/dev/null; then
    echo "错误: $file YAML格式不正确"
    exit 1
  fi
done

# 检查敏感数据
if grep -r "password.*=.*[^*]" --include="*.json" --include="*.yaml" .; then
  echo "警告: 发现明文密码"
fi

echo "测试数据验证完成"
```

---

## 9. 测试数据文档模板

### 9.1 数据说明文档模板

```markdown
# [数据名称] 说明文档

## 基本信息
- **数据ID**: [唯一标识]
- **数据版本**: [版本号]
- **创建日期**: [日期]
- **创建人**: [姓名]
- **更新日期**: [日期]

## 数据描述
[数据用途和描述]

## 数据字段说明

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| [字段名] | [类型] | [是/否] | [说明] | [示例] |

## 使用场景
- [场景1]
- [场景2]

## 关联数据
- [关联数据1]
- [关联数据2]

## 注意事项
- [注意事项1]
- [注意事项2]
```

---

**编制**: 测试数据管理员  
**审核**: 待审核  
**更新日期**: 2026-04-12
