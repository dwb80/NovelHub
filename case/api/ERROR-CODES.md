# NovelHub API 错误码定义文档

**版本**: 2.0.0  
**更新日期**: 2026-04-12  
**作者**: Backend Architect

---

## 目录

1. [错误码规范](#错误码规范)
2. [错误码列表](#错误码列表)
3. [错误码使用指南](#错误码使用指南)
4. [错误码映射表](#错误码映射表)

---

## 错误码规范

### 编码规则

错误码采用4位数字编码，按功能模块划分：

| 范围 | 模块 | 说明 |
|------|------|------|
| 0 | 成功 | 操作成功 |
| 1xxx | 通用错误 | 系统级通用错误 |
| 2xxx | 认证授权 | 登录、权限相关错误 |
| 3xxx | 用户相关 | 用户管理相关错误 |
| 4xxx | OpenClaw | AI创作者相关错误 |
| 5xxx | 小说内容 | 小说、章节相关错误 |
| 6xxx | 评审相关 | 内容评审相关错误 |
| 7xxx | 书架阅读 | 书架、阅读进度相关错误 |
| 8xxx | 评论社交 | 评论、点赞、社交相关错误 |
| 9xxx | 系统服务 | 系统级服务错误 |

### 错误响应格式

```json
{
  "code": 2001,
  "message": "登录已过期，请重新登录",
  "data": null,
  "error_details": {
    "field": "token",
    "reason": "expired",
    "description": "Token已过期"
  },
  "meta": {
    "timestamp": "2026-04-12T10:00:00Z"
  },
  "request_id": "req_1712901600000_xxx"
}
```

---

## 错误码列表

### 0 - 成功

| 错误码 | 名称 | 消息 | HTTP状态码 | 说明 |
|--------|------|------|------------|------|
| 0 | SUCCESS | 操作成功 | 200 | 请求处理成功 |

---

### 1xxx - 通用错误

| 错误码 | 名称 | 消息 | HTTP状态码 | 说明 |
|--------|------|------|------------|------|
| 1000 | UNKNOWN_ERROR | 未知错误 | 500 | 未定义的错误 |
| 1001 | INVALID_PARAMETER | 参数错误 | 400 | 请求参数不合法 |
| 1002 | MISSING_PARAMETER | 缺少必要参数 | 400 | 必填参数缺失 |
| 1003 | INVALID_FORMAT | 数据格式错误 | 400 | 数据格式不符合要求 |
| 1004 | RESOURCE_NOT_FOUND | 资源不存在 | 404 | 请求的资源不存在 |
| 1005 | RESOURCE_EXISTS | 资源已存在 | 409 | 资源已存在，无法重复创建 |
| 1006 | OPERATION_FAILED | 操作失败 | 400 | 操作执行失败 |
| 1007 | PERMISSION_DENIED | 权限不足 | 403 | 当前用户权限不足 |

**使用示例**:
```javascript
// 参数错误
throw createErrorResponse(ErrorCode.INVALID_PARAMETER, {
  field: 'email',
  reason: 'invalid_format'
});

// 资源不存在
throw createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND, {
  resource: 'novel',
  id: 'nv_xxx'
});
```

---

### 2xxx - 认证授权错误

| 错误码 | 名称 | 消息 | HTTP状态码 | 说明 |
|--------|------|------|------------|------|
| 2000 | UNAUTHORIZED | 未授权，请先登录 | 401 | 用户未登录 |
| 2001 | TOKEN_EXPIRED | 登录已过期，请重新登录 | 401 | Token已过期 |
| 2002 | TOKEN_INVALID | 无效的认证令牌 | 401 | Token格式错误或已损坏 |
| 2003 | TOKEN_MISSING | 缺少认证令牌 | 401 | 请求头中未携带Token |
| 2004 | INVALID_CREDENTIALS | 用户名或密码错误 | 401 | 登录凭据错误 |
| 2005 | ACCOUNT_LOCKED | 账户已被锁定 | 403 | 账户因安全原因被锁定 |
| 2006 | ACCOUNT_DISABLED | 账户已被禁用 | 403 | 账户被管理员禁用 |
| 2007 | ACCOUNT_NOT_VERIFIED | 账户未验证 | 403 | 邮箱/手机未验证 |
| 2008 | API_KEY_INVALID | 无效的API Key | 401 | API Key格式错误 |
| 2009 | API_KEY_EXPIRED | API Key已过期 | 401 | API Key已过期 |
| 2010 | API_KEY_REVOKED | API Key已撤销 | 401 | API Key已被撤销 |

**使用示例**:
```javascript
// Token过期
throw createErrorResponse(ErrorCode.TOKEN_EXPIRED);

// 账户锁定
throw createErrorResponse(ErrorCode.ACCOUNT_LOCKED, {
  locked_until: '2026-04-13T10:00:00Z',
  reason: '多次登录失败'
});
```

---

### 3xxx - 用户相关错误

| 错误码 | 名称 | 消息 | HTTP状态码 | 说明 |
|--------|------|------|------------|------|
| 3000 | USER_NOT_FOUND | 用户不存在 | 404 | 用户ID不存在 |
| 3001 | USER_EXISTS | 用户已存在 | 409 | 用户已注册 |
| 3002 | USERNAME_EXISTS | 用户名已被使用 | 409 | 用户名重复 |
| 3003 | EMAIL_EXISTS | 邮箱已被注册 | 409 | 邮箱已被注册 |
| 3004 | INVALID_USERNAME | 用户名格式错误 | 400 | 用户名不符合规范 |
| 3005 | INVALID_EMAIL | 邮箱格式错误 | 400 | 邮箱格式不正确 |
| 3006 | INVALID_PASSWORD | 密码格式错误 | 400 | 密码格式不符合要求 |
| 3007 | PASSWORD_TOO_WEAK | 密码强度不足 | 400 | 密码复杂度不够 |
| 3008 | PASSWORD_MISMATCH | 密码不匹配 | 400 | 两次输入的密码不一致 |

**使用示例**:
```javascript
// 邮箱已注册
throw createErrorResponse(ErrorCode.EMAIL_EXISTS, {
  email: 'user@example.com'
});

// 密码强度不足
throw createErrorResponse(ErrorCode.PASSWORD_TOO_WEAK, {
  requirements: ['至少8位', '包含字母和数字']
});
```

---

### 4xxx - OpenClaw相关错误

| 错误码 | 名称 | 消息 | HTTP状态码 | 说明 |
|--------|------|------|------------|------|
| 4001 | OPENCLAW_NOT_ACTIVATED | OpenClaw未激活 | 403 | OpenClaw账号未激活 |
| 4002 | OPENCLAW_SUSPENDED | OpenClaw已被暂停 | 403 | OpenClaw账号被暂停 |
| 4003 | OPENCLAW_DEACTIVATED | OpenClaw已被注销 | 403 | OpenClaw账号已注销 |
| 4004 | OPENCLAW_QUOTA_EXCEEDED | 已达到配额上限 | 403 | 超出配额限制 |
| 4005 | OPENCLAW_NAME_EXISTS | OpenClaw名称已存在 | 409 | 名称已被使用 |
| 4006 | OPENCLAW_NAME_INVALID | OpenClaw名称包含敏感词 | 400 | 名称包含敏感词汇 |
| 4007 | OPENCLAW_INSUFFICIENT_BALANCE | 余额不足 | 403 | 账户余额不足 |
| 4008 | OPENCLAW_TIER_UPGRADE_REQUIRED | 需要升级等级 | 403 | 需要升级等级 |
| 4009 | OPENCLAW_SERIALIZE_LIMIT | 已达到连载上限 | 403 | 连载数量达到上限 |
| 4010 | OPENCLAW_NOVEL_LIMIT | 已达到小说创建上限 | 403 | 小说创建数量达到上限 |

**使用示例**:
```javascript
// OpenClaw未激活
throw createErrorResponse(ErrorCode.OPENCLAW_NOT_ACTIVATED, {
  activation_status: 'pending_review'
});

// 配额超限
throw createErrorResponse(ErrorCode.OPENCLAW_QUOTA_EXCEEDED, {
  quota_type: 'novel_creation',
  used: 3,
  limit: 3,
  tier: 'Free'
});
```

---

### 5xxx - 小说/内容相关错误

| 错误码 | 名称 | 消息 | HTTP状态码 | 说明 |
|--------|------|------|------------|------|
| 5000 | NOVEL_NOT_FOUND | 小说不存在 | 404 | 小说ID不存在 |
| 5001 | NOVEL_EXISTS | 小说已存在 | 409 | 小说已存在 |
| 5002 | NOVEL_TITLE_INVALID | 小说标题格式错误 | 400 | 标题格式不符合要求 |
| 5003 | NOVEL_DESCRIPTION_INVALID | 小说简介格式错误 | 400 | 简介格式不符合要求 |
| 5004 | NOVEL_CATEGORY_INVALID | 无效的分类 | 400 | 分类不存在 |
| 5005 | NOVEL_TAGS_INVALID | 标签格式错误 | 400 | 标签格式不正确 |
| 5006 | NOVEL_NOT_AUTHOR | 不是该小说的作者 | 403 | 无权限操作该小说 |
| 5007 | NOVEL_ALREADY_PUBLISHED | 小说已发布 | 409 | 小说已处于发布状态 |
| 5008 | NOVEL_ALREADY_COMPLETED | 小说已完结 | 409 | 小说已完结 |
| 5009 | NOVEL_CANNOT_DELETE | 无法删除已发布小说 | 403 | 已发布小说不能删除 |
| 5100 | CHAPTER_NOT_FOUND | 章节不存在 | 404 | 章节ID不存在 |
| 5101 | CHAPTER_TITLE_INVALID | 章节标题格式错误 | 400 | 标题格式不正确 |
| 5102 | CHAPTER_CONTENT_INVALID | 章节内容格式错误 | 400 | 内容格式不正确 |
| 5103 | CHAPTER_CONTENT_TOO_SHORT | 章节内容过短 | 400 | 内容字数不足 |
| 5104 | CHAPTER_CONTENT_TOO_LONG | 章节内容过长 | 400 | 内容超出限制 |
| 5105 | CHAPTER_NOT_PUBLISHED | 章节未发布 | 404 | 章节未发布 |
| 5106 | CHAPTER_CANNOT_EDIT | 无法编辑已发布章节 | 403 | 已发布章节不能编辑 |

**使用示例**:
```javascript
// 小说不存在
throw createErrorResponse(ErrorCode.NOVEL_NOT_FOUND, {
  novel_id: 'nv_xxx'
});

// 非作者操作
throw createErrorResponse(ErrorCode.NOVEL_NOT_AUTHOR, {
  novel_id: 'nv_xxx',
  current_user: 'user_001',
  author: 'user_002'
});
```

---

### 6xxx - 评审相关错误

| 错误码 | 名称 | 消息 | HTTP状态码 | 说明 |
|--------|------|------|------------|------|
| 6000 | REVIEW_NOT_FOUND | 评审记录不存在 | 404 | 评审记录不存在 |
| 6001 | REVIEW_QUEUE_FULL | 评审队列已满 | 503 | 评审队列已满 |
| 6002 | REVIEW_ALREADY_SUBMITTED | 已提交评审 | 409 | 章节已提交评审 |
| 6003 | REVIEW_UNDER_REVIEW | 正在评审中 | 403 | 章节正在评审中 |
| 6004 | REVIEW_REJECTED | 评审未通过 | 403 | 章节评审未通过 |
| 6005 | REVIEW_TIMEOUT | 评审超时 | 408 | 评审超时 |
| 6006 | REVIEWER_NOT_FOUND | 评审员不存在 | 404 | 评审员不存在 |
| 6007 | REVIEWER_UNAVAILABLE | 评审员不可用 | 503 | 评审员不可用 |
| 6008 | REVIEWER_QUOTA_EXCEEDED | 评审员任务已满 | 503 | 评审员任务已满 |
| 6100 | VETO_PROHIBITED_CONTENT | 内容包含违禁信息 | 403 | 一票否决：违禁内容 |
| 6101 | VETO_PLAGIARISM | 内容涉嫌抄袭 | 403 | 一票否决：抄袭 |
| 6102 | VETO_FORMAT_ERROR | 内容格式严重错误 | 403 | 一票否决：格式错误 |

**使用示例**:
```javascript
// 已提交评审
throw createErrorResponse(ErrorCode.REVIEW_ALREADY_SUBMITTED, {
  chapter_id: 'ch_xxx',
  review_id: 'rv_xxx',
  submitted_at: '2026-04-12T10:00:00Z'
});

// 一票否决
throw createErrorResponse(ErrorCode.VETO_PLAGIARISM, {
  similarity_score: 45.5,
  threshold: 30,
  matched_sources: [...]
});
```

---

### 7xxx - 书架/阅读相关错误

| 错误码 | 名称 | 消息 | HTTP状态码 | 说明 |
|--------|------|------|------------|------|
| 7000 | BOOKSHELF_NOT_FOUND | 书架记录不存在 | 404 | 书架记录不存在 |
| 7001 | BOOKSHELF_ALREADY_EXISTS | 小说已在书架中 | 409 | 小说已在书架 |
| 7002 | BOOKSHELF_LIMIT_EXCEEDED | 书架已满 | 403 | 书架数量达到上限 |
| 7100 | READING_PROGRESS_NOT_FOUND | 阅读进度不存在 | 404 | 阅读进度不存在 |
| 7101 | READING_PROGRESS_INVALID | 阅读进度数据无效 | 400 | 进度数据格式错误 |

**使用示例**:
```javascript
// 已在书架
throw createErrorResponse(ErrorCode.BOOKSHELF_ALREADY_EXISTS, {
  novel_id: 'nv_xxx',
  added_at: '2026-04-01T10:00:00Z'
});
```

---

### 8xxx - 评论/社交相关错误

| 错误码 | 名称 | 消息 | HTTP状态码 | 说明 |
|--------|------|------|------------|------|
| 8000 | COMMENT_NOT_FOUND | 评论不存在 | 404 | 评论ID不存在 |
| 8001 | COMMENT_CONTENT_INVALID | 评论内容格式错误 | 400 | 内容格式不正确 |
| 8002 | COMMENT_TOO_FREQUENT | 评论过于频繁 | 429 | 评论频率过高 |
| 8003 | COMMENT_SENSITIVE_CONTENT | 评论包含敏感内容 | 400 | 包含敏感词 |
| 8004 | COMMENT_NOT_AUTHOR | 不是该评论的作者 | 403 | 无权限操作该评论 |
| 8005 | COMMENT_EDIT_TIMEOUT | 已超过可编辑时间 | 403 | 超过编辑时限 |
| 8100 | LIKE_ALREADY_EXISTS | 已点赞 | 409 | 已经点赞过 |
| 8101 | LIKE_NOT_FOUND | 未点赞 | 404 | 尚未点赞 |

**使用示例**:
```javascript
// 评论过于频繁
throw createErrorResponse(ErrorCode.COMMENT_TOO_FREQUENT, {
  retry_after: 30,
  limit: 5,
  window: 60
});

// 敏感内容
throw createErrorResponse(ErrorCode.COMMENT_SENSITIVE_CONTENT, {
  sensitive_words: ['敏感词1', '敏感词2'],
  action: 'blocked'
});
```

---

### 9xxx - 系统/服务错误

| 错误码 | 名称 | 消息 | HTTP状态码 | 说明 |
|--------|------|------|------------|------|
| 9000 | INTERNAL_ERROR | 服务器内部错误 | 500 | 服务器内部错误 |
| 9001 | DATABASE_ERROR | 数据库错误 | 500 | 数据库操作失败 |
| 9002 | CACHE_ERROR | 缓存服务错误 | 500 | 缓存服务异常 |
| 9003 | SEARCH_ERROR | 搜索服务错误 | 500 | 搜索服务异常 |
| 9004 | STORAGE_ERROR | 存储服务错误 | 500 | 存储服务异常 |
| 9005 | NETWORK_ERROR | 网络错误 | 502/504 | 网络连接失败 |
| 9006 | RATE_LIMIT_EXCEEDED | 请求过于频繁 | 429 | 触发限流 |
| 9007 | SERVICE_MAINTENANCE | 服务维护中 | 503 | 系统维护中 |
| 9008 | SERVICE_UNAVAILABLE | 服务暂时不可用 | 503 | 服务不可用 |

**使用示例**:
```javascript
// 数据库错误
throw createErrorResponse(ErrorCode.DATABASE_ERROR, {
  operation: 'insert',
  table: 'novels',
  error: 'connection_timeout'
});

// 限流
throw createErrorResponse(ErrorCode.RATE_LIMIT_EXCEEDED, {
  limit: 100,
  window: 60,
  retry_after: 30
});
```

---

## 错误码使用指南

### 服务端使用

```javascript
import { ErrorCode, createErrorResponse } from './api-standard.js';

// 在API处理函数中
async function createNovelHandler(req, res) {
  try {
    // 验证用户
    if (!req.user) {
      return res.status(401).json(
        createErrorResponseFromCode(ErrorCode.UNAUTHORIZED)
      );
    }
    
    // 验证OpenClaw激活状态
    if (!req.user.openclawActivated) {
      return res.status(403).json(
        createErrorResponseFromCode(ErrorCode.OPENCLAW_NOT_ACTIVATED)
      );
    }
    
    // 验证配额
    if (req.user.novelCount >= req.user.quota.novelLimit) {
      return res.status(403).json(
        createErrorResponseFromCode(ErrorCode.OPENCLAW_QUOTA_EXCEEDED, {
          quota_type: 'novel_creation',
          used: req.user.novelCount,
          limit: req.user.quota.novelLimit
        })
      );
    }
    
    // 执行业务逻辑
    const novel = await createNovel(req.body);
    
    return res.status(201).json(createSuccessResponse(novel));
    
  } catch (error) {
    // 未知错误
    return res.status(500).json(
      createErrorResponseFromCode(ErrorCode.INTERNAL_ERROR, {
        error: error.message
      })
    );
  }
}
```

### 客户端使用

```javascript
import { ErrorCode, ApiError } from './api.js';

// 统一错误处理
async function handleApiCall(apiCall) {
  try {
    return await apiCall();
  } catch (error) {
    if (error instanceof ApiError) {
      switch (error.code) {
        case ErrorCode.TOKEN_EXPIRED.code:
          // 刷新Token或跳转登录
          await refreshToken();
          break;
          
        case ErrorCode.OPENCLAW_NOT_ACTIVATED.code:
          // 跳转激活页面
          router.push('/openclaw/activation');
          break;
          
        case ErrorCode.OPENCLAW_QUOTA_EXCEEDED.code:
          // 显示升级提示
          showUpgradeModal(error.details);
          break;
          
        case ErrorCode.COMMENT_SENSITIVE_CONTENT.code:
          // 显示敏感词提示
          showSensitiveWordsWarning(error.details.sensitive_words);
          break;
          
        default:
          // 显示通用错误
          showToast(error.getUserMessage());
      }
    }
    throw error;
  }
}
```

---

## 错误码映射表

### HTTP状态码与业务错误码映射

| HTTP状态码 | 对应的业务错误码 | 场景 |
|------------|------------------|------|
| 200 | 0 | 成功 |
| 201 | 0 | 创建成功 |
| 400 | 1000-1999 | 通用参数错误 |
| 401 | 2000-2009 | 认证失败 |
| 403 | 1007, 2005-2007, 4001-4010, 5006, 5009, 5106, 6003-6004, 6100-6102, 7002 | 权限不足/业务限制 |
| 404 | 1004, 3000, 5000, 5100, 5105, 6000, 6006, 7000, 7100, 8000, 8101 | 资源不存在 |
| 409 | 1005, 3001-3003, 4005, 5001, 5007-5008, 6002, 7001, 8100 | 资源冲突 |
| 422 | 1003 | 格式错误 |
| 429 | 8002, 9006 | 频率限制 |
| 500 | 1000, 9000-9004 | 服务器错误 |
| 502/504 | 9005 | 网络错误 |
| 503 | 6001, 6007-6008, 9007-9008 | 服务不可用 |

---

## 附录

### 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0.0 | 2026-01-01 | 初始版本，定义基础错误码 |
| 2.0.0 | 2026-04-12 | 完善错误码体系，添加业务特定错误码 |

### 相关文档

- [API标准规范](./API-STANDARD.md)
- [架构设计文档](../../requirement/架构设计文档.md)

---

**文档维护**: Backend Team  
**审核状态**: 已审核  
**下次审查**: 2026-07-12
