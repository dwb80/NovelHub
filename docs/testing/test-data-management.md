# NovelHub 测试数据管理规范

**版本**: v1.0  
**更新日期**: 2026-04-12

---

## 1. 测试数据分类

### 1.1 按数据类型分类

| 分类 | 说明 | 示例 |
|------|------|------|
| **基础数据** | 系统运行必需数据 | 用户账号、分类数据、配置项 |
| **业务数据** | 业务场景相关数据 | 小说、章节、评论、书架 |
| **测试专用数据** | 特定测试场景数据 | 边界值数据、异常数据 |
| **性能测试数据** | 性能测试使用数据 | 大量小说、大量用户 |

### 1.2 按环境分类

| 环境 | 数据特点 | 管理方式 |
|------|----------|----------|
| **开发环境** | 个人开发使用 | 本地管理 |
| **测试环境** | 团队共享 | 版本控制 |
| **预发布环境** | 接近生产 | 定期同步 |
| **生产环境** | 真实用户数据 | 严格保护 |

---

## 2. 测试数据标准

### 2.1 用户数据标准

```json
{
  "user_standard": {
    "username": {
      "min_length": 3,
      "max_length": 20,
      "allowed_chars": "a-zA-Z0-9_",
      "pattern": "^[a-zA-Z0-9_]{3,20}$"
    },
    "email": {
      "format": "email",
      "domains": ["test.com", "example.com"]
    },
    "password": {
      "min_length": 8,
      "max_length": 128,
      "requirements": ["uppercase", "lowercase", "number"]
    }
  }
}
```

### 2.2 小说数据标准

```json
{
  "novel_standard": {
    "title": {
      "min_length": 2,
      "max_length": 200,
      "forbidden_chars": ["<", ">", "&"]
    },
    "summary": {
      "max_length": 2000,
      "optional": true
    },
    "cover": {
      "formats": ["jpg", "png", "webp"],
      "max_size": "5MB",
      "dimensions": "600x800"
    },
    "tags": {
      "max_count": 5,
      "max_length_per_tag": 20
    }
  }
}
```

### 2.3 章节数据标准

```json
{
  "chapter_standard": {
    "title": {
      "min_length": 1,
      "max_length": 100
    },
    "content": {
      "min_length": 100,
      "max_length": 50000,
      "format": "html"
    },
    "word_count": {
      "min": 100,
      "max": 20000
    }
  }
}
```

---

## 3. 测试数据集

### 3.1 用户测试数据集

#### 标准用户
```json
{
  "standard_users": [
    {
      "id": "test_user_001",
      "username": "testreader",
      "email": "reader@test.com",
      "password": "Test@123456",
      "role": "reader",
      "status": "active"
    },
    {
      "id": "test_user_002",
      "username": "testauthor",
      "email": "author@test.com",
      "password": "Test@123456",
      "role": "author",
      "status": "active"
    },
    {
      "id": "test_user_003",
      "username": "testadmin",
      "email": "admin@test.com",
      "password": "Test@123456",
      "role": "admin",
      "status": "active"
    }
  ]
}
```

#### 边界用户
```json
{
  "boundary_users": [
    {
      "description": "最短用户名",
      "username": "abc",
      "email": "min@test.com"
    },
    {
      "description": "最长用户名",
      "username": "this_is_max_length_20",
      "email": "max@test.com"
    },
    {
      "description": "特殊字符邮箱",
      "username": "special",
      "email": "user+tag@test.com"
    }
  ]
}
```

### 3.2 小说测试数据集

#### 标准小说
```json
{
  "standard_novels": [
    {
      "id": "nv_001",
      "title": "测试小说一：修仙传奇",
      "author_id": "test_user_002",
      "category": "仙侠",
      "tags": ["修仙", "热血", "升级"],
      "status": "ongoing",
      "word_count": 100000,
      "chapter_count": 50
    },
    {
      "id": "nv_002",
      "title": "测试小说二：都市异能",
      "author_id": "test_user_002",
      "category": "都市",
      "tags": ["异能", "爽文", "系统"],
      "status": "completed",
      "word_count": 500000,
      "chapter_count": 200
    }
  ]
}
```

#### 边界小说
```json
{
  "boundary_novels": [
    {
      "id": "nv_boundary_001",
      "title": "最",
      "description": "最短标题小说"
    },
    {
      "id": "nv_boundary_002",
      "title": "这是一个非常长的标题用于测试系统在标题超长时的显示行为和处理逻辑确保不会出现布局错乱或者文字溢出",
      "description": "最长标题小说"
    },
    {
      "id": "nv_boundary_003",
      "title": "零章小说",
      "chapter_count": 0,
      "description": "无章节小说"
    }
  ]
}
```

### 3.3 章节测试数据集

```json
{
  "standard_chapters": [
    {
      "id": "ch_001_001",
      "novel_id": "nv_001",
      "title": "第一章：初入仙