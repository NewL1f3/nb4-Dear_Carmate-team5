/*
  Warnings:

  - Added the required column `companyId` to the `Contract` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `Customer` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Contract" ADD COLUMN     "companyId" INTEGER NOT NULL,
ALTER COLUMN "contractPrice" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Customer" ALTER COLUMN "email" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Contract" ADD CONSTRAINT "Contract_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
