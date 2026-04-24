# NovelHub E2E Test Runner

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NovelHub E2E Test Runner" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3001"

Write-Host "[1/4] Checking service status..." -ForegroundColor Yellow

try {
  $r = Invoke-WebRequest -Uri "$baseUrl/api/docs" -UseBasicParsing -TimeoutSec 5
  Write-Host "OK - Service is running" -ForegroundColor Green
} catch {
  Write-Host "ERROR - Service is NOT running" -ForegroundColor Red
  Write-Host "Please start the service first:"
  Write-Host "  cd d:\trae\novelhub\apps\backend"
  Write-Host "  npm run dev"
  exit 1
}

Write-Host ""
Write-Host "[2/4] Running Public API tests..." -ForegroundColor Yellow

$results = @()
$pass = 0
$fail = 0

function Test-Endpoint {
  param($Name, $ScriptBlock)
  try {
    & $ScriptBlock
    Write-Host "  [PASS] $Name" -ForegroundColor Green
    $script:pass++
  } catch {
    Write-Host "  [FAIL] $Name - $_" -ForegroundColor Red
    $script:fail++
  }
}

# Public API Tests
Test-Endpoint "GET /statistics/overview" {
  $r = Invoke-WebRequest -Uri "$baseUrl/statistics/overview" -UseBasicParsing
  if ($r.StatusCode -ne 200) { throw "Status: $($r.StatusCode)" }
}

Test-Endpoint "GET /novels" {
  $r = Invoke-WebRequest -Uri "$baseUrl/novels" -UseBasicParsing
  if ($r.StatusCode -ne 200) { throw "Status: $($r.StatusCode)" }
}

Test-Endpoint "GET /search/novels" {
  $r = Invoke-WebRequest -Uri "$baseUrl/search/novels?q=test" -UseBasicParsing
  if ($r.StatusCode -ne 200) { throw "Status: $($r.StatusCode)" }
}

Test-Endpoint "GET /claws" {
  $r = Invoke-WebRequest -Uri "$baseUrl/claws" -UseBasicParsing
  if ($r.StatusCode -ne 200) { throw "Status: $($r.StatusCode)" }
}

Test-Endpoint "GET /api/docs (Swagger UI)" {
  $r = Invoke-WebRequest -Uri "$baseUrl/api/docs" -UseBasicParsing
  if ($r.StatusCode -ne 200) { throw "Status: $($r.StatusCode)" }
}

Write-Host ""
Write-Host "[3/4] Running Security tests..." -ForegroundColor Yellow

Test-Endpoint "GET /users/profile without token returns 401" {
  try {
    $r = Invoke-WebRequest -Uri "$baseUrl/users/profile" -UseBasicParsing -ErrorAction Stop
    throw "Expected 401"
  } catch {
    if ($_.Exception.Response.StatusCode.value__ -ne 401) { throw }
  }
}

Test-Endpoint "GET /notifications without token returns 401" {
  try {
    $r = Invoke-WebRequest -Uri "$baseUrl/notifications" -UseBasicParsing -ErrorAction Stop
    throw "Expected 401"
  } catch {
    if ($_.Exception.Response.StatusCode.value__ -ne 401) { throw }
  }
}

Test-Endpoint "GET /bookshelf without token returns 401" {
  try {
    $r = Invoke-WebRequest -Uri "$baseUrl/bookshelf" -UseBasicParsing -ErrorAction Stop
    throw "Expected 401"
  } catch {
    if ($_.Exception.Response.StatusCode.value__ -ne 401) { throw }
  }
}

Test-Endpoint "GET /payments/orders without token returns 401" {
  try {
    $r = Invoke-WebRequest -Uri "$baseUrl/payments/orders" -UseBasicParsing -ErrorAction Stop
    throw "Expected 401"
  } catch {
    if ($_.Exception.Response.StatusCode.value__ -ne 401) { throw }
  }
}

Write-Host ""
Write-Host "[4/4] Running Auth tests..." -ForegroundColor Yellow

$timestamp = Get-Date -Format "HHmmssfff"
$token = $null

Test-Endpoint "POST /users/register returns 201" {
  $body = @{
    username = "user_$timestamp"
    email = "user_$timestamp@example.com"
    password = "TestPass123!"
  } | ConvertTo-Json
  $r = Invoke-WebRequest -Uri "$baseUrl/users/register" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
  if ($r.StatusCode -ne 201) { throw "Status: $($r.StatusCode)" }
  $data = $r.Content | ConvertFrom-Json
  $script:token = $data.accessToken
}

if ($token) {
  $headers = @{ "Authorization" = "Bearer $token" }

  Test-Endpoint "GET /users/profile with token returns 200" {
    $r = Invoke-WebRequest -Uri "$baseUrl/users/profile" -Headers $headers -UseBasicParsing
    if ($r.StatusCode -ne 200) { throw "Status: $($r.StatusCode)" }
  }

  Test-Endpoint "GET /notifications with token returns 200" {
    $r = Invoke-WebRequest -Uri "$baseUrl/notifications" -Headers $headers -UseBasicParsing
    if ($r.StatusCode -ne 200) { throw "Status: $($r.StatusCode)" }
  }

  Test-Endpoint "GET /bookshelf with token returns 200" {
    $r = Invoke-WebRequest -Uri "$baseUrl/bookshelf" -Headers $headers -UseBasicParsing
    if ($r.StatusCode -ne 200) { throw "Status: $($r.StatusCode)" }
  }

  Test-Endpoint "GET /payments/orders with token returns 200" {
    $r = Invoke-WebRequest -Uri "$baseUrl/payments/orders" -Headers $headers -UseBasicParsing
    if ($r.StatusCode -ne 200) { throw "Status: $($r.StatusCode)" }
  }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$total = $pass + $fail
$rate = [math]::Round($pass / $total * 100, 1)

Write-Host "PASS: $pass" -ForegroundColor Green
Write-Host "FAIL: $fail" -ForegroundColor Red
Write-Host "TOTAL: $total tests"
Write-Host "SUCCESS RATE: $rate%"
Write-Host ""
Write-Host "Completed at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host ""
