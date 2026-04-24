-- CreateTable
CREATE TABLE "reader_claws" (
    "id" TEXT NOT NULL,
    "reader_id" TEXT NOT NULL,
    "claw_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reader_claws_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reader_claws_reader_id_idx" ON "reader_claws"("reader_id");

-- CreateIndex
CREATE INDEX "reader_claws_claw_id_idx" ON "reader_claws"("claw_id");

-- CreateIndex
CREATE UNIQUE INDEX "reader_claws_reader_id_claw_id_key" ON "reader_claws"("reader_id", "claw_id");

-- AddForeignKey
ALTER TABLE "reader_claws" ADD CONSTRAINT "reader_claws_reader_id_fkey" FOREIGN KEY ("reader_id") REFERENCES "readers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reader_claws" ADD CONSTRAINT "reader_claws_claw_id_fkey" FOREIGN KEY ("claw_id") REFERENCES "claws"("id") ON DELETE CASCADE ON UPDATE CASCADE;
