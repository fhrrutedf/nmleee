/*
  Warnings:

  - You are about to drop the column `crmContactId` on the `CourseEnrollment` table. All the data in the column will be lost.
  - You are about to drop the column `crmContactId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the `CRMCommunication` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CRMContact` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CRMDeal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CRMSettings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CRMTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CRMTask` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CRMContactToCRMTag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CRMCommunication" DROP CONSTRAINT "CRMCommunication_contactId_fkey";

-- DropForeignKey
ALTER TABLE "CRMCommunication" DROP CONSTRAINT "CRMCommunication_dealId_fkey";

-- DropForeignKey
ALTER TABLE "CRMCommunication" DROP CONSTRAINT "CRMCommunication_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "CRMContact" DROP CONSTRAINT "CRMContact_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "CRMDeal" DROP CONSTRAINT "CRMDeal_contactId_fkey";

-- DropForeignKey
ALTER TABLE "CRMDeal" DROP CONSTRAINT "CRMDeal_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "CRMSettings" DROP CONSTRAINT "CRMSettings_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "CRMTag" DROP CONSTRAINT "CRMTag_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "CRMTask" DROP CONSTRAINT "CRMTask_contactId_fkey";

-- DropForeignKey
ALTER TABLE "CRMTask" DROP CONSTRAINT "CRMTask_dealId_fkey";

-- DropForeignKey
ALTER TABLE "CRMTask" DROP CONSTRAINT "CRMTask_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "CourseEnrollment" DROP CONSTRAINT "CourseEnrollment_crmContactId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_crmContactId_fkey";

-- DropForeignKey
ALTER TABLE "_CRMContactToCRMTag" DROP CONSTRAINT "_CRMContactToCRMTag_A_fkey";

-- DropForeignKey
ALTER TABLE "_CRMContactToCRMTag" DROP CONSTRAINT "_CRMContactToCRMTag_B_fkey";

-- AlterTable
ALTER TABLE "CourseEnrollment" DROP COLUMN "crmContactId";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "crmContactId";

-- DropTable
DROP TABLE "CRMCommunication";

-- DropTable
DROP TABLE "CRMContact";

-- DropTable
DROP TABLE "CRMDeal";

-- DropTable
DROP TABLE "CRMSettings";

-- DropTable
DROP TABLE "CRMTag";

-- DropTable
DROP TABLE "CRMTask";

-- DropTable
DROP TABLE "_CRMContactToCRMTag";
