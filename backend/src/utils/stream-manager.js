class StreamManager {
  constructor() {
    // track active connections so we can push updates to them
    this.clients = new Set();
  }

  // registers a new client and gives back a function to disconnect them
  addClient(res) {
    this.clients.add(res);
    return () => this.clients.delete(res);
  }

  // pushes a new event to everyone currently listening
  broadcast(event) {
    const data = `data: ${JSON.stringify(event)}\n\n`;
    this.clients.forEach((client) => {
      // only try writing if the connection is actually open
      if (client.writable && !client.finished) {
        try {
          client.write(data);
        } catch (err) {
          console.error("SSE Broadcast Error:", err);
          this.clients.delete(client);
        }
      } else {
        // clean up dead connections
        this.clients.delete(client);
      }
    });
  }
}

// singleton instance so we share the same list of clients everywhere
export default new StreamManager();
