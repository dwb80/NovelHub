# NovelHub 用户认证 API 测试用例

**版本**: v1.0  
**更新日期**: 2026-04-12

---

## 1. 用户注册

### TC-API-USER-001: 用户注册

**接口信息**:
- **Method**: POST
- **URL**: `/api/users/register`
- **Auth**: None

**请求体**:
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Test@123456"
}
```

**测试用例**:

| 用例ID | 场景 | 预期结果 |
|--------|------|----------|
| TC-API-USER-001-1 | 正常注册 | 201，注册成功 |
| TC-API-USER-001-2 | 邮箱已存在 | 409，邮箱已注册 |
| TC-API-USER-001-3 | 用户名已存在 | 409，用户名已存在 |
| TC-API-USER-001-4 | 密码强度不足 | 400，密码强度不足 |
| TC-API-USER-001-5 | 邮箱格式错误 | 400，邮箱格式不正确 |

---

## 2. 用户登录

### TC-API-USER-010: 用户登录

**接口信息**:
- **Method**: POST
- **URL**: `/api/users/login`
- **Auth**: None

**请求体**:
```json
{
  "email": "test@example.com",
  "password": "Test@123456",
  "rememberMe": true
}
```

**测试用例**:

| 用例ID | 场景 | 预期结果 |
|--------|------|----------|
| TC-API-USER-010-1 | 正常登录 | 200，返回Token |
| TC-API-USER-010-2 | 密码错误 | 401，密码错误 |
| TC-API-USER-010-3 | 用户不存在 | 401，用户不存在 |
| TC-API-USER-010-4 | 账号被禁用 | 403，账号已被禁用 |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "user": {
      "id": "usr_001",
      "username": "testuser",
      "email": "test@example.com",
      "role": "reader"
    },
    "tokens": {
      "accessToken": "eyJhbG...",
      "refreshToken": "eyJhbG...",
      "expiresIn": 3600
    }
  }
}
```

---

## 3. Token 刷新

### TC-API-USER-020: 刷新 Token

**接口信息**:
- **Method**: POST
- **URL**: `/api/users/refresh`
- **Auth**: None

**请求体**:
```json
{
  "refreshToken": "eyJhbG..."
}
```

**测试用例**:

| 用例ID | 场景 | 预期结果 |
|--------|------|----------|
| TC-API-USER-020-1 | 正常刷新 | 200，返回新Token |
| TC-API-USER-020-2 | 无效RefreshToken | 401，Token无效 |
| TC-API-USER-020-3 | RefreshToken过期 | 401，Token已过期 |

---

## 4. 获取当前用户

### TC-API-USER-030: 获取当前用户信息

**接口信息**:
- **Method**: GET
- **URL**: `/api/users/me`
- **Auth**: Required

**测试用例**:

| 用例ID | 场景 | 预期结果 |
|--------|------|----------|
| TC-API-USER-030-1 | 正常获取 | 200，返回用户信息 |
| TC-API-USER-030-2 | 未登录 | 401，需要登录 |
| TC-API-USER-030-3 | Token过期 | 401，Token已过期 |

---

## 5. 修改密码

### TC-API-USER-040: 修改密码

**接口信息**:
- **Method**: PUT
- **URL**: `/api/users/me/password`
- **Auth**: Required

**请求体**:
```json
{
  "oldPassword": "Test@123456",
  "newPassword": "New@123456"
}
```

**测试用例**:

| 用例ID | 场景 | 预期结果 |
|--------|------|----------|
| TC-API-USER-040-1 | 正常修改 | 200，修改成功 |
| TC-API-USER-040-2 | 原密码错误 | 400，原密码错误 |
| TC-API-USER-040-3 | 新旧密码相同 | 400，新旧密码相同 |
| TC-API-USER-040-4 | 密码强度不足 | 400，密码强度不足 |

---

**编制**: 测试团队  
**更新**: 2026-04-12
