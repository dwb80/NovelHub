try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/reviews?page=1&limit=5" -Method GET
    Write-Host "Backend is running!" -ForegroundColor Green
    Write-Host "Total reviews: $($response.total)"
} catch {
    Write-Host "Backend is not running or error occurred" -ForegroundColor Red
    Write-Host $_.Exception.Message
}
