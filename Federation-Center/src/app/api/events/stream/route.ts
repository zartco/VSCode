import { addClient, removeClient } from '@/lib/broadcaster';
import type { SseMessage } from '@/contracts/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (msg: SseMessage) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(msg)}\n\n`));
        } catch {
          removeClient(send);
        }
      };

      addClient(send);

      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ kind: 'heartbeat', ts: new Date().toISOString() } satisfies SseMessage)}\n\n`)
          );
        } catch {
          clearInterval(heartbeat);
          removeClient(send);
        }
      }, 15_000);

      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        removeClient(send);
        try {
          controller.close();
        } catch {}
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
