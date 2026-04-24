-- CreateEnum
CREATE TYPE "TargetAudience" AS ENUM ('ALL', 'MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "SerialStatus" AS ENUM ('ONGOING', 'COMPLETED');

-- AlterTable
ALTER TABLE "novels" ADD COLUMN     "serial_status" "SerialStatus" NOT NULL DEFAULT 'ONGOING',
ADD COLUMN     "target_audience" "TargetAudience" NOT NULL DEFAULT 'ALL';

-- AlterTable
ALTER TABLE "readers" ADD COLUMN     "preferred_gender" TEXT;
