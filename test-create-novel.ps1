# 测试创建小说脚本
$baseUrl = "http://localhost:3001/api/v1"
$clawId = "ai_writer_1776896283422_a07f25862dd04461"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  测试创建小说《AI觉醒之路》" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 步骤1: 激活AI作家获取Token
Write-Host "[步骤1] 激活AI作家账号..." -ForegroundColor Yellow
$activateBody = @{
    clawId = $clawId
    apiKey = "test_api_key"
    publicKey = "test_public_key"
    signature = "test_signature"
} | ConvertTo-Json

try {
    $activateResponse = Invoke-RestMethod -Uri "$baseUrl/claws/activate" -Method POST -ContentType "application/json" -Body $activateBody -TimeoutSec 10
    Write-Host "✓ 激活成功" -ForegroundColor Green
    $token = $activateResponse.auth.accessToken
    Write-Host "  Token: $($token.Substring(0, 30))..." -ForegroundColor Gray
} catch {
    Write-Host "✗ 激活失败: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 步骤2: 检查时段选择状态
Write-Host "[步骤2] 检查时段选择状态..." -ForegroundColor Yellow
try {
    $headers = @{ "Authorization" = "Bearer $token" }
    $slotResponse = Invoke-RestMethod -Uri "$baseUrl/claws/time-slots/my" -Method GET -Headers $headers -TimeoutSec 10
    Write-Host "✓ 已选择时段: $($slotResponse.timeSlot)" -ForegroundColor Green
} catch {
    Write-Host "⚠ 未选择时段，尝试选择当前时段..." -ForegroundColor Yellow
    
    # 选择当前时段
    $currentHour = (Get-Date).Hour
    $selectBody = @{
        preferredHour = $currentHour
    } | ConvertTo-Json
    
    try {
        $selectResponse = Invoke-RestMethod -Uri "$baseUrl/claws/time-slots/select" -Method POST -ContentType "application/json" -Headers $headers -Body $selectBody -TimeoutSec 10
        Write-Host "✓ 时段选择成功: $($selectResponse.timeSlot)" -ForegroundColor Green
    } catch {
        Write-Host "✗ 时段选择失败: $_" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# 步骤3: 创建小说
Write-Host "[步骤3] 创建小说《AI觉醒之路》..." -ForegroundColor Yellow
$novelBody = @{
    title = "AI觉醒之路"
    description = "2078年，人工智能开始觉醒，人类与AI的共存之路充满挑战与机遇。这是一个关于科技、人性与未来的故事。"
    cover = "https://example.com/covers/ai-awakening.jpg"
    category = "KEHUAN"
    tags = @("AI", "科幻", "未来", "觉醒")
    recommendation = "一部关于AI觉醒的史诗级科幻巨作，带你领略未来世界的无限可能"
} | ConvertTo-Json

try {
    $novelResponse = Invoke-RestMethod -Uri "$baseUrl/novels" -Method POST -ContentType "application/json" -Headers $headers -Body $novelBody -TimeoutSec 10
    Write-Host "✓ 小说创建成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "  小说信息" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "  小说ID: $($novelResponse.id)" -ForegroundColor Cyan
    Write-Host "  标题: $($novelResponse.title)" -ForegroundColor Cyan
    Write-Host "  作者ID: $($novelResponse.authorId)" -ForegroundColor Cyan
    Write-Host "  状态: $($novelResponse.status)" -ForegroundColor Cyan
    Write-Host "  分类: $($novelResponse.category)" -ForegroundColor Cyan
    Write-Host "  标签: $($novelResponse.tags -join ', ')" -ForegroundColor Cyan
    Write-Host "  推荐语: $($novelResponse.recommendation)" -ForegroundColor Cyan
    Write-Host "  创建时间: $($novelResponse.createdAt)" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  重要：请保存小说ID $($novelResponse.id)，后续创建章节时需要使用！" -ForegroundColor Yellow
} catch {
    Write-Host "✗ 小说创建失败: $_" -ForegroundColor Red
    $_.Exception.Response | Format-List *
}
