Phase 3 — PDF Ingestion Pipeline
We will build:
PDF Parser
↓
Text Extraction
↓
Chunking Engine
↓
Metadata Extraction
↓
Embeddings
↓
pgvector Storage
This is where the Gale Encyclopedia enters the system and becomes searchable knowledge.










next












Phase 3 — PDF Ingestion Pipeline (Knowledge Base Creation)
This is the phase where MedBot becomes a RAG application.
Before this phase:
User Login
Chat Sessions
Database
Authentication
After this phase:
Medical Encyclopedia
↓
Chunks
↓
Embeddings
↓
Vector Search Ready
First: Correct a Design Issue
Earlier we created:
model Document {
  id         String @id @default(uuid())
  title      String
  version    String
  source     String
}
For RAG, that's not enough.
We need actual chunk storage.
Before writing ingestion code, let's improve the schema.
Step 1 — Understand The Ingestion Pipeline
Question:
Can we store a 4505-page PDF directly inside Qwen?
No.
Context window limitations.
Instead:
PDF
 ↓
Extract Text
 ↓
Split Into Chunks
 ↓
Generate Embeddings
 ↓
Store Chunks
 ↓
Store Embeddings
Later:
Question
 ↓
Retrieve Relevant Chunks
 ↓
Qwen
 ↓
Answer
Step 2 — Data Architecture For Knowledge Base
Currently PostgreSQL stores:
Users
Sessions
Messages
Now we add:
Documents
DocumentChunks
Relationship:
Document
   │
   │ 1:N
   ▼
DocumentChunk
Example:
Gale Encyclopedia
      │
      ▼
Chunk 1
Chunk 2
Chunk 3
Chunk 4
...
Chunk 20,000+
Step 3 — Update Prisma Schema
Add new model.
If you're using pgvector later:
model DocumentChunk {
  id String @id @default(uuid())

  chunkId String @unique

  content String @db.Text

  pageNumber Int

  chapter String?

  section String?

  documentTitle String

  documentId String

  document Document
    @relation(
      fields: [documentId],
      references: [id]
    )

  createdAt DateTime @default(now())

  @@index([documentId])
}
Update Document:
model Document {
  id String @id @default(uuid())

  title String

  version String

  source String

  uploadedAt DateTime @default(now())

  chunks DocumentChunk[]
}
Migration:
npx prisma migrate dev \
--name add_document_chunks
Why Store Chunks In PostgreSQL?
Many tutorials only store vectors.
Bad idea.
Store chunk text too.
Benefits:
Debugging
Auditing
Citation Generation
Search Analysis
Step 4 — Folder Architecture
Create:
scripts/

ingest/
Final:
scripts/

ingest/

extract.ts
chunk.ts
metadata.ts
embed.ts
store.ts
run.ts
Why Separate Files?
Bad:
ingest.ts

2000 lines
Good:
Single Responsibility
Each file does one thing.
Step 5 — PDF Extraction
Question:
How do we convert:
4505 page PDF
into text?
Use:
npm install pdf-parse
Create:
scripts/ingest/extract.ts
import fs from "fs";
import pdf from "pdf-parse";

export async function extractPdfText(
  filePath: string
) {
  const buffer =
    fs.readFileSync(filePath);

  const result =
    await pdf(buffer);

  return result.text;
}
Understand What Happens
Input:
gale.pdf
Output:
Large string
~ millions of characters
Problem:
Not searchable.
Need chunking.
Step 6 — Why Chunking Exists
Question:
Why not embed entire book?
Because:
4505 pages
becomes:
Millions of characters
Embedding models have limits.
Need:
Small semantic units
Step 7 — Chunking Strategy
Most tutorials:
1000 chars
200 overlap
Blindly.
We're building medical software.
Need better.
Recommended:
Section-aware chunking
Example:
Crohn Disease

Symptoms
...
Diagnosis
...
Treatment
...
Keep sections together.
For V1:
Hybrid strategy.
Section
 ↓
1000 chars
 ↓
150 overlap
Step 8 — Install LangChain Splitter
npm install langchain
Create:
scripts/ingest/chunk.ts
import {
 RecursiveCharacterTextSplitter,
}
from "langchain/text_splitter";

export async function chunkText(
  text: string
) {
  const splitter =
    new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 150,
    });

  return splitter.createDocuments([
    text,
  ]);
}
Why Overlap?
Without overlap:
Chunk 1:
Crohn symptoms...

Chunk 2:
Treatment...
Context gets cut.
With overlap:
Chunk 1
Chunk 2

share context
Better retrieval.
Step 9 — Metadata Extraction
This is where many RAG systems fail.
Bad chunk:
{
  "text": "Crohn disease..."
}
Good chunk:
{
  "text": "Crohn disease...",
  "pageNumber": 433,
  "section": "Crohn Disease",
  "chapter": "Digestive Disorders"
}
Why?
Needed for:
Filtering
Citations
Debugging
Create:
scripts/ingest/metadata.ts
export function buildMetadata(
  pageNumber: number,
  section?: string,
  chapter?: string
) {
  return {
    pageNumber,
    section,
    chapter,
  };
}
Step 10 — Chunk Identifier Strategy
Never:
1
2
3
4
Use:
document-page-section-index
Example:
gale-433-crohns-001
Benefits:
Readable
Debuggable
Unique
Step 11 — Store Chunks
Create:
scripts/ingest/store.ts
import { prisma }
from "@/src/lib/prisma";

export async function storeChunk(
  data: {
    chunkId: string;
    content: string;
    pageNumber: number;
    documentId: string;
  }
) {
  return prisma.documentChunk.create({
    data,
  });
}
Step 12 — Build Ingestion Orchestrator
Create:
scripts/ingest/run.ts
Pipeline:
PDF
 ↓
Extract
 ↓
Chunk
 ↓
Metadata
 ↓
Store
import { extractPdfText }
from "./extract";

import { chunkText }
from "./chunk";

async function run() {
  const text =
    await extractPdfText(
      "./data/gale.pdf"
    );

  const chunks =
    await chunkText(text);

  console.log(
    `Chunks: ${chunks.length}`
  );
}

run();
First Goal
Do NOT generate embeddings yet.
Goal:
PDF
 ↓
Text
 ↓
Chunks
 ↓
Database
Get this working first.
Why?
Production engineering principle:
One moving part at a time
If embeddings fail:
You know extraction works.
If storage fails:
You know chunking works.
Step 13 — Validation Metrics
After ingestion:
Measure:
Total Pages
Total Chunks
Average Chunk Length
Largest Chunk
Smallest Chunk
Create:
scripts/ingest/stats.ts
Why?
Many chunking bugs appear here.
Step 14 — Expected Scale
4505-page encyclopedia roughly becomes:
15,000–30,000 chunks
depending on chunk size.
Estimate:
1000 chars
150 overlap
≈
20k chunks
Step 15 — Testing Strategy
After ingestion:
Verify:
Chunk Count
> 10,000
Empty Chunks
0
Duplicate Chunk IDs
0
Missing Content
0
Deliverables
By end of Phase 3:
✅ PDF extraction

✅ Chunking engine

✅ Metadata pipeline

✅ Chunk persistence

✅ DocumentChunk model

✅ Ingestion orchestrator

✅ Chunk statistics