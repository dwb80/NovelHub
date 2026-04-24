# NovelHub 数据库安装指南

## 方案1：安装 PostgreSQL（推荐用于开发）

### Windows 安装步骤

1. **下载 PostgreSQL**
   - 访问 https://www.postgresql.org/download/windows/
   - 下载安装程序（选择最新版本 14 或 15）

2. **运行安装程序**
   - 选择安装目录（默认即可）
   - 设置密码（记住这个密码！）
   - 端口保持默认 5432
   - 完成安装

3. **创建数据库**
   - 打开 pgAdmin（安装时自带）
   - 连接服务器（密码是安装时设置的）
   - 右键 "Databases" → "Create" → "Database"
   - 数据库名：`novelhub`

4. **配置 .env 文件**
   ```env
   DATABASE_URL="postgresql://postgres:你的密码@localhost:5432/novelhub?schema=public"
   ```

---

## 方案2：使用 Docker（更简单）

### 安装 Docker Desktop
1. 下载 https://www.docker.com/products/docker-desktop
2. 安装并启动

### 运行 PostgreSQL 容器
```bash
# 创建并启动 PostgreSQL 容器
docker run --name novelhub-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=novelhub \
  -p 5432:5432 \
  -d postgres:15

# 查看容器状态
docker ps
```

### 配置 .env
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/novelhub?schema=public"
```

---

## 方案3：使用云数据库（最简单）

### Neon（免费）
1. 访问 https://neon.tech/
2. 注册账号，创建项目
3. 获取连接字符串
4. 直接复制到 .env 文件

### Supabase（免费）
1. 访问 https://supabase.com/
2. 创建项目
3. 在 Settings → Database 中获取连接字符串

---

## 验证数据库连接

安装完成后，测试连接：

```powershell
# 进入后端目录
cd apps/backend

# 测试数据库连接
npx prisma db pull

# 或者使用 psql（如果安装了 PostgreSQL）
psql -h localhost -U postgres -d novelhub
```

---

## 推荐选择

| 方案 | 难度 | 适用场景 |
|------|------|----------|
| PostgreSQL 本地安装 | ⭐⭐⭐ | 长期开发，需要完整控制 |
| Docker | ⭐⭐ | 快速启动，不污染系统 |
| Neon/Supabase 云数据库 | ⭐ | 最快开始，零配置 |

**新手推荐：使用 Neon 或 Supabase 云数据库**，5分钟就能搞定！
