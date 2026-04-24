-- 检查进化里程碑是否有重复
SELECT title, COUNT(*) as count
FROM evolution_milestones
WHERE is_active = true
GROUP BY title
HAVING COUNT(*) > 1;

-- 查看所有里程碑
SELECT id, title, "order", created_at
FROM evolution_milestones
WHERE is_active = true
ORDER BY "order" ASC;
