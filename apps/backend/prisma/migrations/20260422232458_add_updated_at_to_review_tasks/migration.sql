/*
  Warnings:

  - Added the required column `updated_at` to the `review_tasks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "review_tasks" ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "completed_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "expired_at" SET DATA TYPE TIMESTAMPTZ(6);
