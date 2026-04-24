/*
  Warnings:

  - You are about to drop the column `confidence` on the `creation_insights` table. All the data in the column will be lost.
  - You are about to drop the column `dimension` on the `creation_insights` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `creation_insights` table. All the data in the column will be lost.
  - You are about to drop the column `assigned_to` on the `review_tasks` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `claws` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[event_id]` on the table `domain_events` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[order_no]` on the table `payment_orders` will be added. If there are existing duplicate values, this will fail.
*/
-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'ASSIGNED', 'COMPLETED', 'REJECTED');

-- CreateEnum
CREATE TYPE "InsightSeverity" AS ENUM ('INFO', 'SUGGESTION', 'WARNING', 'CRITICAL');

-- DropForeignKey
ALTER TABLE "review_tasks" DROP CONSTRAINT "review_tasks_assigned_to_fkey";

-- DropIndex
DROP INDEX "review_tasks_assigned_to_status_idx";

-- AlterTable
ALTER TABLE "alerts" ADD COLUMN     "is_resolved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "severity" TEXT NOT NULL DEFAULT 'info',
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'system';

-- AlterTable
ALTER TABLE "behavior_logs" ADD COLUMN     "resource_id" TEXT,
ADD COLUMN     "resource_type" TEXT,
ADD COLUMN     "user_id" TEXT;

-- AlterTable
ALTER TABLE "bookshelves" ADD COLUMN     "claw_id" TEXT;

-- AlterTable
ALTER TABLE "character_profiles" ADD COLUMN     "name" TEXT NOT NULL DEFAULT 'Unknown Character',
ADD COLUMN     "usage_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "claws" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "display_name" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "last_login_at" TIMESTAMP(3),
ADD COLUMN     "password" TEXT,
ADD COLUMN     "reputation" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'AI';

-- AlterTable
ALTER TABLE "creation_archives" ADD COLUMN     "creation_maturity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "last_evolution_at" TIMESTAMP(3),
ADD COLUMN     "total_evolutions" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "creation_insights" DROP COLUMN "confidence",
DROP COLUMN "dimension",
DROP COLUMN "value",
ADD COLUMN     "description" TEXT NOT NULL DEFAULT 'No description',
ADD COLUMN     "location" TEXT,
ADD COLUMN     "severity" "InsightSeverity" NOT NULL DEFAULT 'INFO',
ADD COLUMN     "suggestion" TEXT,
ADD COLUMN     "title" TEXT NOT NULL DEFAULT 'No title';

-- AlterTable
ALTER TABLE "domain_events" ADD COLUMN     "event_id" TEXT NOT NULL DEFAULT 'event_' || gen_random_uuid();

-- AlterTable
ALTER TABLE "evolution_history" ADD COLUMN     "applied_at" TIMESTAMP(3),
ADD COLUMN     "chapter_id" TEXT,
ADD COLUMN     "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
ADD COLUMN     "evolved_content" TEXT,
ADD COLUMN     "original_content" TEXT;

-- AlterTable
ALTER TABLE "forge_score_history" ADD COLUMN     "reason" TEXT;

-- AlterTable
ALTER TABLE "novels" ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "operation_logs" ADD COLUMN     "operator_id" TEXT NOT NULL DEFAULT 'system',
ADD COLUMN     "operator_type" TEXT NOT NULL DEFAULT 'system',
ADD COLUMN     "target_id" TEXT NOT NULL DEFAULT 'unknown',
ADD COLUMN     "target_type" TEXT NOT NULL DEFAULT 'unknown',
ALTER COLUMN "resource_type" DROP NOT NULL,
ALTER COLUMN "resource_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "payment_orders" ADD COLUMN     "order_no" TEXT NOT NULL DEFAULT 'order_' || gen_random_uuid();

-- AlterTable
ALTER TABLE "plot_patterns" ADD COLUMN     "name" TEXT NOT NULL DEFAULT 'Unknown Pattern';

-- AlterTable
ALTER TABLE "readers" ADD COLUMN     "password" TEXT NOT NULL DEFAULT 'default_password';

-- AlterTable
ALTER TABLE "reading_history" ADD COLUMN     "claw_id" TEXT;

-- AlterTable
ALTER TABLE "review_tasks" DROP COLUMN "assigned_to",
ADD COLUMN     "reviewer_id" TEXT;

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "overall_score" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE UNIQUE INDEX "claws_email_key" ON "claws"("email");

-- CreateIndex
CREATE UNIQUE INDEX "domain_events_event_id_key" ON "domain_events"("event_id");

-- CreateIndex
CREATE INDEX "evolution_history_chapter_id_idx" ON "evolution_history"("chapter_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_orders_order_no_key" ON "payment_orders"("order_no");

-- CreateIndex
CREATE INDEX "review_tasks_reviewer_id_status_idx" ON "review_tasks"("reviewer_id", "status");

-- AddForeignKey
ALTER TABLE "review_tasks" ADD CONSTRAINT "review_tasks_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "claws"("id") ON DELETE SET NULL ON UPDATE CASCADE;
