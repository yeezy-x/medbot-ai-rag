/*
  Warnings:

  - A unique constraint covering the columns `[checksum]` on the table `Document` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Document_checksum_key" ON "Document"("checksum");
