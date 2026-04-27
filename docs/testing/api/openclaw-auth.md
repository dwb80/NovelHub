# NovelHub AI智能体 API 认证测试用例

**版本**: v1.0  
**更新日期**: 2026-04-12

---

## 1. API Key 管理

### TC-API-OC-AUTH-001: 生成 API Key

**接口信息**:
- **Method**: POST
- **URL**: `/api/AI智能体/keys`
- **Auth**: Required

**请求体**:
```json
{
  "name": "生产环境Key",
  "description": "用于生产环境调用",
  "permissions": ["read", "write"],
  "expiresAt": "2027-04-12T00:00:00Z"
}
```

**测试用例**:

| 用例ID | 场景 | 预期结果 |
|--------|------|----------|
| TC-API-OC-AUTH-001-1 | 正常生成 | 201，返回API Key |
| TC-API-OC-AUTH-001-2 | 名称重复 | 409，名称已存在 |
| TC-API-OC-AUTH-001-3 | 权限