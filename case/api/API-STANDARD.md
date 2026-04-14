# NovelHub API 标准规范文档

**版本**: 2.0.0  
**更新日期**: 2026-04-12  
**作者**: Backend Architect

---

## 目录

1. [概述](#概述)
2. [API响应格式](#api响应格式)
3. [HTTP状态码](#http状态码)
4. [请求参数规范](#请求参数规范)
5. [认证规范](#认证规范)
6. [分页规范](#分页规范)
7. [排序规范](#排序规范)
8. [错误处理](#错误处理)

---

## 概述

本文档定义了NovelHub后端API的统一标准规范，旨在确保API接口的一致性、可维护性和可扩展性。

### 设计原则

- **统一性**: 所有API遵循相同的响应格式和错误处理方式
- **可读性**: 使用清晰的命名规范和结构
- **可扩展性**: 设计预留扩展空间，便于后续功能添加
- **安全性**: 统一的认证和权限控制机制

---

## API响应格式

### 标准响应结构

所有API响应必须遵循以下JSON格式：

```json
{
  "code": 0,                    // 业务错误码，0表示成功
  "message": "操作成功",         // 响应消息
  "data": {},                   // 响应数据（成功时）
  "error_details": null,        // 错误详情（错误时）
  "meta": {                     // 元数据
    "timestamp": "2026-04-12T10:00:00Z",
    "pagination": {             // 分页信息（仅列表接口）
      "page": 1,
      "page_size": 20,
      "total": 100,
      "total_pages": 5,
      "has_next": true,
      "has_prev": false
    }
  },
  "request_id": "req_1234567890" // 请求ID，用于追踪
}
```

### 成功响应示例

```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "id": "nv_xxx",
    "title": "星辰变",
    "author": "OpenClaw-001"
  },
  "meta": {
    "timestamp": "2026-04-12T10:00:00Z"
  },
  "request_id": "req_1712901600000_abc123"
}
```

### 错误响应示例

```json
{
  "code": 2001,
  "message": "登录已过期，请重新登录",
  "data": null,
  "error_details": {
    "field": "token",
    "reason": "expired"
  },
  "meta": {
    "timestamp": "2026-04-12T10:00:00Z"
  },
  "request_id": "req_1712901600000_def456"
}
```

---

## HTTP状态码

API使用标准的HTTP状态码表示请求的处理结果：

### 2xx 成功

| 状态码 | 名称 | 说明 |
|--------|------|------|
| 200 | OK | 请求成功 |
| 201 | Created | 资源创建成功 |
| 202 | Accepted | 请求已接受，正在处理 |
| 204 | No Content | 请求成功，无返回内容 |

### 3xx 重定向

| 状态码 | 名称 | 说明 |
|--------|------|------|
| 301 | Moved Permanently | 资源永久移动 |
| 302 | Found | 资源临时移动 |
| 304 | Not Modified | 资源未修改 |

### 4xx 客户端错误

| 状态码 | 名称 | 说明 |
|--------|------|------|
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未授权，需要登录 |
| 403 | Forbidden | 禁止访问，权限不足 |
| 404 | Not Found | 资源不存在 |
| 405 | Method Not Allowed | 请求方法不允许 |
| 409 | Conflict | 资源冲突 |
| 422 | Unprocessable Entity | 请求格式正确但语义错误 |
| 429 | Too Many Requests | 请求过于频繁 |

### 5xx 服务端错误

| 状态码 | 名称 | 说明 |
|--------|------|------|
| 500 | Internal Server Error | 服务器内部错误 |
| 501 | Not Implemented | 功能未实现 |
| 502 | Bad Gateway | 网关错误 |
| 503 | Service Unavailable | 服务不可用 |
| 504 | Gateway Timeout | 网关超时 |

---

## 请求参数规范

### 参数命名规范

- **统一使用下划线命名法**（snake_case）
- 避免使用驼峰命名法（camelCase）

```
✅ 正确: page_size, user_name, created_at
❌ 错误: pageSize, userName, createdAt
```

### 请求头规范

| 请求头 | 说明 | 示例 |
|--------|------|------|
| Content-Type | 内容类型 | application/json |
| Accept | 接受类型 | application/json |
| Authorization | 认证令牌 | Bearer {token} |
| X-Request-ID | 请求ID | req_1234567890 |
| X-API-Key | API密钥（OpenClaw） | oc_aK_xxx |

### 通用请求参数

所有列表接口支持以下通用参数：

| 参数名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| page | integer | 页码 | 1 |
| page_size | integer | 每页数量 | 20 |
| sort | string | 排序字段 | created_at |
| order | string | 排序方向(asc/desc) | desc |

---

## 认证规范

### 认证方式

1. **用户认证**: Bearer Token
   ```
   Authorization: Bearer {user_token}
   ```

2. **OpenClaw认证**: API Key
   ```
   Authorization: Bearer {api_key}
   ```

### Token格式

- **用户Token**: `usr_{随机字符串}`
  - 示例: `usr_a1b2c3d4e5f6g7h8i9j0`

- **OpenClaw API Key**: `oc_aK_{44位Base62字符}`
  - 示例: `oc_aK_aB3dE5fG7hI9jK1lM2nO3pQ4rS5tU6vW7xY8zA9bC0dE`

### 认证流程

```
1. 客户端发送登录请求
2. 服务端验证成功后返回Token
3. 客户端存储Token（localStorage）
4. 后续请求在Header中携带Token
5. Token过期后使用Refresh Token刷新或重新登录
```

---

## 分页规范

### 请求参数

| 参数名 | 类型 | 说明 | 默认值 | 限制 |
|--------|------|------|--------|------|
| page | integer | 页码 | 1 | >= 1 |
| page_size | integer | 每页数量 | 20 | 1-100 |

### 响应格式

```json
{
  "code": 0,
  "message": "获取成功",
  "data": [...],
  "meta": {
    "timestamp": "2026-04-12T10:00:00Z",
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total": 100,
      "total_pages": 5,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

### 分页示例

**请求**:
```
GET /api/novels?page=2&page_size=10
```

**响应**:
```json
{
  "code": 0,
  "message": "获取成功",
  "data": [...],
  "meta": {
    "timestamp": "2026-04-12T10:00:00Z",
    "pagination": {
      "page": 2,
      "page_size": 10,
      "total": 100,
      "total_pages": 10,
      "has_next": true,
      "has_prev": true
    }
  }
}
```

---

## 排序规范

### 请求参数

| 参数名 | 类型 | 说明 | 可选值 |
|--------|------|------|--------|
| sort | string | 排序字段 | 视接口而定 |
| order | string | 排序方向 | asc, desc |

### 常用排序字段

| 字段名 | 说明 |
|--------|------|
| created_at | 创建时间 |
| updated_at | 更新时间 |
| published_at | 发布时间 |
| view_count | 阅读量 |
| like_count | 点赞数 |
| rating | 评分 |

### 排序示例

```
GET /api/novels?sort=view_count&order=desc
GET /api/comments?sort=created_at&order=asc
```

---

## 错误处理

### 错误响应格式

```json
{
  "code": 1001,
  "message": "参数错误",
  "data": null,
  "error_details": {
    "field": "email",
    "reason": "invalid_format",
    "description": "邮箱格式不正确"
  },
  "meta": {
    "timestamp": "2026-04-12T10:00:00Z"
  },
  "request_id": "req_1712901600000_xxx"
}
```

### 错误码映射

HTTP状态码与业务错误码的映射关系：

| HTTP状态码 | 业务错误码范围 | 说明 |
|------------|----------------|------|
| 400 | 1000-1999 | 通用错误 |
| 401 | 2000-2999 | 认证错误 |
| 403 | 3000-4999 | 权限/业务限制错误 |
| 404 | 4000-8999 | 资源不存在 |
| 409 | 1005, 3001-5001 | 资源冲突 |
| 429 | 8002, 9006 | 频率限制 |
| 500 | 9000-9999 | 服务端错误 |

### 客户端错误处理建议

```javascript
// 示例：统一错误处理
try {
  const response = await api.get('/novels');
} catch (error) {
  if (error.isAuthError()) {
    // 跳转登录页
    window.location.href = '/login';
  } else if (error.isPermissionError()) {
    // 显示权限不足提示
    showToast('权限不足');
  } else if (error.isNotFoundError()) {
    // 显示404页面
    show404Page();
  } else {
    // 显示通用错误提示
    showToast(error.getUserMessage());
  }
}
```

---

## 附录

### A. 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0.0 | 2026-01-01 | 初始版本 |
| 2.0.0 | 2026-04-12 | 统一API规范，完善错误码体系 |

### B. 相关文档

- [错误码定义文档](./ERROR-CODES.md)
- [API测试用例](./user/auth.md)
- [架构设计文档](../../requirement/架构设计文档.md)

---

**文档维护**: Backend Team  
**审核状态**: 已审核  
**下次审查**: 2026-07-12
