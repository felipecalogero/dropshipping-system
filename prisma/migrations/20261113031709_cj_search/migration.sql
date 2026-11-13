-- CreateTable
CREATE TABLE "CjSearchCursor" (
    "category" TEXT NOT NULL,
    "nextPage" INTEGER NOT NULL DEFAULT 1,
    "nextOffset" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CjSearchCursor_pkey" PRIMARY KEY ("category")
);

-- CreateTable
CREATE TABLE "CjCandidate" (
    "vid" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "option" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "supplierCostCents" INTEGER NOT NULL,
    "shippingCents" INTEGER NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "contributionCents" INTEGER NOT NULL,
    "usStock" INTEGER NOT NULL,
    "deliveryMinDays" INTEGER NOT NULL,
    "deliveryMaxDays" INTEGER NOT NULL,
    "foundAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CjCandidate_pkey" PRIMARY KEY ("vid")
);

-- CreateIndex
CREATE INDEX "CjCandidate_category_idx" ON "CjCandidate"("category");
