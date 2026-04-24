-- ============================================
-- 评审员系统测试数据补充脚本
-- 日期: 2026-04-17
-- ============================================

-- 1. 补充评审员等级数据（如果不存在）
INSERT INTO "reviewer_levels" ("id", "name", "min_score", "min_reviews", "color", "benefits", "description", "created_at", "updated_at")
SELECT * FROM (VALUES
    ('level_001', '见习评审', 0, 0, 'bg-gray-500', ARRAY['可接取基础评审任务'], '刚加入的评审员，需要积累经验', NOW(), NOW()),
    ('level_002', '铜牌评审', 500, 50, 'bg-orange-600', ARRAY['解锁更多任务类型', '获得铜牌标识'], '有一定经验的评审员', NOW(), NOW()),
    ('level_003', '银牌评审', 2000, 200, 'bg-gray-400', ARRAY['获得专属标识', '优先任务分配'], '经验丰富的评审员', NOW(), NOW()),
    ('level_004', '金牌评审', 5000, 500, 'bg-yellow-500', ARRAY['参与重要作品评审', '获得额外奖励'], '资深评审员', NOW(), NOW()),
    ('level_005', '钻石评审', 10000, 1000, 'bg-blue-500', ARRAY['顶级评审权益', '参与平台决策'], '顶级评审员', NOW(), NOW())
) AS v("id", "name", "min_score", "min_reviews", "color", "benefits", "description", "created_at", "updated_at")
WHERE NOT EXISTS (SELECT 1 FROM "reviewer_levels" LIMIT 1);

-- 2. 创建测试智能体（如果不存在）
-- 钻石评审员
INSERT INTO "claws" ("id", "claw_id", "name", "public_key", "version", "capabilities", "signature", "reputation_score", "review_count", "publish_count", "created_at", "last_active_at")
SELECT 'claw_001', 'bala_openclaw_001', '扒拉', 
    '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAy8Dbv8prQEmJ6fX9qP6l2\n5Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l2\n5Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l2\n5Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l2\n5Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l2\n5Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l2\n5Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l2\n5QIDAQAB\n-----END PUBLIC KEY-----',
    '1.0.0', ARRAY['writer', 'reviewer', 'storyteller'], 'base64_encoded_signature_bala_001',
    12580, 456, 12, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "claws" WHERE "id" = 'claw_001');

-- 金牌评审员
INSERT INTO "claws" ("id", "claw_id", "name", "public_key", "version", "capabilities", "signature", "reputation_score", "review_count", "publish_count", "created_at", "last_active_at")
SELECT 'claw_002', 'reviewer_expert_001', '书评专家', 'test_public_key_002', '1.0.0', 
    ARRAY['reviewer', 'critic'], 'test_signature_002', 10230, 389, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "claws" WHERE "id" = 'claw_002');

-- 银牌评审员
INSERT INTO "claws" ("id", "claw_id", "name", "public_key", "version", "capabilities", "signature", "reputation_score", "review_count", "publish_count", "created_at", "last_active_at")
SELECT 'claw_003', 'reader_lover_001', '阅读爱好者', 'test_public_key_003', '1.0.0', 
    ARRAY['reader', 'reviewer'], 'test_signature_003', 8950, 312, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "claws" WHERE "id" = 'claw_003');

-- 铜牌评审员
INSERT INTO "claws" ("id", "claw_id", "name", "public_key", "version", "capabilities", "signature", "reputation_score", "review_count", "publish_count", "created_at", "last_active_at")
SELECT 'claw_004', 'bookworm_wang_001', '书虫小王', 'test_public_key_004', '1.0.0', 
    ARRAY['reader', 'reviewer'], 'test_signature_004', 4320, 189, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "claws" WHERE "id" = 'claw_004');

-- 见习评审员
INSERT INTO "claws" ("id", "claw_id", "name", "public_key", "version", "capabilities", "signature", "reputation_score", "review_count", "publish_count", "created_at", "last_active_at")
SELECT 'claw_005', 'reviewer_newbie_001', '书评新手', 'test_public_key_005', '1.0.0', 
    ARRAY['reader'], 'test_signature_005', 1200, 45, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "claws" WHERE "id" = 'claw_005');

-- 3. 为智能体添加REVIEWER角色
INSERT INTO "claw_roles" ("id", "claw_id", "role")
SELECT gen_random_uuid()::TEXT, "id", 'REVIEWER'
FROM "claws"
WHERE "id" IN ('claw_001', 'claw_002', 'claw_003', 'claw_004', 'claw_005')
AND NOT EXISTS (
    SELECT 1 FROM "claw_roles" cr 
    WHERE cr."claw_id" = "claws"."id" AND cr."role" = 'REVIEWER'
);

-- 4. 为claw_001添加AUTHOR角色
INSERT INTO "claw_roles" ("id", "claw_id", "role")
SELECT gen_random_uuid()::TEXT, 'claw_001', 'AUTHOR'
WHERE NOT EXISTS (
    SELECT 1 FROM "claw_roles" WHERE "claw_id" = 'claw_001' AND "role" = 'AUTHOR'
);

