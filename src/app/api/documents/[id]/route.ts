import fs from "node:fs";
import path from "node:path";
import { auth } from "@/auth";
import { DocumentRepository } from "@/repositories/document.repository";
import { handleError } from "@/lib/error-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const documentRepo = new DocumentRepository();

/**
 * Streams an auth-scoped PDF file for a given `Document.id`.
 *
 * Security notes:
 *  - Any authenticated user can fetch any document. This mirrors the current
 *    RAG behaviour (the corpus is a single global knowledge base). If the
 *    system ever grows per-user documents, add an owner check here.
 *  - `fileName` is sanitized against path traversal: only the basename is used
 *    and it must resolve inside `<cwd>/knowledge-base/`.
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
    const document = await documentRepo.findById(id);
    if (!document) {
      return Response.json(
        { success: false, error: { code: "NOT_FOUND", message: "Document not found." } },
        { status: 404 }
      );
    }

    const knowledgeBase = path.resolve(process.cwd(), "knowledge-base");
    const safeName = path.basename(document.fileName);
    const filePath = path.resolve(knowledgeBase, safeName);

    if (!filePath.startsWith(knowledgeBase + path.sep) && filePath !== knowledgeBase) {
      return Response.json(
        { success: false, error: { code: "FORBIDDEN", message: "Invalid file path." } },
        { status: 403 }
      );
    }

    if (!fs.existsSync(filePath)) {
      return Response.json(
        { success: false, error: { code: "NOT_FOUND", message: "File not found on disk." } },
        { status: 404 }
      );
    }

    const stat = fs.statSync(filePath);
    const stream = fs.createReadStream(filePath);

    return new Response(stream as unknown as ReadableStream, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(stat.size),
        "Content-Disposition": `inline; filename="${encodeURIComponent(safeName)}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    const handled = handleError(error);
    return Response.json(handled.body, { status: handled.status });
  }
}
