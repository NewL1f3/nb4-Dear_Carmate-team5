/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[imageId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "imageUrl",
ADD COLUMN     "imageId" INTEGER;

-- CreateTable
CREATE TABLE "Image" (
    "id" SERIAL NOT NULL,
    "fileUrl" VARCHAR(2083) NOT NULL,
    "publicId" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_imageId_key" ON "User"("imageId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
