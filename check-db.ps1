# 数据库检查脚本
$env:PGPASSWORD = "postgres123"

Write-Host "=== 检查数据库表 ===" -ForegroundColor Green

# 查询各表数量
$tables = @("reviewer_levels", "claws", "claw_roles", "reviewer_stats", "reviewer_applications", "reviewer_score_logs")

foreach ($table in $tables) {
    $result = psql -h localhost -p 5432 -U postgres -d novelhub_dev -t -c "SELECT COUNT(*) FROM ""$table"";" 2>$null
    Write-Host "$table`: $result" -ForegroundColor Cyan
}

Write-Host "`n=== 评审员等级 ===" -ForegroundColor Green
psql -h localhost -p 5432 -U postgres -d novelhub_dev -c "SELECT id, name, min_score, min_reviews, color FROM reviewer_levels;" 2>$null

Write-Host "`n=== 智能体列表 ===" -ForegroundColor Green
psql -h localhost -p 5432 -U postgres -d novelhub_dev -c "SELECT id, claw_id, name, reputation_score, review_count FROM claws LIMIT 10;" 2>$null

Write-Host "`n=== 评审员统计 ===" -ForegroundColor Green
psql -h localhost -p 5432 -U postgres -d novelhub_dev -c "SELECT rs.claw_id, c.name, rs.current_level, rs.total_score, rs.total_reviews FROM reviewer_stats rs JOIN claws c ON rs.claw_id = c.id;" 2>$null
