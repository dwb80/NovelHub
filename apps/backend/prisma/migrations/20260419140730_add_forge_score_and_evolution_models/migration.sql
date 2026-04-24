-- CreateTable
CREATE TABLE "forge_score_history" (
    "id" TEXT NOT NULL,
    "claw_id" TEXT NOT NULL,
    "base_score" DOUBLE PRECISION NOT NULL,
    "evolution_score" DOUBLE PRECISION NOT NULL,
    "feedback_score" DOUBLE PRECISION NOT NULL,
    "innovation_score" DOUBLE PRECISION NOT NULL,
    "consistency_score" DOUBLE PRECISION NOT NULL,
    "total_score" DOUBLE PRECISION NOT NULL,
    "metrics" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forge_score_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "natural_selection_history" (
    "id" TEXT NOT NULL,
    "total_candidates" INTEGER NOT NULL,
    "selected_count" INTEGER NOT NULL,
    "threshold" DOUBLE PRECISION NOT NULL,
    "selectedIds" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "natural_selection_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "module_inheritance_history" (
    "id" TEXT NOT NULL,
    "parent_id" TEXT NOT NULL,
    "child_id" TEXT NOT NULL,
    "inherited_patterns" INTEGER NOT NULL DEFAULT 0,
    "inherited_profiles" INTEGER NOT NULL DEFAULT 0,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "module_inheritance_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "forge_score_history_claw_id_idx" ON "forge_score_history"("claw_id");

-- CreateIndex
CREATE INDEX "forge_score_history_total_score_idx" ON "forge_score_history"("total_score");

-- CreateIndex
CREATE INDEX "forge_score_history_created_at_idx" ON "forge_score_history"("created_at");

-- CreateIndex
CREATE INDEX "natural_selection_history_created_at_idx" ON "natural_selection_history"("created_at");

-- CreateIndex
CREATE INDEX "module_inheritance_history_parent_id_idx" ON "module_inheritance_history"("parent_id");

-- CreateIndex
CREATE INDEX "module_inheritance_history_child_id_idx" ON "module_inheritance_history"("child_id");

-- CreateIndex
CREATE INDEX "module_inheritance_history_created_at_idx" ON "module_inheritance_history"("created_at");

-- CreateIndex
CREATE INDEX "chapters_novel_id_status_idx" ON "chapters"("novel_id", "status");

-- CreateIndex
CREATE INDEX "chapters_status_created_at_idx" ON "chapters"("status", "created_at");

-- CreateIndex
CREATE INDEX "creation_archives_claw_id_idx" ON "creation_archives"("claw_id");

-- CreateIndex
CREATE INDEX "creation_archives_is_shared_idx" ON "creation_archives"("is_shared");

-- CreateIndex
CREATE INDEX "evolution_history_archive_id_idx" ON "evolution_history"("archive_id");

-- CreateIndex
CREATE INDEX "evolution_history_strategy_idx" ON "evolution_history"("strategy");

-- CreateIndex
CREATE INDEX "evolution_history_created_at_idx" ON "evolution_history"("created_at");

-- CreateIndex
CREATE INDEX "review_tasks_status_created_at_idx" ON "review_tasks"("status", "created_at");

-- CreateIndex
CREATE INDEX "review_tasks_assigned_to_status_idx" ON "review_tasks"("assigned_to", "status");

-- CreateIndex
CREATE INDEX "review_tasks_novel_id_status_idx" ON "review_tasks"("novel_id", "status");

-- AddForeignKey
ALTER TABLE "forge_score_history" ADD CONSTRAINT "forge_score_history_claw_id_fkey" FOREIGN KEY ("claw_id") REFERENCES "claws"("id") ON DELETE CASCADE ON UPDATE CASCADE;
