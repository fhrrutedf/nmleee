/*
  Warnings:

  - You are about to drop the `PlatformEvent` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "CourseEnrollment" ADD COLUMN     "crmContactId" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "crmContactId" TEXT;

-- DropTable
DROP TABLE "PlatformEvent";

-- CreateTable
CREATE TABLE "CRMContact" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "sourceDetails" TEXT,
    "status" TEXT NOT NULL DEFAULT 'lead',
    "customFields" JSONB DEFAULT '{}',
    "notes" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastContactedAt" TIMESTAMP(3),

    CONSTRAINT "CRMContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CRMTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#10B981',
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CRMTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CRMDeal" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "stage" TEXT NOT NULL DEFAULT 'lead',
    "probability" INTEGER DEFAULT 0,
    "expectedCloseDate" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "lossReason" TEXT,
    "contactId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "productId" TEXT,
    "courseId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CRMDeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CRMTask" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "type" TEXT NOT NULL DEFAULT 'general',
    "contactId" TEXT,
    "dealId" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CRMTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CRMCommunication" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "direction" TEXT NOT NULL DEFAULT 'outbound',
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "callDuration" INTEGER,
    "callRecordingUrl" TEXT,
    "emailStatus" TEXT,
    "contactId" TEXT NOT NULL,
    "dealId" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CRMCommunication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CRMSettings" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "dealStages" TEXT[] DEFAULT ARRAY['lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost']::TEXT[],
    "taskTypes" TEXT[] DEFAULT ARRAY['call', 'email', 'meeting', 'follow_up', 'general']::TEXT[],
    "leadSources" TEXT[] DEFAULT ARRAY['website', 'social_media', 'referral', 'advertisement', 'manual']::TEXT[],
    "autoCreateContactsFromOrders" BOOLEAN NOT NULL DEFAULT true,
    "autoCreateContactsFromEnrollments" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CRMSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CRMContactToCRMTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "CRMContact_ownerId_idx" ON "CRMContact"("ownerId");

-- CreateIndex
CREATE INDEX "CRMContact_email_idx" ON "CRMContact"("email");

-- CreateIndex
CREATE INDEX "CRMContact_status_idx" ON "CRMContact"("status");

-- CreateIndex
CREATE INDEX "CRMContact_source_idx" ON "CRMContact"("source");

-- CreateIndex
CREATE INDEX "CRMTag_ownerId_idx" ON "CRMTag"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "CRMTag_ownerId_name_key" ON "CRMTag"("ownerId", "name");

-- CreateIndex
CREATE INDEX "CRMDeal_ownerId_idx" ON "CRMDeal"("ownerId");

-- CreateIndex
CREATE INDEX "CRMDeal_contactId_idx" ON "CRMDeal"("contactId");

-- CreateIndex
CREATE INDEX "CRMDeal_stage_idx" ON "CRMDeal"("stage");

-- CreateIndex
CREATE INDEX "CRMDeal_expectedCloseDate_idx" ON "CRMDeal"("expectedCloseDate");

-- CreateIndex
CREATE INDEX "CRMTask_ownerId_idx" ON "CRMTask"("ownerId");

-- CreateIndex
CREATE INDEX "CRMTask_contactId_idx" ON "CRMTask"("contactId");

-- CreateIndex
CREATE INDEX "CRMTask_dealId_idx" ON "CRMTask"("dealId");

-- CreateIndex
CREATE INDEX "CRMTask_status_idx" ON "CRMTask"("status");

-- CreateIndex
CREATE INDEX "CRMTask_dueDate_idx" ON "CRMTask"("dueDate");

-- CreateIndex
CREATE INDEX "CRMCommunication_ownerId_idx" ON "CRMCommunication"("ownerId");

-- CreateIndex
CREATE INDEX "CRMCommunication_contactId_idx" ON "CRMCommunication"("contactId");

-- CreateIndex
CREATE INDEX "CRMCommunication_dealId_idx" ON "CRMCommunication"("dealId");

-- CreateIndex
CREATE INDEX "CRMCommunication_type_idx" ON "CRMCommunication"("type");

-- CreateIndex
CREATE INDEX "CRMCommunication_createdAt_idx" ON "CRMCommunication"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CRMSettings_ownerId_key" ON "CRMSettings"("ownerId");

-- CreateIndex
CREATE INDEX "CRMSettings_ownerId_idx" ON "CRMSettings"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "_CRMContactToCRMTag_AB_unique" ON "_CRMContactToCRMTag"("A", "B");

-- CreateIndex
CREATE INDEX "_CRMContactToCRMTag_B_index" ON "_CRMContactToCRMTag"("B");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_crmContactId_fkey" FOREIGN KEY ("crmContactId") REFERENCES "CRMContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_crmContactId_fkey" FOREIGN KEY ("crmContactId") REFERENCES "CRMContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRMContact" ADD CONSTRAINT "CRMContact_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRMTag" ADD CONSTRAINT "CRMTag_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRMDeal" ADD CONSTRAINT "CRMDeal_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "CRMContact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRMDeal" ADD CONSTRAINT "CRMDeal_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRMTask" ADD CONSTRAINT "CRMTask_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "CRMContact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRMTask" ADD CONSTRAINT "CRMTask_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "CRMDeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRMTask" ADD CONSTRAINT "CRMTask_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRMCommunication" ADD CONSTRAINT "CRMCommunication_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "CRMContact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRMCommunication" ADD CONSTRAINT "CRMCommunication_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "CRMDeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRMCommunication" ADD CONSTRAINT "CRMCommunication_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRMSettings" ADD CONSTRAINT "CRMSettings_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CRMContactToCRMTag" ADD CONSTRAINT "_CRMContactToCRMTag_A_fkey" FOREIGN KEY ("A") REFERENCES "CRMContact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CRMContactToCRMTag" ADD CONSTRAINT "_CRMContactToCRMTag_B_fkey" FOREIGN KEY ("B") REFERENCES "CRMTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
