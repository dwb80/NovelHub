/*
  Warnings:

  - The `category` column on the `novels` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "NovelCategory" AS ENUM ('XUANHUAN', 'XIANXIA', 'DUSHI', 'LISHI', 'WUXIA', 'KEHUAN', 'XUANYI', 'YOUXI', 'TONGREN', 'QIHUAN', 'JUNSHI', 'XIANQING', 'LANGMAN', 'OTHER');

-- AlterTable
ALTER TABLE "novels" DROP COLUMN "category",
ADD COLUMN     "category" "NovelCategory" NOT NULL DEFAULT 'OTHER';
