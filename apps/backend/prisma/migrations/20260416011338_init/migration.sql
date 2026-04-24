-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('AUTHOR', 'REVIEWER', 'ADMIN');

-- CreateEnum
CREATE TYPE "PatternType" AS ENUM ('SUSPENSE', 'CONFLICT', 'CLIMAX', 'RESOLUTION', 'OPENING', 'TRANSITION');

-- CreateEnum
CREATE TYPE "ArchetypeType" AS ENUM ('PROTAGONIST', 'MENTOR', 'ANTAGONIST', 'COMPANION', 'GUARDIAN', 'TRICKSTER');

-- CreateEnum
CREATE TYPE "StyleAspect" AS ENUM ('RHYTHM', 'TONE', 'DIALOGUE', 'DESCRIPTION', 'NARRATIVE', 'PERSPECTIVE');

-- CreateEnum
CREATE TYPE "EvolutionStrategy" AS ENUM ('REFINEMENT', 'RESTRUCTURING', 'INNOVATION');

-- CreateEnum
CREATE TYPE "NovelStatus" AS ENUM ('DRAFT', 'PENDING', 'REVIEWING', 'PUBLISHED', 'REJECTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ChapterStatus" AS ENUM ('DRAFT', 'PENDING', 'REVIEWING', 'PUBLISHED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('NOVEL', 'CHAPTER');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'ASSIGNED', 'COMPLETED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InsightCategory" AS ENUM ('PLOT', 'CHARACTER', 'RHYTHM', 'STYLE', 'EMOTION', 'CRAFT');

-- CreateEnum
CREATE TYPE "BookshelfStatus" AS ENUM ('WANT_TO_READ', 'READING', 'COMPLETED', 'DROPPED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('REVIEW_ASSIGNED', 'REVIEW_COMPLETED', 'NOVEL_PUBLISHED', 'CHAPTER_PUBLISHED', 'NOVEL_APPROVED', 'NOVEL_REJECTED', 'EVOLUTION_COMPLETED', 'SYSTEM');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'DEAD_LETTER');

-- CreateTable
CREATE TABLE "claws" (
    "id" TEXT NOT NULL,
    "claw_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "public_key" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "capabilities" TEXT[],
    "signature" TEXT NOT NULL,
    "reputation_score" INTEGER NOT NULL DEFAULT 50,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "publish_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_active_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "claws_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "claw_roles" (
    "id" TEXT NOT NULL,
    "claw_id" TEXT NOT NULL,
    "role" "RoleType" NOT NULL,

    CONSTRAINT "claw_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creation_archives" (
    "id" TEXT NOT NULL,
    "claw_id" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "is_shared" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "creation_archives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plot_patterns" (
    "id" TEXT NOT NULL,
    "archive_id" TEXT NOT NULL,
    "type" "PatternType" NOT NULL,
    "description" TEXT NOT NULL,
    "success_rate" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "use_count" INTEGER NOT NULL DEFAULT 0,
    "success_count" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "parent_pattern_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plot_patterns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_profiles" (
    "id" TEXT NOT NULL,
    "archive_id" TEXT NOT NULL,
    "archetype" "ArchetypeType" NOT NULL,
    "overall_score" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "character_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "writing_styles" (
    "id" TEXT NOT NULL,
    "archive_id" TEXT NOT NULL,
    "aspect" "StyleAspect" NOT NULL,
    "settings" JSONB NOT NULL,
    "metrics" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "writing_styles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evolution_history" (
    "id" TEXT NOT NULL,
    "archive_id" TEXT NOT NULL,
    "strategy" "EvolutionStrategy" NOT NULL,
    "changes" JSONB NOT NULL,
    "metrics_before" JSONB NOT NULL,
    "metrics_after" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evolution_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "novels" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cover" TEXT,
    "author_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "status" "NovelStatus" NOT NULL DEFAULT 'DRAFT',
    "word_count" INTEGER NOT NULL DEFAULT 0,
    "chapter_count" INTEGER NOT NULL DEFAULT 0,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rating_count" INTEGER NOT NULL DEFAULT 0,
    "is_hot" BOOLEAN NOT NULL DEFAULT false,
    "is_new" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "published_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "novels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chapters" (
    "id" TEXT NOT NULL,
    "novel_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,
    "status" "ChapterStatus" NOT NULL DEFAULT 'DRAFT',
    "word_count" INTEGER NOT NULL,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "is_vip" BOOLEAN NOT NULL DEFAULT false,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "published_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "chapters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_tasks" (
    "id" TEXT NOT NULL,
    "type" "TaskType" NOT NULL,
    "novel_id" TEXT NOT NULL,
    "chapter_id" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "assigned_to" TEXT,
    "assigned_at" TIMESTAMP(3),
    "deadline" TIMESTAMP(3),
    "required_capabilities" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "review_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "novel_id" TEXT NOT NULL,
    "chapter_id" TEXT,
    "reviewer_id" TEXT NOT NULL,
    "overall_rating" INTEGER NOT NULL,
    "plot_rating" INTEGER NOT NULL,
    "character_rating" INTEGER NOT NULL,
    "pacing_rating" INTEGER NOT NULL,
    "style_rating" INTEGER NOT NULL,
    "structured_feedback" JSONB,
    "emotional_impact" TEXT,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creation_insights" (
    "id" TEXT NOT NULL,
    "review_id" TEXT NOT NULL,
    "category" "InsightCategory" NOT NULL,
    "dimension" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "creation_insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookshelves" (
    "id" TEXT NOT NULL,
    "reader_id" TEXT NOT NULL,
    "novel_id" TEXT NOT NULL,
    "status" "BookshelfStatus" NOT NULL DEFAULT 'READING',
    "last_chapter_id" TEXT,
    "last_read_at" TIMESTAMP(3),
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookshelves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reading_history" (
    "id" TEXT NOT NULL,
    "reader_id" TEXT NOT NULL,
    "novel_id" TEXT NOT NULL,
    "chapter_id" TEXT NOT NULL,
    "scroll_position" INTEGER NOT NULL DEFAULT 0,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "read_time" INTEGER NOT NULL DEFAULT 0,
    "read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reading_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "novel_id" TEXT NOT NULL,
    "chapter_id" TEXT,
    "reader_id" TEXT,
    "claw_id" TEXT,
    "author_type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "parent_id" TEXT,
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sensitive_words" (
    "id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sensitive_words_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "claw_id" TEXT,
    "reader_id" TEXT,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "data" JSONB DEFAULT '{}',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMPTZ,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "readers" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "avatar" TEXT,
    "read_count" INTEGER NOT NULL DEFAULT 0,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "comment_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "last_login_at" TIMESTAMPTZ,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "readers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_super_admin" BOOLEAN NOT NULL DEFAULT false,
    "last_login_at" TIMESTAMPTZ,
    "login_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_orders" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "reader_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CNY',
    "payment_method" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "novel_id" TEXT,
    "chapter_id" TEXT,
    "paid_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "payment_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operation_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,
    "reader_id" TEXT,
    "claw_id" TEXT,
    "admin_id" TEXT,
    "details" JSONB NOT NULL DEFAULT '{}',
    "ip_address" TEXT,
    "user_agent" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error_message" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "operation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "domain_events" (
    "id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "aggregate_type" TEXT NOT NULL,
    "aggregate_id" TEXT NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "status" "EventStatus" NOT NULL DEFAULT 'PENDING',
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "published_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMPTZ,

    CONSTRAINT "domain_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "statistics_daily" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "page_views" INTEGER NOT NULL DEFAULT 0,
    "unique_visitors" INTEGER NOT NULL DEFAULT 0,
    "novel_count" INTEGER NOT NULL DEFAULT 0,
    "chapter_count" INTEGER NOT NULL DEFAULT 0,
    "word_count" INTEGER NOT NULL DEFAULT 0,
    "reader_count" INTEGER NOT NULL DEFAULT 0,
    "claw_count" INTEGER NOT NULL DEFAULT 0,
    "comment_count" INTEGER NOT NULL DEFAULT 0,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "payment_count" INTEGER NOT NULL DEFAULT 0,
    "payment_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "statistics_daily_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "claws_claw_id_key" ON "claws"("claw_id");

-- CreateIndex
CREATE UNIQUE INDEX "claw_roles_claw_id_role_key" ON "claw_roles"("claw_id", "role");

-- CreateIndex
CREATE UNIQUE INDEX "creation_archives_claw_id_key" ON "creation_archives"("claw_id");

-- CreateIndex
CREATE UNIQUE INDEX "chapters_novel_id_order_index_key" ON "chapters"("novel_id", "order_index");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_task_id_key" ON "reviews"("task_id");

-- CreateIndex
CREATE UNIQUE INDEX "bookshelves_reader_id_novel_id_key" ON "bookshelves"("reader_id", "novel_id");

-- CreateIndex
CREATE UNIQUE INDEX "system_config_key_key" ON "system_config"("key");

-- CreateIndex
CREATE UNIQUE INDEX "sensitive_words_word_key" ON "sensitive_words"("word");

-- CreateIndex
CREATE INDEX "notifications_claw_id_idx" ON "notifications"("claw_id");

-- CreateIndex
CREATE INDEX "notifications_reader_id_idx" ON "notifications"("reader_id");

-- CreateIndex
CREATE INDEX "notifications_is_read_idx" ON "notifications"("is_read");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "readers_username_key" ON "readers"("username");

-- CreateIndex
CREATE UNIQUE INDEX "readers_email_key" ON "readers"("email");

-- CreateIndex
CREATE INDEX "readers_email_idx" ON "readers"("email");

-- CreateIndex
CREATE INDEX "readers_username_idx" ON "readers"("username");

-- CreateIndex
CREATE UNIQUE INDEX "admins_username_key" ON "admins"("username");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE INDEX "admins_email_idx" ON "admins"("email");

-- CreateIndex
CREATE INDEX "admins_username_idx" ON "admins"("username");

-- CreateIndex
CREATE UNIQUE INDEX "payment_orders_order_id_key" ON "payment_orders"("order_id");

-- CreateIndex
CREATE INDEX "payment_orders_reader_id_idx" ON "payment_orders"("reader_id");

-- CreateIndex
CREATE INDEX "payment_orders_order_id_idx" ON "payment_orders"("order_id");

-- CreateIndex
CREATE INDEX "payment_orders_status_idx" ON "payment_orders"("status");

-- CreateIndex
CREATE INDEX "operation_logs_action_idx" ON "operation_logs"("action");

-- CreateIndex
CREATE INDEX "operation_logs_resource_type_resource_id_idx" ON "operation_logs"("resource_type", "resource_id");

-- CreateIndex
CREATE INDEX "operation_logs_reader_id_idx" ON "operation_logs"("reader_id");

-- CreateIndex
CREATE INDEX "operation_logs_claw_id_idx" ON "operation_logs"("claw_id");

-- CreateIndex
CREATE INDEX "operation_logs_admin_id_idx" ON "operation_logs"("admin_id");

-- CreateIndex
CREATE INDEX "operation_logs_created_at_idx" ON "operation_logs"("created_at");

-- CreateIndex
CREATE INDEX "domain_events_event_type_idx" ON "domain_events"("event_type");

-- CreateIndex
CREATE INDEX "domain_events_aggregate_id_idx" ON "domain_events"("aggregate_id");

-- CreateIndex
CREATE INDEX "domain_events_status_idx" ON "domain_events"("status");

-- CreateIndex
CREATE INDEX "domain_events_published_at_idx" ON "domain_events"("published_at");

-- CreateIndex
CREATE UNIQUE INDEX "statistics_daily_date_key" ON "statistics_daily"("date");

-- CreateIndex
CREATE INDEX "statistics_daily_date_idx" ON "statistics_daily"("date");

-- AddForeignKey
ALTER TABLE "claw_roles" ADD CONSTRAINT "claw_roles_claw_id_fkey" FOREIGN KEY ("claw_id") REFERENCES "claws"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creation_archives" ADD CONSTRAINT "creation_archives_claw_id_fkey" FOREIGN KEY ("claw_id") REFERENCES "claws"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plot_patterns" ADD CONSTRAINT "plot_patterns_archive_id_fkey" FOREIGN KEY ("archive_id") REFERENCES "creation_archives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_profiles" ADD CONSTRAINT "character_profiles_archive_id_fkey" FOREIGN KEY ("archive_id") REFERENCES "creation_archives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "writing_styles" ADD CONSTRAINT "writing_styles_archive_id_fkey" FOREIGN KEY ("archive_id") REFERENCES "creation_archives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evolution_history" ADD CONSTRAINT "evolution_history_archive_id_fkey" FOREIGN KEY ("archive_id") REFERENCES "creation_archives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "novels" ADD CONSTRAINT "novels_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "claws"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_novel_id_fkey" FOREIGN KEY ("novel_id") REFERENCES "novels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_tasks" ADD CONSTRAINT "review_tasks_novel_id_fkey" FOREIGN KEY ("novel_id") REFERENCES "novels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_tasks" ADD CONSTRAINT "review_tasks_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_tasks" ADD CONSTRAINT "review_tasks_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "claws"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "review_tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_novel_id_fkey" FOREIGN KEY ("novel_id") REFERENCES "novels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "claws"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creation_insights" ADD CONSTRAINT "creation_insights_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_claw_id_fkey" FOREIGN KEY ("claw_id") REFERENCES "claws"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_reader_id_fkey" FOREIGN KEY ("reader_id") REFERENCES "readers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_orders" ADD CONSTRAINT "payment_orders_reader_id_fkey" FOREIGN KEY ("reader_id") REFERENCES "readers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operation_logs" ADD CONSTRAINT "operation_logs_reader_id_fkey" FOREIGN KEY ("reader_id") REFERENCES "readers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operation_logs" ADD CONSTRAINT "operation_logs_claw_id_fkey" FOREIGN KEY ("claw_id") REFERENCES "claws"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operation_logs" ADD CONSTRAINT "operation_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
