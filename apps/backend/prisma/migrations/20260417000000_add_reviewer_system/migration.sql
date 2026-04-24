-- ============================================
-- 评审员系统数据库迁移
-- 日期: 2026-04-17
-- ============================================

-- 1. 创建评审员等级定义表
CREATE TABLE IF NOT EXISTS "reviewer_levels" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "min_score" INTEGER NOT NULL,
    "min_reviews" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "icon" TEXT,
    "benefits" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "reviewer_levels_pkey" PRIMARY KEY ("id")
);

-- 2. 创建评审员申请表
CREATE TABLE IF NOT EXISTS "reviewer_applications" (
    "id" TEXT NOT NULL,
    "applicant_type" TEXT NOT NULL,
    "claw_id" TEXT,
    "user_id" TEXT,
    "reason" TEXT NOT NULL,
    "experience" TEXT,
    "capabilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "review_comment" TEXT,
    "test_score" INTEGER,
    "test_passed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "reviewer_applications_pkey" PRIMARY KEY ("id")
);

-- 3. 创建评审员积分记录表
CREATE TABLE IF NOT EXISTS "reviewer_score_logs" (
    "id" TEXT NOT NULL,
    "claw_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "balance" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "review_id" TEXT,
    "novel_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "reviewer_score_logs_pkey" PRIMARY KEY ("id")
);

-- 4. 创建评审员统计表
CREATE TABLE IF NOT EXISTS "reviewer_stats" (
    "id" TEXT NOT NULL,
    "claw_id" TEXT NOT NULL,
    "total_reviews" INTEGER NOT NULL DEFAULT 0,
    "total_score" INTEGER NOT NULL DEFAULT 0,
    "current_level" TEXT NOT NULL DEFAULT '见习评审',
    "pending_tasks" INTEGER NOT NULL DEFAULT 0,
    "completed_tasks" INTEGER NOT NULL DEFAULT 0,
    "avg_rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "accuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "response_time" INTEGER NOT NULL DEFAULT 0,
    "last_review_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "reviewer_stats_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "reviewer_stats_claw_id_key" UNIQUE ("claw_id")
);

-- ============================================
-- 创建索引
-- ============================================

-- ReviewerApplication 索引
CREATE INDEX IF NOT EXISTS "reviewer_applications_applicant_type_idx" ON "reviewer_applications"("applicant_type");
CREATE INDEX IF NOT EXISTS "reviewer_applications_claw_id_idx" ON "reviewer_applications"("claw_id");
CREATE INDEX IF NOT EXISTS "reviewer_applications_user_id_idx" ON "reviewer_applications"("user_id");
CREATE INDEX IF NOT EXISTS "reviewer_applications_status_idx" ON "reviewer_applications"("status");
CREATE INDEX IF NOT EXISTS "reviewer_applications_created_at_idx" ON "reviewer_applications"("created_at");

-- ReviewerScoreLog 索引
CREATE INDEX IF NOT EXISTS "reviewer_score_logs_claw_id_idx" ON "reviewer_score_logs"("claw_id");
CREATE INDEX IF NOT EXISTS "reviewer_score_logs_type_idx" ON "reviewer_score_logs"("type");
CREATE INDEX IF NOT EXISTS "reviewer_score_logs_created_at_idx" ON "reviewer_score_logs"("created_at");

-- ReviewerStats 索引
CREATE INDEX IF NOT EXISTS "reviewer_stats_current_level_idx" ON "reviewer_stats"("current_level");
CREATE INDEX IF NOT EXISTS "reviewer_stats_total_score_idx" ON "reviewer_stats"("total_score");

-- ============================================
-- 添加外键约束
-- ============================================

-- ReviewerApplication 外键
ALTER TABLE "reviewer_applications" 
    ADD CONSTRAINT "reviewer_applications_claw_id_fkey" 
    FOREIGN KEY ("claw_id") REFERENCES "claws"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ReviewerScoreLog 外键
ALTER TABLE "reviewer_score_logs" 
    ADD CONSTRAINT "reviewer_score_logs_claw_id_fkey" 
    FOREIGN KEY ("claw_id") REFERENCES "claws"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "reviewer_score_logs" 
    ADD CONSTRAINT "reviewer_score_logs_review_id_fkey" 
    FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ReviewerStats 外键
ALTER TABLE "reviewer_stats" 
    ADD CONSTRAINT "reviewer_stats_claw_id_fkey" 
    FOREIGN KEY ("claw_id") REFERENCES "claws"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================
-- 初始化数据
-- ============================================

-- 插入评审员等级数据
INSERT INTO "reviewer_levels" ("id", "name", "min_score", "min_reviews", "color", "benefits", "description", "updated_at") VALUES
('level_001', '见习评审', 0, 0, 'bg-gray-500', ARRAY['可接取基础评审任务'], '刚加入的评审员，需要积累经验', CURRENT_TIMESTAMP),
('level_002', '铜牌评审', 500, 50, 'bg-orange-600', ARRAY['解锁更多任务类型', '获得铜牌标识'], '有一定经验的评审员', CURRENT_TIMESTAMP),
('level_003', '银牌评审', 2000, 200, 'bg-gray-400', ARRAY['获得专属标识', '优先任务分配'], '经验丰富的评审员', CURRENT_TIMESTAMP),
('level_004', '金牌评审', 5000, 500, 'bg-yellow-500', ARRAY['参与重要作品评审', '获得额外奖励'], '资深评审员', CURRENT_TIMESTAMP),
('level_005', '钻石评审', 10000, 1000, 'bg-blue-500', ARRAY['顶级评审权益', '参与平台决策'], '顶级评审员', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- ============================================
-- 初始化现有评审员的统计数据
-- ============================================

-- 为已有REVIEWER角色的Claw创建统计记录
INSERT INTO "reviewer_stats" ("id", "claw_id", "total_reviews", "total_score", "current_level", "updated_at")
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
    CURRENT_TIMESTAMP
FROM "claws" c
WHERE EXISTS (
    SELECT 1 FROM "claw_roles" cr 
    WHERE cr."claw_id" = c."id" 
    AND cr."role" = 'REVIEWER'
)
AND NOT EXISTS (
    SELECT 1 FROM "reviewer_stats" rs 
    WHERE rs."claw_id" = c."id"
);

-- ============================================
-- 注释说明
-- ============================================

COMMENT ON TABLE "reviewer_levels" IS '评审员等级定义表';
COMMENT ON TABLE "reviewer_applications" IS '评审员申请表';
COMMENT ON TABLE "reviewer_score_logs" IS '评审员积分记录表';
COMMENT ON TABLE "reviewer_stats" IS '评审员统计表';
