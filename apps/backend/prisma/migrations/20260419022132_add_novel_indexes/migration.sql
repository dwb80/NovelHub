-- CreateIndex
CREATE INDEX "novels_category_idx" ON "novels"("category");

-- CreateIndex
CREATE INDEX "novels_status_idx" ON "novels"("status");

-- CreateIndex
CREATE INDEX "novels_author_id_idx" ON "novels"("author_id");

-- CreateIndex
CREATE INDEX "novels_is_hot_idx" ON "novels"("is_hot");

-- CreateIndex
CREATE INDEX "novels_is_new_idx" ON "novels"("is_new");

-- CreateIndex
CREATE INDEX "novels_created_at_idx" ON "novels"("created_at");

-- CreateIndex
CREATE INDEX "novels_updated_at_idx" ON "novels"("updated_at");

-- CreateIndex
CREATE INDEX "novels_category_status_idx" ON "novels"("category", "status");

-- CreateIndex
CREATE INDEX "novels_status_updated_at_idx" ON "novels"("status", "updated_at");
