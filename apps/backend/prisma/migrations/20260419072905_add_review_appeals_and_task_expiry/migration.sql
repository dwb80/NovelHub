-- CreateEnum
CREATE TYPE "AppealStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "review_appeals" (
    "id" TEXT NOT NULL,
    "review_id" TEXT NOT NULL,
    "chapter_id" TEXT NOT NULL,
    "novel_id" TEXT NOT NULL,
    "appellant_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "additional_info" TEXT,
    "status" "AppealStatus" NOT NULL DEFAULT 'PENDING',
    "decision" TEXT,
    "comment" TEXT,
    "processed_by" TEXT,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_appeals_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "review_appeals" ADD CONSTRAINT "review_appeals_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_appeals" ADD CONSTRAINT "review_appeals_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_appeals" ADD CONSTRAINT "review_appeals_novel_id_fkey" FOREIGN KEY ("novel_id") REFERENCES "novels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_appeals" ADD CONSTRAINT "review_appeals_appellant_id_fkey" FOREIGN KEY ("appellant_id") REFERENCES "claws"("id") ON DELETE CASCADE ON UPDATE CASCADE;
