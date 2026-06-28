import type { SseMessage } from '@/contracts/types';

type ClientCallback = (msg: SseMessage) => void;

const clients = new Set<ClientCallback>();

export function addClient(callback: ClientCallback): void {
  clients.add(callback);
}

export function removeClient(callback: ClientCallback): void {
  clients.delete(callback);
}

export function broadcast(msg: SseMessage): void {
  for (const client of clients) {
    try {
      client(msg);
    } catch {
      clients.delete(client);
    }
  }
}
