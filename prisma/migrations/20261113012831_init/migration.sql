-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "benefits" TEXT NOT NULL,
    "included" TEXT NOT NULL,
    "care" TEXT NOT NULL,
    "faq" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "cjVid" TEXT NOT NULL,
    "cjWarehouseId" TEXT NOT NULL,
    "supplierCostCents" INTEGER NOT NULL,
    "shippingCents" INTEGER NOT NULL,
    "deliveryMinDays" INTEGER NOT NULL,
    "deliveryMaxDays" INTEGER NOT NULL,
    "contributionCents" INTEGER NOT NULL,
    "usStock" INTEGER NOT NULL,
    "quotedAt" TIMESTAMP(3),
    "photoConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "legalName" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "tagline" TEXT NOT NULL DEFAULT 'Comfort for dogs and cats, shipped from the United States.',
    "referenceZip" TEXT NOT NULL DEFAULT '64108',
    "stripeRateBps" INTEGER NOT NULL DEFAULT 599,
    "stripeFixedCents" INTEGER NOT NULL DEFAULT 10,
    "fxReserveBps" INTEGER NOT NULL DEFAULT 300,
    "iofBps" INTEGER NOT NULL DEFAULT 350,
    "minContributionCents" INTEGER NOT NULL DEFAULT 800,
    "adContributionCents" INTEGER NOT NULL DEFAULT 3900,
    "adTestCapCents" INTEGER NOT NULL DEFAULT 15000,
    "checkoutPublic" BOOLEAN NOT NULL DEFAULT false,
    "cjBalanceCents" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "publicToken" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "line1" TEXT NOT NULL,
    "line2" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "stateCode" TEXT NOT NULL,
    "shippingCents" INTEGER NOT NULL,
    "subtotalCents" INTEGER NOT NULL,
    "taxCents" INTEGER NOT NULL DEFAULT 0,
    "totalCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "customerStatus" TEXT NOT NULL,
    "internalStatus" TEXT NOT NULL,
    "paymentReference" TEXT,
    "cjOrderId" TEXT,
    "carrier" TEXT,
    "trackingCode" TEXT,
    "internalNote" TEXT NOT NULL DEFAULT '',
    "deliveryMinDays" INTEGER NOT NULL,
    "deliveryMaxDays" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unitPriceCents" INTEGER NOT NULL,
    "supplierCostCents" INTEGER NOT NULL,
    "cjVid" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Order_publicToken_key" ON "Order"("publicToken");

-- CreateIndex
CREATE UNIQUE INDEX "Order_paymentReference_key" ON "Order"("paymentReference");

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
