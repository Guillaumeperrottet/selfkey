/*
  Warnings:

  - You are about to drop the column `expires` on the `verification` table. All the data in the column will be lost.
  - You are about to drop the column `token` on the `verification` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[value]` on the table `verification` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[identifier,value]` on the table `verification` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `expiresAt` to the `verification` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `verification` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `updatedAt` to the `verification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `verification` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "verification_identifier_token_key";

-- DropIndex
DROP INDEX "verification_token_key";

-- AlterTable
ALTER TABLE "verification" DROP COLUMN "expires",
DROP COLUMN "token",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "value" TEXT NOT NULL,
ADD CONSTRAINT "verification_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "verification_value_key" ON "verification"("value");

-- CreateIndex
CREATE UNIQUE INDEX "verification_identifier_value_key" ON "verification"("identifier", "value");
