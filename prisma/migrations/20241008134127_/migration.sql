/*
  Warnings:

  - You are about to drop the column `fields` on the `CustomForm` table. All the data in the column will be lost.
  - Added the required column `customCss` to the `CustomForm` table without a default value. This is not possible if the table is not empty.
  - Added the required column `inputHeading` to the `CustomForm` table without a default value. This is not possible if the table is not empty.
  - Added the required column `submitButtonText` to the `CustomForm` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `CustomForm` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CustomForm" (
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
INSERT INTO "new_CustomForm" ("couponPostfix", "couponPrefix", "createdAt", "description", "discountId", "id", "segmentId", "shop", "title", "updatedAt") SELECT "couponPostfix", "couponPrefix", "createdAt", "description", "discountId", "id", "segmentId", "shop", "title", "updatedAt" FROM "CustomForm";
DROP TABLE "CustomForm";
ALTER TABLE "new_CustomForm" RENAME TO "CustomForm";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
