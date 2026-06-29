/*
  Warnings:

  - Added the required column `updatedAt` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
CREATE EXTENSION IF NOT EXISTS vector;

-- DropIndex
DROP INDEX "Chunk_documentId_idx";

-- AlterTable
ALTER TABLE "Chunk" ADD COLUMN     "sectionTitle" TEXT,
ADD COLUMN     "tokenCount" INTEGER;

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "KnowledgeChunk" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "characterCount" INTEGER NOT NULL,
    "estimatedTokens" INTEGER NOT NULL,
    "startOffset" INTEGER NOT NULL,
    "endOffset" INTEGER NOT NULL,
    "sourceTitle" TEXT NOT NULL,
    "sourceVersion" TEXT NOT NULL,
    "sourceLanguage" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "checksum" TEXT,
    "pageNumber" INTEGER,
    "chapter" TEXT,
    "section" TEXT,
    "headings" JSONB NOT NULL,
    "embedding" vector(768) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeChunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KnowledgeChunk_documentId_idx" ON "KnowledgeChunk"("documentId");

-- CreateIndex
CREATE INDEX "KnowledgeChunk_chunkIndex_idx" ON "KnowledgeChunk"("chunkIndex");

-- CreateIndex
CREATE INDEX "KnowledgeChunk_chapter_idx" ON "KnowledgeChunk"("chapter");

-- CreateIndex
CREATE INDEX "KnowledgeChunk_section_idx" ON "KnowledgeChunk"("section");

-- CreateIndex
CREATE INDEX "Chunk_documentId_chunkIndex_idx" ON "Chunk"("documentId", "chunkIndex");
