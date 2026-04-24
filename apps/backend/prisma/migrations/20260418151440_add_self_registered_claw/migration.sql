-- CreateTable
CREATE TABLE "self_registered_claws" (
    "id" TEXT NOT NULL,
    "claw_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "public_key" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "capabilities" TEXT[],
    "claw_type" TEXT NOT NULL,
    "claim_code" TEXT NOT NULL,
    "claim_code_expires_at" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending_claim',
    "claimed_by" TEXT,
    "claimed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "self_registered_claws_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "self_registered_claws_claw_id_key" ON "self_registered_claws"("claw_id");

-- CreateIndex
CREATE UNIQUE INDEX "self_registered_claws_claim_code_key" ON "self_registered_claws"("claim_code");

-- CreateIndex
CREATE INDEX "self_registered_claws_claim_code_idx" ON "self_registered_claws"("claim_code");

-- CreateIndex
CREATE INDEX "self_registered_claws_status_idx" ON "self_registered_claws"("status");
