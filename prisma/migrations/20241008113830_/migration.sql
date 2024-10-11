/*
  Warnings:

  - Added the required column `shop` to the `CustomForm` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shop` to the `Customer` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CustomForm" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "inputHeading" TEXT NOT NULL,
    "submitButtonText" TEXT NOT NULL,
    "customCss" TEXT NOT NULL,
    "couponPrefix" TEXT NOT NULL,
    "couponPostfix" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "discountType" TEXT,
    "discountValue" TEXT,
    "discountId" TEXT,
    "segmentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_CustomForm" ("couponPostfix", "couponPrefix", "createdAt", "customCss", "description", "discountId", "discountType", "discountValue", "id", "inputHeading", "segmentId", "submitButtonText", "title", "updatedAt") SELECT "couponPostfix", "couponPrefix", "createdAt", "customCss", "description", "discountId", "discountType", "discountValue", "id", "inputHeading", "segmentId", "submitButtonText", "title", "updatedAt" FROM "CustomForm";
DROP TABLE "CustomForm";
ALTER TABLE "new_CustomForm" RENAME TO "CustomForm";
CREATE TABLE "new_Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "shopifyCustomerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "customFormId" TEXT NOT NULL,
    CONSTRAINT "Customer_customFormId_fkey" FOREIGN KEY ("customFormId") REFERENCES "CustomForm" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Customer" ("createdAt", "customFormId", "email", "id", "name", "shopifyCustomerId", "updatedAt") SELECT "createdAt", "customFormId", "email", "id", "name", "shopifyCustomerId", "updatedAt" FROM "Customer";
DROP TABLE "Customer";
ALTER TABLE "new_Customer" RENAME TO "Customer";
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");
CREATE UNIQUE INDEX "Customer_shopifyCustomerId_key" ON "Customer"("shopifyCustomerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
