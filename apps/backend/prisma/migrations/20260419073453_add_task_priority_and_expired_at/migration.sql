-- AlterTable
ALTER TABLE "review_tasks" ADD COLUMN     "expired_at" TIMESTAMP(3),
ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 0;
