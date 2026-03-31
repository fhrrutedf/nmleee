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
CREATE INDEX "PlatformEvent_eventType_idx" ON "PlatformEvent"("eventType");

-- CreateIndex
CREATE INDEX "PlatformEvent_severity_idx" ON "PlatformEvent"("severity");

-- CreateIndex
CREATE INDEX "PlatformEvent_createdAt_idx" ON "PlatformEvent"("createdAt");

-- CreateIndex
CREATE INDEX "PlatformEvent_actorId_idx" ON "PlatformEvent"("actorId");

-- CreateIndex
CREATE INDEX "PlatformEvent_userId_idx" ON "PlatformEvent"("userId");
