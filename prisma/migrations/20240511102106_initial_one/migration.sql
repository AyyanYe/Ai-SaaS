/*
  Warnings:

  - You are about to drop the column `userID` on the `UserApiLimit` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `UserApiLimit` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `UserApiLimit` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "UserApiLimit_userID_key";

-- AlterTable
ALTER TABLE "UserApiLimit" DROP COLUMN "userID",
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserApiLimit_userId_key" ON "UserApiLimit"("userId");
