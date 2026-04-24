# NovelHub 多环境配置指南

## 环境概述

| 环境 | 数据库 | 端口 | 用途 |
|------|--------|------|------|
| **development** | SQLite (dev.db) | 3001 | 本地开发 |
| **test** | SQLite (test.db) | 3002 | 测试/CI |
| **production** | PostgreSQL | 3001 | 生产部署 |

## 环境隔离

- **数据库文件隔离**: dev.db, test.db, PostgreSQL 互不影响
- **端口隔离**: 开发3001, 测试3002, 生产3001
- **JWT密钥隔离**: 各环境使用不同密钥
- **日志级别**: 开发debug, 测试warn, 生产error

## 快速开始

### 1. 开发环境 (推荐)

```powershell
# 切换到开发环境
.\switch-env.bat
# 选择 1

d:\trae\novelhub\pgsql\bin\pg_ctl.exe -D d:\trae\novelhub\pgsql\data start

# 或手动切换
cd apps/backend
copy .env.development .env
npx prisma generate
npx prisma migrate dev

# 启动
pnpm dev
```

### 2. 测试环境

```powershell
# 切换到测试环境
.\switch-env.bat
# 选择 2

# 运行测试
pnpm test
```

### 3. 生产环境

```powershell
# 切换到生产环境
.\switch-env.bat
# 选择 3

# 配置 PostgreSQL 连接字符串
# 编辑 apps/backend/.env.production

# 部署
pnpm build
pnpm start:prod
```

## 常用命令

### 根目录命令

```powershell
# 开发环境数据库操作
pnpm db:migrate:dev    # 迁移
pnpm db:studio:dev     # 可视化工具

# 测试环境数据库操作
pnpm db:migrate:test
pnpm db:studio:test

# 生产环境数据库操作
pnpm db:migrate:prod
```

### 后端目录命令

```powershell
cd apps/backend

# 开发环境
pnpm db:migrate:dev
pnpm db:generate:dev
pnpm db:studio:dev
pnpm db:reset:dev

# 测试环境
pnpm db:migrate:test
pnpm db:generate:test
pnpm db:studio:test
pnpm db:reset:test
```

## 环境变量文件

```
apps/backend/
├── .env.development    # 开发环境配置
├── .env.test          # 测试环境配置
├── .env.production    # 生产环境配置
└── .env               # 当前激活的环境（由switch-env.bat生成）
```

## 注意事项

1. **不要提交 .env 文件到Git**
   - .gitignore 已配置忽略 .env
   - 只提交 .env.development, .env.test, .env.production 模板

2. **生产环境配置**
   - 必须修改 JWT_SECRET 和 JWT_REFRESH_SECRET 为强密钥
   - 配置正确的 PostgreSQL 连接字符串
   - 配置正确的 CORS_ORIGIN

3. **数据库文件位置**
   - 开发: `apps/backend/dev.db`
   - 测试: `apps/backend/test.db`
   - 生产: PostgreSQL 服务器

4. **切换环境后必须**
   - 重新生成 Prisma 客户端
   - 运行数据库迁移
