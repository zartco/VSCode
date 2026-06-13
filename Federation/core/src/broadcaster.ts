import type { ServerResponse } from 'node:http';
import type { SseMessage } from '../../contracts/types.js';

const clients = new Set<ServerResponse>();

export function addClient(res: ServerResponse): void {
  clients.add(res);
}

export function removeClient(res: ServerResponse): void {
  clients.delete(res);
}

export function broadcast(msg: SseMessage): void {
  if (clients.size === 0) return;
  const data = `data: ${JSON.stringify(msg)}\n\n`;
  for (const res of clients) {
    try {
      res.write(data);
    } catch {
      clients.delete(res);
    }
  }
}
