/*
  Warnings:

  - A unique constraint covering the columns `[novel_id,title]` on the table `chapters` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `claws` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[title]` on the table `novels` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "chapters_novel_id_title_key" ON "chapters"("novel_id", "title");

-- CreateIndex
CREATE UNIQUE INDEX "claws_name_key" ON "claws"("name");

-- CreateIndex
CREATE UNIQUE INDEX "novels_title_key" ON "novels"("title");
