# NovelHub API 标准规范

**版本**: v1.0  
**更新日期**: 2026-04-12

---

## 1. 接口设计原则

### 1.1 RESTful 设计规范

| 原则 | 说明 | 示例 |
|------|------|------|
| **资源命名** | 使用名词复数形式 | `/api/novels`, `/api/users` |
| **HTTP方法** | 使用标准HTTP方法 | GET, POST, PUT, DELETE, PATCH |
| **状态码** | 使用标准HTTP状态码 | 200, 201, 400, 401, 404, 500 |
| **版本控制** | URL中包含版本号 | `/api/v1/novels` |
| **过滤排序** | 使用查询参数 | `?category=仙侠&sort=update` |

### 1.2 HTTP 方法使用

| 方法 | 用途 | 幂等性 |
|------|------|--------|
| **GET** | 获取资源 | 是 |
| **POST** | 创建资源 | 否 |
| **PUT** | 完整更新资源 | 是 |
| **PATCH** | 部分更新资源 | 否 |
| **DELETE** | 删除资源 | 是 |

---

## 2. 接口响应格式

### 2.1 标准响应结构

```json
{
  "code": 200,
  "message": "success",
  "data": {},
  "meta": {
    "timestamp": "2026-04-12T10:30:00Z",
    "requestId": "req_123456789",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

### 2.2 成功响应示例

#### 单资源响应
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "nv_001",
    "title": "修仙传奇",
    "author": {
      "id": "usr_001",
      "username": "author1"
    },
    "category": "仙侠",
    "status": "ongoing",
    "wordCount": 100000,
    "chapterCount": 50,
    "createdAt": "2026-01-01T00:00:00Z",
    "updatedAt": "2026-04-12T10:00:00Z"
  },
  "meta": {
    "timestamp": "2026-04-12T10:30:00Z",
    "requestId": "req_123456789"
  }
}
```

#### 列表响应
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "nv_001",
      "title": "修仙传奇",
      "cover": "https://example.com/cover1.jpg"
    },
    {
      "id": "nv_002",
      "title": "都市异能",
      "cover": "https://example.com/cover2.jpg"
    }
  ],
  "meta": {
    "timestamp": "2026-04-12T10:30:00Z",
    "requestId": "req_123456790",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

### 2.3 错误响应格式

```json
{
  "code": 400,
  "message": "请求参数错误",
  "errors": [
    {
      "field": "title",
      "message": "标题不能为空",
      "code": "VALIDATION_REQUIRED"
    },
    {
      "field": "email",
      "message": "邮箱格式不正确",
      "code": "VALIDATION_FORMAT"
    }
  ],
  "meta": {
    "timestamp": "2026-04-12T10:30:00Z",
    "requestId": "req_123456791"
  }
}
```

---

## 3. HTTP 状态码

### 3.1 标准状态码

| 状态码 | 含义 | 使用场景 |
|--------|------|----------|
| **200** | OK | 请求成功 |
| **201** | Created | 资源创建成功 |
| **204** | No Content | 删除成功，无返回内容 |
| **400** | Bad Request | 请求参数错误 |
| **401** | Unauthorized | 未认证 |
| **403** | Forbidden | 无权限 |
| **404** | Not Found | 资源不存在 |
| **409** | Conflict | 资源冲突 |
| **422** | Unprocessable Entity | 业务逻辑错误 |
| **429** | Too Many Requests | 请求频率限制 |
| **500** | Internal Server Error | 服务器内部错误 |
| **503** | Service Unavailable | 服务不可用 |

### 3.2 业务状态码

| 状态码 | 含义 | 说明 |
|--------|------|------|
| **2000** | 成功 | 通用成功 |
| **4001** | 参数验证失败 | 请求参数不符合要求 |
| **4002** | 资源已存在 | 重复创建 |
| **4003** | 资源不存在 | 访问不存在的资源 |
| **4004** | 余额不足 | 支付相关 |
| **4005** | 权限不足 | 操作无权限 |
| **4006** | 频率限制 | 请求过于频繁 |
| **5001** | 系统错误 | 内部服务错误 |

---

## 4. 请求规范

### 4.1 请求头

| 请求头 | 必填 | 说明 | 示例 |
|--------|------|------|------|
| **Content-Type** | 是 | 内容类型 | `application/json` |
| **Authorization** | 条件 | 认证令牌 | `Bearer eyJhbG...` |
| **X-Request-ID** | 否 | 请求追踪ID | `req_123456789` |
| **X-Client-Version** | 否 | 客户端版本 | `1.0.0` |
| **Accept-Language** | 否 | 接受语言 | `zh-CN` |

### 4.2 分页参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| **page** | integer | 1 | 页码 |
| **pageSize** | integer | 20 | 每页数量，最大100 |
| **sort** | string | - | 排序字段 |
| **order** | string | desc | 排序方向：asc/desc |

### 4.3 过滤参数

```
GET /api/novels?category=仙侠&status=ongoing&wordCount[gte]=10000&sort=update&order=desc
```

| 操作符 | 含义 | 示例 |
|--------|------|------|
| `[eq]` | 等于 | `status[eq]=published` |
| `[ne]` | 不等于 | `status[ne]=deleted` |
| `[gt]` | 大于 | `wordCount[gt]=10000` |
| `[gte]` | 大于等于 | `wordCount[gte]=10000` |
| `[lt]` | 小于 | `wordCount[lt]=50000` |
| `[lte]` | 小于等于 | `wordCount[lte]=50000` |
| `[in]` | 包含 | `category[in]=仙侠,玄幻` |
| `[like]` | 模糊查询 | `title[like]=修仙` |

---

## 5. 认证与授权

### 5.1 认证方式

```
Authorization: Bearer <access_token>
```

### 5.2 Token 刷新

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbG..."
}
```

### 5.3 权限控制

| 角色 | 权限范围 |
|------|----------|
| **reader** | 阅读、评论、书架管理 |
| **author** | 小说创作、章节管理 |
| **admin** | 内容审核、用户管理、系统配置 |

---

## 6. 接口版本管理

### 6.1 URL 版本控制

```
/api/v1/novels
/api/v2/novels
```

### 6.2 版本兼容性

| 版本 | 状态 | 支持期限 |
|------|------|----------|
| v1 | 维护中 | 2026-12-31 |
| v2 | 当前版本 | - |

---

## 7. 限流与配额

### 7.1 限流规则

| 用户类型 | 限流规则 |
|----------|----------|
| **未登录** | 100次/小时 |
| **普通用户** | 1000次/小时 |
| **VIP用户** | 10000次/小时 |
| **API Key** | 按套餐配置 |

### 7.2 限流响应头

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1649750400
```

---

## 8. 接口文档规范

### 8.1 OpenAPI 规范

```yaml
openapi: 3.0.0
info:
  title: NovelHub API
  version: 1.0.0
  description: 小说阅读平台API

paths:
  /api/v1/novels:
    get:
      summary: 获取小说列表
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: pageSize
          in: query
          schema:
            type: integer
            default: 20
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/NovelListResponse'
```

---

**编制**: 后端团队  
**审核**: 架构师  
**更新**: 2026-04-12
