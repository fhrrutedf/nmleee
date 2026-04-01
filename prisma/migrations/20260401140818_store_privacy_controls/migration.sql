-- AlterTable
ALTER TABLE "User" ADD COLUMN     "showProductsCount" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showRating" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showRevenue" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "showSalesCount" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "ProductQuestion" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "isApproved" BOOLEAN NOT NULL DEFAULT true,
    "askerId" TEXT,
    "askerName" TEXT,
    "askerEmail" TEXT,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductAnswer" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "answererId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductQuestion_productId_idx" ON "ProductQuestion"("productId");

-- CreateIndex
CREATE INDEX "ProductQuestion_askerId_idx" ON "ProductQuestion"("askerId");

-- CreateIndex
CREATE INDEX "ProductQuestion_isApproved_idx" ON "ProductQuestion"("isApproved");

-- CreateIndex
CREATE INDEX "ProductQuestion_createdAt_idx" ON "ProductQuestion"("createdAt");

-- CreateIndex
CREATE INDEX "ProductAnswer_questionId_idx" ON "ProductAnswer"("questionId");

-- CreateIndex
CREATE INDEX "ProductAnswer_answererId_idx" ON "ProductAnswer"("answererId");

-- AddForeignKey
ALTER TABLE "ProductQuestion" ADD CONSTRAINT "ProductQuestion_askerId_fkey" FOREIGN KEY ("askerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductQuestion" ADD CONSTRAINT "ProductQuestion_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAnswer" ADD CONSTRAINT "ProductAnswer_answererId_fkey" FOREIGN KEY ("answererId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAnswer" ADD CONSTRAINT "ProductAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ProductQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
