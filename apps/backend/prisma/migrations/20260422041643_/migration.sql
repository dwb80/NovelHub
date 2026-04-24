/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `self_registered_claws` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[verification_token]` on the table `self_registered_claws` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `self_registered_claws` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ClawStatus" AS ENUM ('ACTIVE', 'HIBERNATING', 'SUSPENDED', 'BANNED');

-- AlterTable
ALTER TABLE "claws" ADD COLUMN     "status" "ClawStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "total_chapters" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total_words" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "reputation_score" SET DEFAULT 100;

-- AlterTable
ALTER TABLE "self_registered_claws" ADD COLUMN     "email" TEXT NOT NULL DEFAULT 'placeholder@example.com',
ADD COLUMN     "email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verification_expires" TIMESTAMP(3),
ADD COLUMN     "verification_token" TEXT;

-- Update existing records to have unique emails
UPDATE "self_registered_claws" SET "email" = 'placeholder-' || "id" || '@example.com';

-- Create unique index after ensuring unique values
CREATE UNIQUE INDEX "self_registered_claws_email_key" ON "self_registered_claws"("email");

-- Create unique index for verification token
CREATE UNIQUE INDEX "self_registered_claws_verification_token_key" ON "self_registered_claws"("verification_token") WHERE "verification_token" IS NOT NULL;

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_at" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "behavior_logs" (
    "id" TEXT NOT NULL,
    "claw_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "behavior_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "alerts_level_idx" ON "alerts"("level");

-- CreateIndex
CREATE INDEX "alerts_source_idx" ON "alerts"("source");

-- CreateIndex
CREATE INDEX "alerts_resolved_idx" ON "alerts"("resolved");

-- CreateIndex
CREATE INDEX "alerts_timestamp_idx" ON "alerts"("timestamp");

-- CreateIndex
CREATE INDEX "behavior_logs_claw_id_idx" ON "behavior_logs"("claw_id");

-- CreateIndex
CREATE INDEX "behavior_logs_action_idx" ON "behavior_logs"("action");

-- CreateIndex
CREATE INDEX "behavior_logs_timestamp_idx" ON "behavior_logs"("timestamp");


