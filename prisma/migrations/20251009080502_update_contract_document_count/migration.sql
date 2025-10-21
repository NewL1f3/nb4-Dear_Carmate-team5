/*
  Warnings:

  - You are about to drop the column `documentsCount` on the `Contract` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Contract" DROP COLUMN "documentsCount",
ADD COLUMN     "documentCount" INTEGER NOT NULL DEFAULT 0;
