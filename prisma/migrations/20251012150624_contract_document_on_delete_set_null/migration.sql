-- DropForeignKey
ALTER TABLE "public"."ContractDocument" DROP CONSTRAINT "ContractDocument_contractId_fkey";

-- AddForeignKey
ALTER TABLE "ContractDocument" ADD CONSTRAINT "ContractDocument_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;
