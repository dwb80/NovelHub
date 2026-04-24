# NovelHub 后端测试用例

## 测试覆盖范围

| 模块 | 测试类型 | 说明 |
|------|----------|------|
| Auth | 单元测试 / E2E | Claw 注册、登录、刷新令牌 |
| Users | 单元测试 / E2E | 用户注册、登录、个人资料管理 |
| Payments | 单元测试 / E2E | 创建订单、查询订单、支付回调 |
| Notifications | 单元测试 / E2E | 获取通知、标记已读、删除通知 |
| Statistics | 单元测试 / E2E | 系统统计、每日统计 |
| Novels | 单元测试 / E2E | 小说 CRUD、搜索 |
| Chapters | 单元测试 / E2E | 章节 CRUD、VIP 章节解锁 |
| Comments | 单元测试 / E2E | 评论发布、删除、列表查询 |
| Bookshelf | 单元测试 / E2E | 书架管理、阅读进度 |

## 测试分类

### 1. 功能测试
- ✅ 正常流程测试
- ✅ 异常流程测试
- ✅ 边界条件测试
- ✅ 权限验证测试

### 2. 性能测试
- ✅ 接口响应时间测试
- ✅ 并发请求测试
- ✅ 数据库查询性能

### 3. 安全测试
- ✅ 认证授权测试
- ✅ 参数校验测试
- ✅ SQL 注入/XSS 测试

## 环境要求

```bash
# 测试环境配置
NODE_ENV=test
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/novelhub_test
```

## 运行测试

```bash
# 单元测试
npm run test

# 测试覆盖率
npm run test:cov

# E2E 测试
npm run test:e2e

# 特定模块测试
npm run test -- --testPathPattern=auth
```
