-- CreateTable
CREATE TABLE "UserGamification" (
    "id" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "achievements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserGamification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserGamification_userEmail_key" ON "UserGamification"("userEmail");

-- CreateIndex
CREATE INDEX "UserGamification_userEmail_idx" ON "UserGamification"("userEmail");

-- CreateIndex
CREATE INDEX "UserGamification_totalPoints_idx" ON "UserGamification"("totalPoints");
