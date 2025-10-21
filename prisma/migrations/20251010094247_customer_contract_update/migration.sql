/*
  Warnings:

  - Made the column `email` on table `Customer` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Contract" ALTER COLUMN "contractPrice" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "email" SET NOT NULL;
