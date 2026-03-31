-- CreateTable
CREATE TABLE "SellerFollower" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "notifyNewProducts" BOOLEAN NOT NULL DEFAULT true,
    "notifyNewCourses" BOOLEAN NOT NULL DEFAULT true,
    "notifyOffers" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SellerFollower_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SellerFollower_sellerId_idx" ON "SellerFollower"("sellerId");

-- CreateIndex
CREATE INDEX "SellerFollower_followerId_idx" ON "SellerFollower"("followerId");

-- CreateIndex
CREATE UNIQUE INDEX "SellerFollower_followerId_sellerId_key" ON "SellerFollower"("followerId", "sellerId");

-- AddForeignKey
ALTER TABLE "SellerFollower" ADD CONSTRAINT "SellerFollower_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerFollower" ADD CONSTRAINT "SellerFollower_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
