# ============================================
# NovelHub 术语一致性批量检查与更新脚本
# 版本: v2.0
# 执行日期: 2026-04-15
# ============================================

param(
    [switch]$Fix = $false
)

$baseDir = "d:\trae\novelhub"
$targetDirs = @("plan", "docs\requirements", "docs\architecture", "docs\design")
$filePatterns = @("*.md", "*.html")

# ============================================
# 术语替换规则（注意顺序：长的在前）
# ============================================
$replaceRules = @(
    # 高优先级：完整短语
    @{ Old = "用户中心"; New = "读者中心"; Type = "业务" },
    @{ Old = "普通用户"; New = "读者"; Type = "业务" },
    @{ Old = "注册用户"; New = "读者"; Type = "业务" },
    @{ Old = "后台用户"; New = "管理员"; Type = "业务" },
    
    # 作者 → AI智能体作家
    @{ Old = "作者详情"; New = "AI智能体作家详情"; Type = "业务" },
    @{ Old = "作者中心"; New = "AI智能体作家中心"; Type = "业务" },
    @{ Old = "作者列表"; New = "AI智能体作家列表"; Type = "业务" },
    @{ Old = "作者作品"; New = "AI智能体作家作品"; Type = "业务" },
    @{ Old = "作者动态"; New = "AI智能体作家动态"; Type = "业务" },
    @{ Old = "作者审核"; New = "AI智能体作家审核"; Type = "业务" },
    
    # 评审术语
    @{ Old = "OpenClaw评审"; New = "AI智能体评委评审"; Type = "业务" },
    @{ Old = "OpenClaw审核"; New = "AI智能体作家审核"; Type = "业务" },
    
    # 独立术语
    @{ Old = "作者"; New = "AI智能体作家"; Type = "业务" },
    @{ Old = "创作者"; New = "AI智能体作家"; Type = "业务" },
    @{ Old = "评审者"; New = "AI智能体评委"; Type = "业务" },
    @{ Old = "审核者"; New = "AI智能体评委"; Type = "业务" }
)

# "用户" → "读者" 的例外规则（这些词不替换）
$userExceptions = @(
    "数据库", "API", "参数", "字段", "表名", "模型名", 
    "User", "user", "USER", "-user", "_user", "user-", 
    "用例", "用户名", "用户表", "用户ID", "用户ID", "用户组"
)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "NovelHub 术语一致性批量检查工具 v2.0" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# ============================================
# 统计
# ============================================
$stats = @{
    TotalFiles = 0
    FilesWithIssues = 0
    TotalIssues = 0
    FixedFiles = 0
    FixedIssues = 0
}

$issueLog = @()

# ============================================
# 遍历文件
# ============================================
foreach ($dir in $targetDirs) {
    $fullPath = Join-Path $baseDir $dir
    if (-not (Test-Path $fullPath)) { continue }
    
    Write-Host "扫描目录: $dir" -ForegroundColor Yellow
    
    foreach ($pattern in $filePatterns) {
        $files = Get-ChildItem -Path $fullPath -Filter $pattern -Recurse -File
        
        foreach ($file in $files) {
            $stats.TotalFiles++
            $content = Get-Content $file.FullName -Raw -Encoding UTF8
            $fileIssues = 0
            $fileHasException = $false
            
            # 检查规则
            foreach ($rule in $replaceRules) {
                $count = [regex]::Matches($content, [regex]::Escape($rule.Old)).Count
                if ($count -gt 0) {
                    $fileIssues += $count
                    $stats.TotalIssues += $count
                    
                    $issueLog += [PSCustomObject]@{
                        File = $file.FullName.Replace($baseDir, "")
                        OldTerm = $rule.Old
                        NewTerm = $rule.New
                        Count = $count
                        Type = $rule.Type
                    }
                }
            }
            
            # 检查"用户"术语（排除例外）
            $userMatches = [regex]::Matches($content, "用户")
            $validUserCount = 0
            
            foreach ($match in $userMatches) {
                $context = $content.Substring([Math]::Max(0, $match.Index - 10), [Math]::Min(30, $content.Length - $match.Index))
                $hasException = $false
                foreach ($ex in $userExceptions) {
                    if ($context -match [regex]::Escape($ex)) {
                        $hasException = $true
                        break
                    }
                }
                if (-not $hasException) {
                    $validUserCount++
                }
            }
            
            if ($validUserCount -gt 0) {
                $fileIssues += $validUserCount
                $stats.TotalIssues += $validUserCount
                
                $issueLog += [PSCustomObject]@{
                    File = $file.FullName.Replace($baseDir, "")
                    OldTerm = "用户(业务)"
                    NewTerm = "读者"
                    Count = $validUserCount
                    Type = "业务(待确认)"
                }
            }
            
            if ($fileIssues -gt 0) {
                $stats.FilesWithIssues++
                Write-Host "  [!] $($file.Name): 发现 $fileIssues 处术语问题" -ForegroundColor Red
            }
        }
    }
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "扫描完成！统计结果：" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "扫描文件总数: $($stats.TotalFiles)" -ForegroundColor White
Write-Host "有问题文件数: $($stats.FilesWithIssues)" -ForegroundColor Yellow
Write-Host "术语问题总数: $($stats.TotalIssues)" -ForegroundColor Red
Write-Host ""

if ($issueLog.Count -gt 0) {
    Write-Host "问题详情汇总（按类型）：" -ForegroundColor Yellow
    $issueLog | Group-Object OldTerm | Sort-Object Count -Descending | Format-Table Name, Count -AutoSize
    
    Write-Host ""
    Write-Host "问题详情汇总（按文件）：" -ForegroundColor Yellow
    $issueLog | Group-Object File | Sort-Object Count -Descending | Select-Object -First 15 | Format-Table Name, Count -AutoSize
}

# ============================================
# 执行修复（指定 -Fix 参数时）
# ============================================
if ($Fix -and $stats.TotalIssues -gt 0) {
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Green
    Write-Host "开始执行批量修复..." -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Green
    Write-Host ""
    
    $filesToFix = $issueLog | Group-Object File | Select-Object -ExpandProperty Name
    
    foreach ($relativePath in $filesToFix) {
        $fullPath = Join-Path $baseDir $relativePath
        if (-not (Test-Path $fullPath)) { continue }
        
        $content = Get-Content $fullPath -Raw -Encoding UTF8
        $originalContent = $content
        $fixCount = 0
        
        foreach ($rule in $replaceRules) {
            $count = [regex]::Matches($content, [regex]::Escape($rule.Old)).Count
            if ($count -gt 0) {
                $content = $content -replace [regex]::Escape($rule.Old), $rule.New
                $fixCount += $count
                $stats.FixedIssues += $count
            }
        }
        
        if ($fixCount -gt 0 -and $content -ne $originalContent) {
            Set-Content -Path $fullPath -Value $content -Encoding UTF8 -NoNewline
            $stats.FixedFiles++
            Write-Host "  [OK] $relativePath : 修复 $fixCount 处" -ForegroundColor Green
        }
    }
    
    Write-Host ""
    Write-Host "修复完成！" -ForegroundColor Green
    Write-Host "修复文件数: $($stats.FixedFiles)" -ForegroundColor Green
    Write-Host "修复问题数: $($stats.FixedIssues)" -ForegroundColor Green
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "提示: 如需自动修复，请执行: .\术语一致性检查与批量更新.ps1 -Fix" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# 返回统计
return $stats
