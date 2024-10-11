/*
  Warnings:

  - You are about to drop the column `customCss` on the `CustomForm` table. All the data in the column will be lost.
  - You are about to drop the column `discountType` on the `CustomForm` table. All the data in the column will be lost.
  - You are about to drop the column `discountValue` on the `CustomForm` table. All the data in the column will be lost.
  - You are about to drop the column `inputHeading` on the `CustomForm` table. All the data in the column will be lost.
  - You are about to drop the column `submitButtonText` on the `CustomForm` table. All the data in the column will be lost.
  - You are about to drop the column `customFormId` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Customer` table. All the data in the column will be lost.
  - Added the required column `fields` to the `CustomForm` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "_CustomFormToCustomer" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_CustomFormToCustomer_A_fkey" FOREIGN KEY ("A") REFERENCES "CustomForm" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CustomFormToCustomer_B_fkey" FOREIGN KEY ("B") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CustomForm" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fields" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "discountId" TEXT,
    "segmentId" TEXT,
    "couponPrefix" TEXT NOT NULL DEFAULT '',
    "couponPostfix" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_CustomForm" ("couponPostfix", "couponPrefix", "createdAt", "description", "discountId", "id", "segmentId", "shop", "title", "updatedAt") SELECT "couponPostfix", "couponPrefix", "createdAt", "description", "discountId", "id", "segmentId", "shop", "title", "updatedAt" FROM "CustomForm";
DROP TABLE "CustomForm";
ALTER TABLE "new_CustomForm" RENAME TO "CustomForm";
CREATE TABLE "new_Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "shopifyCustomerId" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Customer" ("createdAt", "email", "id", "shop", "shopifyCustomerId", "updatedAt") SELECT "createdAt", "email", "id", "shop", "shopifyCustomerId", "updatedAt" FROM "Customer";
DROP TABLE "Customer";
ALTER TABLE "new_Customer" RENAME TO "Customer";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_CustomFormToCustomer_AB_unique" ON "_CustomFormToCustomer"("A", "B");

-- CreateIndex
CREATE INDEX "_CustomFormToCustomer_B_index" ON "_CustomFormToCustomer"("B");
