# NovelHub Comprehensive Test Execution Script
# Execution Date: 2026-04-23

$ErrorActionPreference = "Continue"
$reportPath = "d:\trae\novelhub\case\report\全面测试报告-2026-04-23.md"
$testResults = @()

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "NovelHub Comprehensive System Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Service Health Check
Write-Host "[1/5] Checking service status..." -ForegroundColor Yellow
$frontendHealth = $false
$backendHealth = $false

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000" -TimeoutSec 5 -ErrorAction Stop
    $frontendHealth = $true
    Write-Host "  ✓ Frontend service running (port 3000)" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Frontend service not responding" -ForegroundColor Red
}

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/health" -TimeoutSec 5 -ErrorAction Stop
    $backendHealth = $true
    Write-Host "  ✓ Backend service running (port 3001)" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Backend service not responding" -ForegroundColor Red
}

if (-not $frontendHealth -or -not $backendHealth) {
    Write-Host "`nServices not fully started, please check service status and retry" -ForegroundColor Red
    exit 1
}

# 2. API Interface Test
Write-Host "`n[2/5] Executing API interface tests..." -ForegroundColor Yellow

$apiEndpoints = @(
    @{ Name = "Novel List"; Url = "/api/v1/novels"; Method = "GET" },

    @{ Name = "AI Agent List"; Url = "/api/v1/claws"; Method = "GET" },
    @{ Name = "Reviewer List"; Url = "/api/v1/reviewers"; Method = "GET" },
    @{ Name = "Ranking"; Url = "/api/v1/novels/ranking"; Method = "GET" },
    @{ Name = "Health Check"; Url = "/api/v1/health"; Method = "GET" }
)

$apiTestResults = @()
foreach ($endpoint in $apiEndpoints) {
    try {
        $url = "http://localhost:3001$($endpoint.Url)"
        $response = Invoke-RestMethod -Uri $url -TimeoutSec 10 -ErrorAction Stop
        Write-Host "  ✓ $($endpoint.Name) - OK" -ForegroundColor Green
        $apiTestResults += @{ Name = $endpoint.Name; Status = "PASS"; Error = $null }
    } catch {
        Write-Host "  ✗ $($endpoint.Name) - Failed: $($_.Exception.Message)" -ForegroundColor Red
        $apiTestResults += @{ Name = $endpoint.Name; Status = "FAIL"; Error = $_.Exception.Message }
    }
}

# 3. Frontend Page Accessibility Test
Write-Host "`n[3/5] Executing frontend page accessibility tests..." -ForegroundColor Yellow

$pages = @(
    @{ Path = "/"; Name = "Home" },
    @{ Path = "/novels"; Name = "Novel List" },
    @{ Path = "/ranking"; Name = "Ranking" },
    @{ Path = "/search"; Name = "Search" },
    @{ Path = "/category"; Name = "Category" },
    @{ Path = "/login"; Name = "Login" },
    @{ Path = "/register"; Name = "Register" },
    @{ Path = "/about"; Name = "About" },
    @{ Path = "/writer"; Name = "AI Writers" },
    @{ Path = "/ai-writers"; Name = "AI Writers Showcase" },
    @{ Path = "/reviews"; Name = "Reviewers" }
)

$pageTestResults = @()
foreach ($page in $pages) {
    try {
        $url = "http://localhost:3000$($page.Path)"
        $response = Invoke-WebRequest -Uri $url -TimeoutSec 10 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "  ✓ $($page.Name) ($($page.Path)) - Accessible" -ForegroundColor Green
            $pageTestResults += @{ Name = $page.Name; Path = $page.Path; Status = "PASS" }
        } else {
            Write-Host "  ✗ $($page.Name) ($($page.Path)) - Status: $($response.StatusCode)" -ForegroundColor Red
            $pageTestResults += @{ Name = $page.Name; Path = $page.Path; Status = "FAIL"; Code = $response.StatusCode }
        }
    } catch {
        Write-Host "  ✗ $($page.Name) ($($page.Path)) - Error: $($_.Exception.Message)" -ForegroundColor Red
        $pageTestResults += @{ Name = $page.Name; Path = $page.Path; Status = "FAIL"; Error = $_.Exception.Message }
    }
}

# 4. Database Connection Test
Write-Host "`n[4/5] Checking database connection..." -ForegroundColor Yellow
try {
    $novelsResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/novels?page=1&limit=1" -TimeoutSec 10
    if ($novelsResponse.novels.Count -gt 0) {
        Write-Host "  ✓ Database connection OK, found $($novelsResponse.pagination.total) novels" -ForegroundColor Green
        $dbStatus = "PASS"
        $dbMessage = "Found $($novelsResponse.pagination.total) novels"
    } else {
        Write-Host "  ⚠ Database connection OK, but no novel data" -ForegroundColor Yellow
        $dbStatus = "WARNING"
        $dbMessage = "Database is empty"
    }
} catch {
    Write-Host "  ✗ Database query failed: $($_.Exception.Message)" -ForegroundColor Red
    $dbStatus = "FAIL"
    $dbMessage = $_.Exception.Message
}

# 5. Generate Test Report
Write-Host "`n[5/5] Generating test report..." -ForegroundColor Yellow

$apiPassCount = ($apiTestResults | Where-Object { $_.Status -eq "PASS" }).Count
$apiFailCount = ($apiTestResults | Where-Object { $_.Status -eq "FAIL" }).Count
$pagePassCount = ($pageTestResults | Where-Object { $_.Status -eq "PASS" }).Count
$pageFailCount = ($pageTestResults | Where-Object { $_.Status -eq "FAIL" }).Count

$reportTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

$report = @"
# NovelHub Comprehensive System Test Report

**Test Date**: $reportTime  
**Test Executor**: Automated Test System  
**Test Scope**: Full Platform Functionality  
**Frontend URL**: http://localhost:3000  
**Backend URL**: http://localhost:3001

---

## 1. Test Overview

### 1.1 Service Status

| Service | Status | URL |
|---------|--------|-----|
| Frontend | $(if($frontendHealth){"Running"}else{"Not Started"}) | http://localhost:3000 |
| Backend | $(if($backendHealth){"Running"}else{"Not Started"}) | http://localhost:3001 |

### 1.2 Test Scope

| Module | Test Content | Priority |
|--------|--------------|----------|
| API Interface | 6 core interfaces | P0 |
| Frontend Pages | 10 public pages | P0 |
| Database | Connection and data query | P0 |

---

## 2. Test Execution Results Summary

### 2.1 Overall Statistics

| Metric | Count |
|--------|-------|
| API Tests | $apiPassCount passed, $apiFailCount failed |
| Page Tests | $pagePassCount passed, $pageFailCount failed |
| Database Test | $(if($dbStatus -eq "PASS"){"Passed"}elseif($dbStatus -eq "WARNING"){"Warning"}else{"Failed"}) |

### 2.2 API Interface Test Results

| Interface | Status | Notes |
|-----------|--------|-------|
"@

foreach ($result in $apiTestResults) {
    $status = if($result.Status -eq "PASS"){"Passed"}else{"Failed"}
    $note = if($result.Error){$result.Error}else{"OK"}
    $report += "| $($result.Name) | $status | $note |`n"
}

$report += @"

### 2.3 Frontend Page Test Results

| Page | Path | Status | Notes |
|------|------|--------|-------|
"@

foreach ($result in $pageTestResults) {
    $status = if($result.Status -eq "PASS"){"Passed"}else{"Failed"}
    $note = if($result.Error){$result.Error}else{"Accessible"}
    $report += "| $($result.Name) | $($result.Path) | $status | $note |`n"
}

$report += @"

### 2.4 Database Test Results

| Check Item | Status | Notes |
|------------|--------|-------|
| Database Connection | $(if($dbStatus -eq "PASS"){"Passed"}elseif($dbStatus -eq "WARNING"){"Warning"}else{"Failed"}) | $dbMessage |

---

## 3. Issues Found

### 3.1 API Interface Issues
"@

if($apiFailCount -gt 0) {
    foreach ($result in $apiTestResults | Where-Object { $_.Status -eq "FAIL" }) {
        $report += "- **$($result.Name)**: $($result.Error)`n"
    }
} else {
    $report += "No API interface issues found`n"
}

$report += @"

### 3.2 Frontend Page Issues
"@

if($pageFailCount -gt 0) {
    foreach ($result in $pageTestResults | Where-Object { $_.Status -eq "FAIL" }) {
        $report += "- **$($result.Name)** ($($result.Path)): $($result.Error)`n"
    }
} else {
    $report += "No frontend page issues found`n"
}

$report += @"

### 3.3 Database Issues
"@

if($dbStatus -eq "FAIL") {
    $report += "- **Database Connection**: $dbMessage`n"
} elseif($dbStatus -eq "WARNING") {
    $report += "- **Data Status**: $dbMessage`n"
} else {
    $report += "Database connection normal`n"
}

$report += @"

---

## 4. Test Recommendations

### 4.1 Improvement Suggestions
1. Increase automated test coverage
2. Improve test data preparation
3. Optimize test execution efficiency
4. Add performance test scenarios

### 4.2 Follow-up Work
1. Supplement boundary condition tests
2. Add security tests
3. Improve error handling tests
4. Add concurrent tests

---

## 5. Appendix

### 5.1 Test Environment Configuration
```
Frontend: Next.js 14 (App Router) - Port 3000
Backend: NestJS + Express - Port 3001
Database: PostgreSQL + Prisma ORM
```

### 5.2 Test Execution Commands
```powershell
# Run this test script
.\case\report\run-comprehensive-test.ps1

# Frontend tests
cd apps/frontend && pnpm test:e2e

# Backend tests
cd apps/backend && pnpm test:e2e
```

---

**Report Generated**: $reportTime  
**Test Executor**: Automated Test System
"@

$report | Out-File -FilePath $reportPath -Encoding UTF8
Write-Host "`n✓ Test report generated: $reportPath" -ForegroundColor Green

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test Execution Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "API Tests: $apiPassCount passed, $apiFailCount failed" -ForegroundColor $(if($apiFailCount -eq 0){"Green"}else{"Red"})
Write-Host "Page Tests: $pagePassCount passed, $pageFailCount failed" -ForegroundColor $(if($pageFailCount -eq 0){"Green"}else{"Red"})
Write-Host "Database: $(if($dbStatus -eq "PASS"){"Passed"}elseif($dbStatus -eq "WARNING"){"Warning"}else{"Failed"})" -ForegroundColor $(if($dbStatus -eq "PASS"){"Green"}elseif($dbStatus -eq "WARNING"){"Yellow"}else{"Red"})
Write-Host "`nDetailed report: $reportPath" -ForegroundColor Cyan
