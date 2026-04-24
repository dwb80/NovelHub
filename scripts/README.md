# NovelHub 数据库脚本

## 目录结构

```
scripts/
├── README.md              # 本文件
├── dev/                   # 开发环境脚本
│   ├── init-dev.bat       # 初始化开发环境
│   ├── reset-dev.bat      # 重置开发数据库
│   ├── studio-dev.bat     # 启动 Prisma Studio (开发)
│   └── setup-pgsql-and-dev.bat  # 设置 PostgreSQL 并初始化开发环境
├── test/                  # 测试环境脚本
│   ├── init-test.bat      # 初始化测试环境
│   └── studio-test.bat    # 启动 Prisma Studio (测试)
└── prod/                  # 生产环境脚本
    └── init-prod.bat      # 初始化生产环境
```

## 环境说明

| 目录 | 环境 | 数据库 | 用途 |
|------|------|--------|------|
| `dev/` | Development | PostgreSQL | 本地开发 |
| `test/` | Test | PostgreSQL | 测试环境 |
| `prod/` | Production | PostgreSQL | 生产部署 |

## 快速开始

### 开发环境

```powershell
# 初始化开发环境（包含 PostgreSQL 设置）
.\scripts\dev\setup-pgsql-and-dev.bat

# 或仅初始化数据库（假设 PostgreSQL 已安装）
.\scripts\dev\init-dev.bat

# 重置数据库
.\scripts\dev\reset-dev.bat

# 查看数据库 (Prisma Studio)
.\scripts\dev\studio-dev.bat
```

### 测试环境

```powershell
# 初始化测试环境
.\scripts\test\init-test.bat

# 查看数据库
.\scripts\test\studio-test.bat
```

### 生产环境

```powershell
# 初始化生产环境（需要配置 PostgreSQL）
.\scripts\prod\init-prod.bat
```

## 数据库配置

### PostgreSQL 数据库位置

- **开发**: `novelhub_dev` 数据库
- **测试**: `novelhub_test` 数据库
- **生产**: `novelhub_prod` 数据库

### 环境变量文件

- **开发**: `apps/backend/.env.development`
- **测试**: `apps/backend/.env.test`
- **生产**: `apps/backend/.env.production`

## 环境隔离

- 各环境使用独立的配置文件 (.env.development / .env.test / .env.production)
- PostgreSQL 使用独立的数据库实例
- 各环境数据库互不干扰

## 脚本说明

### 开发环境脚本 (dev/)

| 脚本 | 功能 | 使用场景 |
|------|------|----------|
| `setup-pgsql-and-dev.bat` | 安装 PostgreSQL 并初始化开发数据库 | 首次设置开发环境 |
| `init-dev.bat` | 初始化开发数据库（迁移 + 种子数据） | 日常开发 |
| `reset-dev.bat` | 重置开发数据库（删除并重新创建） | 数据库结构变更 |
| `studio-dev.bat` | 启动 Prisma Studio 查看开发数据库 | 数据查看和调试 |

### 测试环境脚本 (test/)

| 脚本 | 功能 | 使用场景 |
|------|------|----------|
| `init-test.bat` | 初始化测试数据库 | 运行测试前 |
| `studio-test.bat` | 启动 Prisma Studio 查看测试数据库 | 测试数据调试 |

### 生产环境脚本 (prod/)

| 脚本 | 功能 | 使用场景 |
|------|------|----------|
| `init-prod.bat` | 部署生产数据库迁移 | 生产环境部署 |

## 注意事项

1. **开发环境**: 使用 `setup-pgsql-and-dev.bat` 进行首次设置，后续使用 `init-dev.bat`
2. **测试环境**: 每次运行测试前执行 `init-test.bat` 确保数据库状态干净
3. **生产环境**: 仅在部署时执行 `init-prod.bat`，谨慎操作
