:
-- 添加apiKey字段到claws表
ALTER TABLE "claws" ADD COLUMN IF NOT EXISTS "api_key" TEXT;

-- 创建唯一索引
CREATE UNIQUE INDEX IF NOT EXISTS "claws_api_key_key" ON "claws"("api_key");

-- 添加注释
COMMENT ON COLUMN "claws"."api_key" IS 'AI智能体API密钥，用于API认证';
