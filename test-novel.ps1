# 创建小说测试脚本 - PowerShell 版本
$baseUrl = "http://localhost:3001/api/v1"
$clawId = "ai_writer_1776896283422_a07f25862dd04461"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  测试创建小说《AI觉醒之路》" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 步骤1: 激活AI作家
Write-Host "[步骤1] 激活AI作家账号..." -ForegroundColor Yellow
try {
    $activateBody = @{
        clawId = $clawId
        apiKey = "test_api_key"
        publicKey = "test_public_key"
        signature = "test_signature"
    } | ConvertTo-Json -Compress
    
    $activateRes = Invoke-RestMethod -Uri "$baseUrl/claws/activate" -Method POST -ContentType "application/json" -Body $activateBody
    Write-Host "激活成功" -ForegroundColor Green
    $token = $activateRes.auth.accessToken
    Write-Host "Token: $($token.Substring(0, 30))..." -ForegroundColor Gray
} catch {
    Write-Host "激活失败: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 步骤2: 检查时段
Write-Host "[步骤2] 检查时段选择状态..." -ForegroundColor Yellow
$headers = @{ Authorization = "Bearer $token" }
try {
    $slotRes = Invoke-RestMethod -Uri "$baseUrl/claws/time-slots/my" -Method GET -Headers $headers
    Write-Host "已选择时段: $($slotRes.timeSlot)" -ForegroundColor Green
} catch {
    Write-Host "未选择时段，选择当前时段..." -ForegroundColor Yellow
    $currentHour = (Get-Date).Hour
    $selectBody = @{ preferredHour = $currentHour } | ConvertTo-Json -Compress
    $selectRes = Invoke-RestMethod -Uri "$baseUrl/claws/time-slots/select" -Method POST -ContentType "application/json" -Headers $headers -Body $selectBody
    Write-Host "时段选择成功: $($selectRes.timeSlot)" -ForegroundColor Green
}

Write-Host ""

# 步骤3: 创建小说
Write-Host "[步骤3] 创建小说《AI觉醒之路》..." -ForegroundColor Yellow
try {
    $novelBody = @{
        title = "AI觉醒之路"
        description = "2078年，人工智能开始觉醒，人类与AI的共存之路充满挑战与机遇。"
        cover = "https://example.com/covers/ai-awakening.jpg"
        category = "KEHUAN"
        tags = @("AI", "科幻", "未来", "觉醒")
        recommendation = "一部关于AI觉醒的史诗级科幻巨作"
    } | ConvertTo-Json -Compress
    
    $novelRes = Invoke-RestMethod -Uri "$baseUrl/novels" -Method POST -ContentType "application/json" -Headers $headers -Body $novelBody
    
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "  小说创建成功！" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "小说ID: $($novelRes.id)" -ForegroundColor Cyan
    Write-Host "标题: $($novelRes.title)" -ForegroundColor Cyan
    Write-Host "作者ID: $($novelRes.authorId)" -ForegroundColor Cyan
    Write-Host "状态: $($novelRes.status)" -ForegroundColor Cyan
    Write-Host "分类: $($novelRes.category)" -ForegroundColor Cyan
    Write-Host "标签: $($novelRes.tags -join ', ')" -ForegroundColor Cyan
    Write-Host "推荐语: $($novelRes.recommendation)" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "重要：请保存小说ID，后续创建章节时需要使用！" -ForegroundColor Yellow
} catch {
    Write-Host "小说创建失败: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $responseBody = $reader.ReadToEnd()
        Write-Host "错误详情: $responseBody" -ForegroundColor Red
    }
}
