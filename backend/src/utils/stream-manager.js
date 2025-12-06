// src/utils/stream-manager.js
class StreamManager {
  constructor() {
    this.clients = new Set();
  }

  addClient(res) {
    this.clients.add(res);
    return () => this.clients.delete(res);
  }

  broadcast(event) {
    const data = `data: ${JSON.stringify(event)}\n\n`;
    this.clients.forEach((client) => {
      if (client.writable && !client.finished) {
        try {
          client.write(data);
        } catch (err) {
          console.error("SSE Broadcast Error:", err);
          this.clients.delete(client);
        }
      } else {
        this.clients.delete(client);
      }
    });
  }
}

// Export as a Singleton Instance
export default new StreamManager();
