-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" DATETIME,
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false
);

-- CreateTable
CREATE TABLE "CustomForm" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "inputHeading" TEXT NOT NULL,
    "submitButtonText" TEXT NOT NULL,
    "customCss" TEXT NOT NULL,
    "couponPrefix" TEXT NOT NULL,
    "couponPostfix" TEXT NOT NULL,
    "discountType" TEXT,
    "discountValue" TEXT,
    "discountId" TEXT,
    "segmentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "shopifyCustomerId" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "_CustomFormToCustomer" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_CustomFormToCustomer_A_fkey" FOREIGN KEY ("A") REFERENCES "CustomForm" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CustomFormToCustomer_B_fkey" FOREIGN KEY ("B") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_CustomFormToCustomer_AB_unique" ON "_CustomFormToCustomer"("A", "B");

-- CreateIndex
CREATE INDEX "_CustomFormToCustomer_B_index" ON "_CustomFormToCustomer"("B");
