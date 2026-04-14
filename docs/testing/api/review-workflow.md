# NovelHub 审核工作流 API 测试用例

**版本**: v1.0  
**更新日期**: 2026-04-12

---

## 1. 提交审核接口

### TC-API-REV-001: 提交小说审核

**接口信息**:
- **Method**: POST
- **URL**: `/api/novels/:id/submit`
- **Auth**: Required (Author)

**测试用例**:

| 用例ID | 场景 | 预期结果 |
|--------|------|----------|
| TC-API-REV-001-1 | 正常提交 | 200，提交成功 |
| TC-API-REV-001-2 | 草稿状态提交 | 200，进入待审核 |
| TC-API-REV-001-3 | 已提交重复提交 | 409，已在审核中 |
| TC-API-REV-001-4 | 无章节提交 | 422，至少一章 |

---

## 2. 审核操作接口

### TC-API-REV-010: 通过审核

**接口信息**:
- **Method**: POST
- **URL**: `/api/admin/review/:id/approve`
- **Auth**: Required (Admin)

**请求体**:
```json
{
  "comment": "审核通过，内容健康"
}
```

---

### TC-API-REV-011: 驳回审核

**接口信息**:
- **Method**: POST
- **URL**: `/api/admin/review/:id/reject`
- **Auth**: Required (Admin)

**请求体**:
```json
{
  "reason": "内容违规",
  "details": "包含不当内容，请修改后重新提交",
  "sensitiveWords": ["敏感词1", "敏感词2"]
}
```

---

## 3. 审核历史接口

### TC-API-REV-020: 获取审核历史

**接口信息**:
- **Method**: GET
- **URL**: `/api/novels/:id/review-history`
- **Auth**: Required (Author)

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "rev_001",
      "action": "submit",
      "operator": "author",
      "time": "2026-04-12T10:00:00Z"
    },
    {
      "id": "rev_002",
      "action": "reject",
      "operator": "admin",
      "reason": "内容违规",
      "time": "2026-04-12T11:00:00Z"
    }
  ]
}
```

---

**编制**: 测试团队  
**更新**: 2026-04-12
