-- CreateEnum
CREATE TYPE "public"."GenderEnum" AS ENUM ('male', 'female');

-- CreateEnum
CREATE TYPE "public"."AgeGroupEnum" AS ENUM ('10대', '20대', '30대', '40대', '50대', '60대', '70대', '80대');

-- CreateEnum
CREATE TYPE "public"."RegionEnum" AS ENUM ('서울', '경기', '인천', '강원', '충북', '충남', '세종', '대전', '전북', '전남', '광주', '경북', '경남', '대구', '울산', '부산', '제주');

-- CreateEnum
CREATE TYPE "public"."CarStatusEnum" AS ENUM ('possession', 'contractProceeding', 'contractCompleted');

-- CreateEnum
CREATE TYPE "public"."ContractStatusEnum" AS ENUM ('carInspection', 'priceNegotiation', 'contractDraft', 'contractSuccessful', 'contractFailed');

-- CreateEnum
CREATE TYPE "public"."CarModelTypeEnum" AS ENUM ('경차', '세단', 'SUV', '해치백', '컨버터블', '트럭', '밴');

-- CreateTable
CREATE TABLE "public"."Company" (
    "id" SERIAL NOT NULL,
    "companyName" VARCHAR(100) NOT NULL,
    "companyCode" VARCHAR(50) NOT NULL,
    "userCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "employeeNumber" VARCHAR(50) NOT NULL,
    "phoneNumber" VARCHAR(20) NOT NULL,
    "imageUrl" VARCHAR(2083),
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "password" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Customer" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "gender" "public"."GenderEnum" NOT NULL,
    "phoneNumber" VARCHAR(20) NOT NULL,
    "ageGroup" "public"."AgeGroupEnum",
    "region" "public"."RegionEnum",
    "email" VARCHAR(255),
    "memo" TEXT,
    "contractCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Manufacturer" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Manufacturer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Model" (
    "id" SERIAL NOT NULL,
    "manufacturerId" INTEGER NOT NULL,
    "modelName" VARCHAR(100) NOT NULL,
    "type" "public"."CarModelTypeEnum" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Model_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Car" (
    "id" SERIAL NOT NULL,
    "modelId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "carNumber" VARCHAR(50) NOT NULL,
    "manufacturingYear" INTEGER NOT NULL,
    "mileage" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "accidentCount" INTEGER NOT NULL DEFAULT 0,
    "explanation" TEXT,
    "accidentDetails" TEXT,
    "status" "public"."CarStatusEnum" NOT NULL DEFAULT 'possession',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Car_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Contract" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    "carId" INTEGER NOT NULL,
    "status" "public"."ContractStatusEnum" NOT NULL,
    "resolutionDate" DATE,
    "contractPrice" INTEGER NOT NULL,
    "contractName" TEXT NOT NULL,
    "documentsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Meeting" (
    "id" SERIAL NOT NULL,
    "contractId" INTEGER NOT NULL,
    "date" TIMESTAMP NOT NULL,
    "alarms" TIMESTAMP[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ContractDocument" (
    "id" SERIAL NOT NULL,
    "contractId" INTEGER NOT NULL,
    "fileName" VARCHAR(255) NOT NULL,
    "fileUrl" VARCHAR(2083) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_companyName_key" ON "public"."Company"("companyName");

-- CreateIndex
CREATE UNIQUE INDEX "Company_companyCode_key" ON "public"."Company"("companyCode");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_employeeNumber_companyId_key" ON "public"."User"("employeeNumber", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_companyId_phoneNumber_key" ON "public"."Customer"("companyId", "phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_companyId_email_key" ON "public"."Customer"("companyId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Manufacturer_name_key" ON "public"."Manufacturer"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Model_manufacturerId_modelName_key" ON "public"."Model"("manufacturerId", "modelName");

-- CreateIndex
CREATE UNIQUE INDEX "Car_companyId_carNumber_key" ON "public"."Car"("companyId", "carNumber");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Customer" ADD CONSTRAINT "Customer_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Model" ADD CONSTRAINT "Model_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "public"."Manufacturer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Car" ADD CONSTRAINT "Car_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "public"."Model"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Car" ADD CONSTRAINT "Car_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Contract" ADD CONSTRAINT "Contract_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Contract" ADD CONSTRAINT "Contract_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Contract" ADD CONSTRAINT "Contract_carId_fkey" FOREIGN KEY ("carId") REFERENCES "public"."Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Meeting" ADD CONSTRAINT "Meeting_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "public"."Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContractDocument" ADD CONSTRAINT "ContractDocument_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "public"."Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;
