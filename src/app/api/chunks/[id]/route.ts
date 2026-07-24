import { auth } from "@/auth";
import { PrismaClient } from "@/generated/client";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/error-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const db: PrismaClient = prisma;

/**
 * Returns a lightweight preview payload for a single chunk. Used by the
 * citation hover-card so we don't have to open the full PDF viewer to peek
 * at the cited passage.
 *
 * Response:
 *   { success: true, data: { id, content, pageNumber, chapter, section, documentId, sourceTitle } }
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json(
        { success: false, error: { code: "UNAUTHENTICATED", message: "Sign in required." } },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const chunk = await db.chunk.findUnique({
      where: { id },
      select: {
        id: true,
        content: true,
        pageNumber: true,
        chapter: true,
        section: true,
        documentId: true,
        document: { select: { title: true } },
      },
    });

    if (!chunk) {
      return Response.json(
        { success: false, error: { code: "NOT_FOUND", message: "Chunk not found." } },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: {
        id: chunk.id,
        content: chunk.content,
        pageNumber: chunk.pageNumber,
        chapter: chunk.chapter,
        section: chunk.section,
        documentId: chunk.documentId,
        sourceTitle: chunk.document?.title ?? "",
      },
    });
  } catch (error) {
    const handled = handleError(error);
    return Response.json(handled.body, { status: handled.status });
  }
}
