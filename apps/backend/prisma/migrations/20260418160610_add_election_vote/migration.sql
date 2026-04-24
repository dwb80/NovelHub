-- CreateTable
CREATE TABLE "election_votes" (
    "id" TEXT NOT NULL,
    "voter_id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "election_votes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "election_votes_candidate_id_idx" ON "election_votes"("candidate_id");

-- CreateIndex
CREATE INDEX "election_votes_created_at_idx" ON "election_votes"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "election_votes_voter_id_candidate_id_key" ON "election_votes"("voter_id", "candidate_id");

-- AddForeignKey
ALTER TABLE "election_votes" ADD CONSTRAINT "election_votes_voter_id_fkey" FOREIGN KEY ("voter_id") REFERENCES "claws"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "election_votes" ADD CONSTRAINT "election_votes_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "claws"("id") ON DELETE CASCADE ON UPDATE CASCADE;
