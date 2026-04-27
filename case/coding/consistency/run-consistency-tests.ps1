# 文档与代码一致性测试运行脚本
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NovelHub 文档与代码一致性测试" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 测试目录: case/coding/consistency/" -ForegroundColor Yellow
Write-Host "📋 测试用例: 14个缺失功能验证" -ForegroundColor Yellow
Write-Host ""

Write-Host "🔍 检查服务状态..." -ForegroundColor Gray

# 检查后端服务
$backendStatus = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing -TimeoutSec 3
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ 后端服务运行正常 (http://localhost:3001)" -ForegroundColor Green
        $backendStatus = $true
    }
} catch {
    Write-Host "⚠️  后端服务未启动，将跳过API测试" -ForegroundColor Yellow
}

# 检查前端服务
$frontendStatus = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 3
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ 前端服务运行正常 (http://localhost:3000)" -ForegroundColor Green
        $frontendStatus = $true
    }
} catch {
    Write-Host "⚠️  前端服务未启动，请先启动服务" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🚀 开始运行一致性测试..." -ForegroundColor Cyan
Write-Host ""

# 设置环境变量
$env:TEST_ENV = "consistency_check"

if ($frontendStatus) {
    Write-Host "运行前端E2E一致性测试..." -ForegroundColor Gray
    npx playwright test case/coding/consistency/ --reporter=list
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host "  测试运行说明" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "前端服务未启动，测试文件已生成:" -ForegroundColor Yellow
    Write-Host "  📄 case/coding/consistency/comment-like-persistence.spec.ts"
    Write-Host "  📄 case/coding/consistency/p1-feature-tests.spec.ts"
    Write-Host "  📄 case/coding/consistency/p2-feature-tests.spec.ts"
    Write-Host "  📄 case/backend/api-consistency.spec.ts"
    Write-Host ""
    Write-Host "启动服务后运行测试:" -ForegroundColor Cyan
    Write-Host "  cd apps/frontend"
    Write-Host "  npx playwright test case/coding/consistency/"
    Write-Host ""
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  一致性测试总结" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 已完成工作:" -ForegroundColor Green
Write-Host "  ✅ 创建 P0 测试用例 2 个 (评论点赞、阅读进度)"
Write-Host "  ✅ 创建 P1 测试用例 5 个 (更新时间、分页、排序等)"
Write-Host "  ✅ 创建 P2 测试用例 7 个 (展开收起、翻页模式等)"
Write-Host "  ✅ 创建后端 API 一致性测试"
Write-Host ""
Write-Host "⚠️  待修复功能 (14项):" -ForegroundColor Yellow
Write-Host "  P0: 2项 - 点赞持久化、阅读进度同步"
Write-Host "  P1: 5项 - 更新时间、章节分页、书架排序..."
Write-Host "  P2: 7项 - 简介展开、翻页模式、评论回复..."
Write-Host ""
Write-Host "📖 详细报告: docs/requirements/细粒度需求文档.md" -ForegroundColor Cyan
