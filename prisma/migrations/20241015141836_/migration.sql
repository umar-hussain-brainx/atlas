/*
  Warnings:

  - You are about to drop the `Customer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `discountId` on the `CustomForm` table. All the data in the column will be lost.
  - You are about to drop the column `segmentId` on the `CustomForm` table. All the data in the column will be lost.
  - Added the required column `inputPlaceholder` to the `CustomForm` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Customer_shopifyCustomerId_key";

-- DropIndex
DROP INDEX "Customer_email_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Customer";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CustomForm" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "inputHeading" TEXT NOT NULL,
    "inputPlaceholder" TEXT NOT NULL,
    "submitButtonText" TEXT NOT NULL,
    "customCss" TEXT NOT NULL,
    "couponPrefix" TEXT NOT NULL,
    "couponPostfix" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_CustomForm" ("couponPostfix", "couponPrefix", "createdAt", "customCss", "description", "id", "inputHeading", "submitButtonText", "title", "updatedAt") SELECT "couponPostfix", "couponPrefix", "createdAt", "customCss", "description", "id", "inputHeading", "submitButtonText", "title", "updatedAt" FROM "CustomForm";
DROP TABLE "CustomForm";
ALTER TABLE "new_CustomForm" RENAME TO "CustomForm";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
