-- CreateEnum
CREATE TYPE "public"."CarStatus" AS ENUM ('possession', 'contractProceeding', 'contractCompleted');

-- CreateEnum
CREATE TYPE "public"."ContractStatus" AS ENUM ('carInspection', 'priceNegotiation', 'contractDraft', 'contractSuccessful', 'contractFailed');

-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('male', 'female');

-- CreateEnum
CREATE TYPE "public"."AgeGroup" AS ENUM ('teens', 'twenties', 'thirties', 'forties', 'fifties', 'sixties', 'seventies', 'eighties');

-- CreateEnum
CREATE TYPE "public"."Region" AS ENUM ('서울', '경기', '인천', '강원', '충북', '충남', '세종', '대전', '전북', '전남', '광주', '경북', '경남', '대구', '울산', '부산', '제주');

-- CreateEnum
CREATE TYPE "public"."carModelType" AS ENUM ('SEDAN', 'SUV');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "employeeNumber" INTEGER NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "imageUrl" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" INTEGER NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Company" (
    "id" SERIAL NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyCode" TEXT NOT NULL,
    "userCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Car" (
    "id" SERIAL NOT NULL,
    "carNumber" TEXT NOT NULL,
    "manufacturingYear" INTEGER NOT NULL,
    "mileage" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "accidentCount" INTEGER NOT NULL,
    "explanation" TEXT,
    "accidentDetails" TEXT,
    "status" "public"."CarStatus" NOT NULL DEFAULT 'possession',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" INTEGER NOT NULL,

    CONSTRAINT "Car_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Customer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "gender" "public"."Gender" NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "ageGroup" "public"."AgeGroup" NOT NULL,
    "region" "public"."Region" NOT NULL,
    "email" TEXT,
    "memo" TEXT,
    "contractCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" INTEGER NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Contract" (
    "id" SERIAL NOT NULL,
    "status" "public"."ContractStatus" NOT NULL DEFAULT 'carInspection',
    "resolutionDate" TIMESTAMP(3) NOT NULL,
    "contradctPrice" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "carId" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    "contractDocumentId" INTEGER NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ContractDocument" (
    "id" SERIAL NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "contractId" INTEGER NOT NULL,

    CONSTRAINT "ContractDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Manufacturer" (
    "id" SERIAL NOT NULL,
    "manufacturerName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "carId" INTEGER NOT NULL,

    CONSTRAINT "Manufacturer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CarModel" (
    "id" SERIAL NOT NULL,
    "modelName" TEXT NOT NULL,
    "type" "public"."carModelType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "manufacturerId" INTEGER NOT NULL,

    CONSTRAINT "CarModel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_employeeNumber_companyId_key" ON "public"."User"("employeeNumber", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_companyName_key" ON "public"."Company"("companyName");

-- CreateIndex
CREATE UNIQUE INDEX "Company_companyCode_key" ON "public"."Company"("companyCode");

-- CreateIndex
CREATE UNIQUE INDEX "Car_carNumber_companyId_key" ON "public"."Car"("carNumber", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "CarModel_modelName_key" ON "public"."CarModel"("modelName");

-- AddForeignKey
ALTER TABLE "public"."Car" ADD CONSTRAINT "Car_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Customer" ADD CONSTRAINT "Customer_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Contract" ADD CONSTRAINT "Contract_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Contract" ADD CONSTRAINT "Contract_carId_fkey" FOREIGN KEY ("carId") REFERENCES "public"."Car"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Contract" ADD CONSTRAINT "Contract_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContractDocument" ADD CONSTRAINT "ContractDocument_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "public"."Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Manufacturer" ADD CONSTRAINT "Manufacturer_carId_fkey" FOREIGN KEY ("carId") REFERENCES "public"."Car"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CarModel" ADD CONSTRAINT "CarModel_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "public"."Manufacturer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
