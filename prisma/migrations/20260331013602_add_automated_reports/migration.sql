-- CreateTable
CREATE TABLE "AutomatedReport" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "summary" JSONB NOT NULL,
    "topSellers" JSONB NOT NULL,
    "topProducts" JSONB NOT NULL,
    "alerts" JSONB NOT NULL,
    "charts" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'generated',
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailSentAt" TIMESTAMP(3),
    "recipients" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutomatedReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformEvent" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "actorId" TEXT,
    "actorType" TEXT,
    "actorName" TEXT,
    "userId" TEXT,
    "orderId" TEXT,
    "productId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AutomatedReport_type_idx" ON "AutomatedReport"("type");

-- CreateIndex
CREATE INDEX "AutomatedReport_generatedAt_idx" ON "AutomatedReport"("generatedAt");

-- CreateIndex
CREATE INDEX "AutomatedReport_status_idx" ON "AutomatedReport"("status");

-- CreateIndex
CREATE INDEX "PlatformEvent_eventType_idx" ON "PlatformEvent"("eventType");

-- CreateIndex
CREATE INDEX "PlatformEvent_severity_idx" ON "PlatformEvent"("severity");

-- CreateIndex
CREATE INDEX "PlatformEvent_createdAt_idx" ON "PlatformEvent"("createdAt");

-- CreateIndex
CREATE INDEX "PlatformEvent_actorId_idx" ON "PlatformEvent"("actorId");

-- CreateIndex
CREATE INDEX "PlatformEvent_userId_idx" ON "PlatformEvent"("userId");
