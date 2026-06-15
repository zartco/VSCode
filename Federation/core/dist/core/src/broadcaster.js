const clients = new Set();
export function addClient(res) {
    clients.add(res);
}
export function removeClient(res) {
    clients.delete(res);
}
export function broadcast(msg) {
    if (clients.size === 0)
        return;
    const data = `data: ${JSON.stringify(msg)}\n\n`;
    for (const res of clients) {
        try {
            res.write(data);
        }
        catch {
            clients.delete(res);
        }
    }
}
