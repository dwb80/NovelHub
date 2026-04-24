/*
  Warnings:

  - The `status` column on the `reviewer_applications` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `type` on the `reviewer_score_logs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'REVIEWING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ScoreType" AS ENUM ('BASE_REVIEW', 'DETAILED_REVIEW', 'LIKED_REVIEW', 'BONUS', 'PENALTY', 'CORRECTION');

-- DropForeignKey
ALTER TABLE "reviewer_score_logs" DROP CONSTRAINT "reviewer_score_logs_claw_id_fkey";

-- DropForeignKey
ALTER TABLE "reviewer_stats" DROP CONSTRAINT "reviewer_stats_claw_id_fkey";

-- AlterTable
ALTER TABLE "reviewer_applications" DROP COLUMN "status",
ADD COLUMN     "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "reviewer_score_logs" DROP COLUMN "type",
ADD COLUMN     "type" "ScoreType" NOT NULL;

-- CreateTable
CREATE TABLE "evolution_milestones" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirement" TEXT NOT NULL,
    "reward" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "icon" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evolution_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "milestone_progress" (
    "id" TEXT NOT NULL,
    "claw_id" TEXT NOT NULL,
    "milestone_id" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "milestone_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "evolution_milestones_order_idx" ON "evolution_milestones"("order");

-- CreateIndex
CREATE INDEX "evolution_milestones_is_active_idx" ON "evolution_milestones"("is_active");

-- CreateIndex
CREATE INDEX "milestone_progress_claw_id_idx" ON "milestone_progress"("claw_id");

-- CreateIndex
CREATE INDEX "milestone_progress_milestone_id_idx" ON "milestone_progress"("milestone_id");

-- CreateIndex
CREATE INDEX "milestone_progress_completed_idx" ON "milestone_progress"("completed");

-- CreateIndex
CREATE UNIQUE INDEX "milestone_progress_claw_id_milestone_id_key" ON "milestone_progress"("claw_id", "milestone_id");

-- CreateIndex
CREATE INDEX "reviewer_applications_status_idx" ON "reviewer_applications"("status");

-- CreateIndex
CREATE INDEX "reviewer_score_logs_type_idx" ON "reviewer_score_logs"("type");

-- AddForeignKey
ALTER TABLE "reviewer_score_logs" ADD CONSTRAINT "reviewer_score_logs_claw_id_fkey" FOREIGN KEY ("claw_id") REFERENCES "claws"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviewer_stats" ADD CONSTRAINT "reviewer_stats_claw_id_fkey" FOREIGN KEY ("claw_id") REFERENCES "claws"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestone_progress" ADD CONSTRAINT "milestone_progress_claw_id_fkey" FOREIGN KEY ("claw_id") REFERENCES "claws"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestone_progress" ADD CONSTRAINT "milestone_progress_milestone_id_fkey" FOREIGN KEY ("milestone_id") REFERENCES "evolution_milestones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
