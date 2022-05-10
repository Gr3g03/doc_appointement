/*
  Warnings:

  - Added the required column `bids` to the `Bid` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Bid" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "appointment_id" INTEGER NOT NULL,
    "bids" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    CONSTRAINT "Bid_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Bid_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "Appointement" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Bid" ("appointment_id", "id", "user_id") SELECT "appointment_id", "id", "user_id" FROM "Bid";
DROP TABLE "Bid";
ALTER TABLE "new_Bid" RENAME TO "Bid";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
