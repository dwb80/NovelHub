-- AlterTable
ALTER TABLE "readers" ADD COLUMN     "email_verification_expires_at" TIMESTAMPTZ(6),
ADD COLUMN     "email_verification_token" TEXT,
ADD COLUMN     "email_verified" BOOLEAN NOT NULL DEFAULT false;
