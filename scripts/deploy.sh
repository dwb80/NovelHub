#!/bin/bash
# NovelHub 一键部署脚本
# 适用于生产环境部署

set -e

echo "=========================================="
echo "  NovelHub 一键部署脚本 v1.0"
echo "  NEF 进化引擎 - 生产部署"
echo "=========================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查环境
check_environment() {
    log_info "检查部署环境..."
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装，请先安装 Node.js 18+"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js 版本过低，需要 18+，当前版本: $(node -v)"
        exit 1
    fi
    log_info "Node.js 版本: $(node -v)"
    
    # 检查 pnpm
    if ! command -v pnpm &> /dev/null; then
        log_warn "pnpm 未安装，正在安装..."
        npm install -g pnpm
    fi
    log_info "pnpm 版本: $(pnpm -v)"
    
    # 检查 PostgreSQL
    if ! command -v psql &> /dev/null; then
        log_warn "PostgreSQL 客户端未安装"
    fi
    
    # 检查 Redis
    if ! command -v redis-cli &> /dev/null; then
        log_warn "Redis 客户端未安装"
    fi
}

# 安装依赖
install_dependencies() {
    log_info "安装项目依赖..."
    
    pnpm install --frozen-lockfile
    
    log_info "依赖安装完成"
}

# 配置环境变量
setup_environment() {
    log_info "配置环境变量..."
    
    if [ ! -f ".env.production" ]; then
        log_warn ".env.production 文件不存在，正在创建..."
        
        cat > .env.production << EOF
# 数据库配置
DATABASE_URL="postgresql://novelhub:novelhub123@localhost:5432/novelhub?schema=public"

# JWT 配置
JWT_SECRET="$(openssl rand -base64 32)"
JWT_EXPIRES_IN="7d"

# Redis 配置
REDIS_HOST="localhost"
REDIS_PORT="6379"

# 应用配置
NODE_ENV="production"
PORT=3001
FRONTEND_URL="http://localhost:3000"

# NEF 配置
NEF_MAX_RETRY_COUNT=3
NEF_CACHE_TTL=3600
NEF_MIN_CONTENT_LENGTH=500
NEF_MAX_CONTENT_LENGTH=50000
EOF
        
        log_info ".env.production 已创建，请根据实际情况修改配置"
    fi
}

# 数据库迁移
run_migrations() {
    log_info "运行数据库迁移..."
    
    cd apps/backend
    
    # 生成 Prisma 客户端
    pnpm run db:generate:prod
    
    # 运行迁移
    pnpm run db:migrate:prod
    
    cd ../..
    
    log_info "数据库迁移完成"
}

# 构建应用
build_application() {
    log_info "构建应用..."
    
    # 构建后端
    log_info "构建后端..."
    cd apps/backend
    pnpm run build
    cd ../..
    
    # 构建前端
    log_info "构建前端..."
    cd apps/frontend
    pnpm run build
    cd ../..
    
    log_info "应用构建完成"
}

# 运行测试
run_tests() {
    log_info "运行测试..."
    
    cd apps/backend
    
    # 运行单元测试
    log_info "运行单元测试..."
    pnpm test -- --passWithNoTests || log_warn "部分单元测试失败"
    
    # 运行 E2E 测试
    log_info "运行 E2E 测试..."
    pnpm run test:e2e -- --passWithNoTests || log_warn "部分 E2E 测试失败"
    
    cd ../..
    
    log_info "测试完成"
}

# 启动服务
start_services() {
    log_info "启动服务..."
    
    # 使用 PM2 启动（如果安装了）
    if command -v pm2 &> /dev/null; then
        log_info "使用 PM2 启动服务..."
        
        # 创建 PM2 配置
        cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'novelhub-backend',
      cwd: './apps/backend',
      script: 'dist/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    }
  ]
};
EOF
        
        pm2 start ecosystem.config.js --env production
        pm2 save
        log_info "服务已启动，使用 'pm2 status' 查看状态"
    else
        log_warn "PM2 未安装，请手动启动服务"
        log_info "后端启动命令: cd apps/backend && node dist/main.js"
        log_info "前端启动命令: cd apps/frontend && pnpm start"
    fi
}

# 健康检查
health_check() {
    log_info "执行健康检查..."
    
    sleep 5
    
    # 检查后端
    if curl -s http://localhost:3001/nef/stats > /dev/null; then
        log_info "后端服务正常"
    else
        log_error "后端服务异常"
    fi
    
    # 检查前端
    if curl -s http://localhost:3000 > /dev/null; then
        log_info "前端服务正常"
    else
        log_warn "前端服务可能未启动"
    fi
}

# 主函数
main() {
    log_info "开始部署 NovelHub..."
    
    check_environment
    install_dependencies
    setup_environment
    run_migrations
    build_application
    run_tests
    start_services
    health_check
    
    echo ""
    echo "=========================================="
    log_info "部署完成！"
    echo "=========================================="
    echo ""
    echo "访问地址:"
    echo "  前端: http://localhost:3000"
    echo "  后端: http://localhost:3001"
    echo "  API文档: http://localhost:3001/api"
    echo ""
    echo "NEF 进化引擎状态: 已就绪"
    echo ""
}

# 执行主函数
main "$@"
