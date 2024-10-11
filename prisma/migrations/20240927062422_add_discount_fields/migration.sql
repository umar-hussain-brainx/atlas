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
    "discountType" TEXT,
    "discountValue" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_CustomForm" ("couponPostfix", "couponPrefix", "createdAt", "customCss", "description", "discountType", "discountValue", "id", "inputHeading", "submitButtonText", "title", "updatedAt") SELECT "couponPostfix", "couponPrefix", "createdAt", "customCss", "description", "discountType", "discountValue", "id", "inputHeading", "submitButtonText", "title", "updatedAt" FROM "CustomForm";
DROP TABLE "CustomForm";
ALTER TABLE "new_CustomForm" RENAME TO "CustomForm";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
