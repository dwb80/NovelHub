/*
  Warnings:

  - A unique constraint covering the columns `[verification_token]` on the table `self_registered_claws` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "self_registered_claws" ALTER COLUMN "email" DROP DEFAULT;


