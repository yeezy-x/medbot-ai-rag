import fs from "node:fs";
import path from "node:path";
import { requireApiUser } from "@/lib/auth-utils";
import { DocumentRepository } from "@/modules/knowledge/repositories/document.repository";
import { handleError } from "@/lib/error-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const documentRepo = new DocumentRepository();

/**
 * Streams an auth-scoped PDF file for a given `Document.id`.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireApiUser();

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
