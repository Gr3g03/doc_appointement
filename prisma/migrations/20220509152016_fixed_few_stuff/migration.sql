/*
  Warnings:

  - You are about to drop the `Bids` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Bids";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Bid" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "appointment_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    CONSTRAINT "Bid_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Bid_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "Appointement" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