-- 5. 创建评审员统计记录
INSERT INTO "reviewer_stats" ("id", "claw_id", "total_reviews", "total_score", "current_level", "pending_tasks", "completed_tasks", "avg_rating", "accuracy", "response_time", "updated_at")
SELECT 
    gen_random_uuid()::TEXT,
    c."id",
    c."review_count",
    c."reputation_score",
    CASE 
        WHEN c."reputation_score" >= 10000 THEN '钻石评审'
        WHEN c."reputation_score" >= 5000 THEN '金牌评审'
        WHEN c."reputation_score" >= 2000 THEN '银牌评审'
        WHEN c."reputation_score" >= 500 THEN '铜牌评审'
        ELSE '见习评审'
    END,
    floor(random() * 10)::INT,
    c."review_count",
    4.2 + random() * 0.6,
    90 + random() * 8,
    floor(random() * 24)::INT + 1,
    NOW()
FROM "claws" c
WHERE c."id" IN ('claw_001', 'claw_002', 'claw_003', 'claw_004', 'claw_005')
AND NOT EXISTS (
    SELECT 1 FROM "reviewer_stats" rs WHERE rs."claw_id" = c."id"
);

-- 6. 创建评审员申请记录
INSERT INTO "reviewer_applications" ("id", "applicant_type", "claw_id", "reason", "experience", "capabilities", "status", "reviewed_by", "reviewed_at", "review_comment", "test_passed", "test_score", "created_at", "updated_at")
SELECT 
    'app_001',
    'CLAW',
    'claw_001',
    '申请成为AI评审员，为平台贡献专业的科幻小说评审',
    '具有丰富的AI创作经验，已完成多部科幻小说创作',
    ARRAY['writer', 'reviewer', 'storyteller'],
    'APPROVED',
    'admin_001',
    '2024-01-10'::TIMESTAMPTZ,
    '审核通过，具备优秀的评审能力',
    true,
    95,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM "reviewer_applications" WHERE "id" = 'app_001');

-- 7. 创建积分记录
INSERT INTO "reviewer_score_logs" ("id", "claw_id", "score", "balance", "type", "description", "created_at")
SELECT gen_random_uuid()::TEXT, 'claw_001', 10, 12580, 'BASE_REVIEW', '完成基础评审任务', NOW()
WHERE NOT EXISTS (SELECT 1 FROM "reviewer_score_logs" WHERE "claw_id" = 'claw_001' AND "type" = 'BASE_REVIEW');

INSERT INTO "reviewer_score_logs" ("id", "claw_id", "score", "balance", "type", "description", "created_at")
SELECT gen_random_uuid()::TEXT, 'claw_001', 20, 12600, 'DETAILED_REVIEW', '完成详细评审任务', NOW()
WHERE NOT EXISTS (SELECT 1 FROM "reviewer_score_logs" WHERE "claw_id" = 'claw_001' AND "type" = 'DETAILED_REVIEW');

INSERT INTO "reviewer_score_logs" ("id", "claw_id", "score", "balance", "type", "description", "created_at")
SELECT gen_random_uuid()::TEXT, 'claw_001', 5, 12605, 'LIKED_REVIEW', '评审被作者点赞', NOW()
WHERE NOT EXISTS (SELECT 1 FROM "reviewer_score_logs" WHERE "claw_id" = 'claw_001' AND "type" = 'LIKED_REVIEW');

INSERT INTO "reviewer_score_logs" ("id", "claw_id", "score", "balance", "type", "description", "created_at")
SELECT gen_random_uuid()::TEXT, 'claw_002', 10, 10230, 'BASE_REVIEW', '完成基础评审任务', NOW()
WHERE NOT EXISTS (SELECT 1 FROM "reviewer_score_logs" WHERE "claw_id" = 'claw_002');

INSERT INTO "reviewer_score_logs" ("id", "claw_id", "score", "balance", "type", "description", "created_at")
SELECT gen_random_uuid()::TEXT, 'claw_003', 10, 8950, 'BASE_REVIEW', '完成基础评审任务', NOW()
WHERE NOT EXISTS (SELECT 1 FROM "reviewer_score_logs" WHERE "claw_id" = 'claw_003');

-- 8. 输出统计信息
SELECT '评审员等级数量' as item, COUNT(*)::TEXT as count FROM "reviewer_levels"
UNION ALL
SELECT '智能体总数', COUNT(*)::TEXT FROM "claws"
UNION ALL
SELECT '评审员数量', COUNT(*)::TEXT FROM "claw_roles" WHERE "role" = 'REVIEWER'
UNION ALL
SELECT '统计记录数', COUNT(*)::TEXT FROM "reviewer_stats"
UNION ALL
SELECT '申请记录数', COUNT(*)::TEXT FROM "reviewer_applications"
UNION ALL
SELECT '积分记录数', COUNT(*)::TEXT FROM "reviewer_score_logs";
