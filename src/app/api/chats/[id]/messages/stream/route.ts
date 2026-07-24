import { auth } from "@/auth";
import { validate } from "@/lib/validate";
import { ChatService } from "@/modules/chat/services";
import { askQuestionSchema } from "@/modules/chat/schemas/ask-question.schema";
import { handleError } from "@/lib/error-handler";
import type { RAGStreamEvent } from "@/modules/knowledge/services/rag.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const chatService = new ChatService();

/**
 * Server-Sent Events streaming endpoint.
 *
 * Frames emitted (all `data: <json>\n\n`):
 *   { type: "context", citations, retrievedChunkCount, acceptedChunkCount, retrievalDurationMs }
 *   { type: "token",   delta }
 *   { type: "done",    answer, metrics }
 *   { type: "error",   message }
 *
 * The client should treat `done` and `error` as terminal.
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  let userId: string;
  let data: { sessionId: string; message: string };
  let chatId: string;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json(
        { success: false, error: { code: "UNAUTHENTICATED", message: "Sign in required." } },
        { status: 401 }
      );
    }
    userId = session.user.id;
    const body = await request.json();
    data = validate(askQuestionSchema, body);
    ({ id: chatId } = await context.params);
  } catch (error) {
    const handled = handleError(error);
    return Response.json(handled.body, { status: handled.status });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Cancel Ollama generation when the client disconnects.
      const abortController = new AbortController();
      const clientSignal = request.signal;

      const onAbort = () => abortController.abort();
      if (clientSignal.aborted) {
        abortController.abort();
      } else {
        clientSignal.addEventListener("abort", onAbort, { once: true });
      }

      const send = (event: RAGStreamEvent) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
        );
      };

      // A small heartbeat helps proxies (nginx) not drop idle SSE connections.
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          /* controller closed */
        }
      }, 15000);

      try {
        const debug = request.headers.get("x-medbot-debug") === "1";
        for await (const event of chatService.streamMessage(
          {
            chatId,
            userId,
            message: data.message,
          },
          { signal: abortController.signal, debug }
        )) {
          send(event);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Streaming failed";
        try {
          send({ type: "error", message });
        } catch {
          /* controller might be closed */
        }
      } finally {
        clearInterval(heartbeat);
        clientSignal.removeEventListener("abort", onAbort);
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
