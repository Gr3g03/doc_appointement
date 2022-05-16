/*
  Warnings:

  - You are about to drop the column `endDate` on the `Appointement` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Appointement` table. All the data in the column will be lost.
  - Added the required column `end` to the `Appointement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start` to the `Appointement` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Appointement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "start" TEXT NOT NULL,
    "end" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "user_id" INTEGER,
    "doctor_id" INTEGER NOT NULL,
    CONSTRAINT "Appointement_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Appointement_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Appointement" ("description", "doctor_id", "id", "status", "title", "user_id") SELECT "description", "doctor_id", "id", "status", "title", "user_id" FROM "Appointement";
DROP TABLE "Appointement";
ALTER TABLE "new_Appointement" RENAME TO "Appointement";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
