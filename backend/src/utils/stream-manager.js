/**
 * @fileoverview Manages Server-Sent Events (SSE) connections.
 * Handles adding clients and broadcasting messages to all connected clients.
 */

class StreamManager {
  /**
   * Initializes a new instance of the StreamManager.
   * Creates a Set to store connected client response objects.
   */
  constructor() {
    /**
     * @type {Set<import("express").Response>}
     * @description A set of active client response objects.
     */
    this.clients = new Set();
  }

  /**
   * Adds a new client to the stream manager.
   * Returns a cleanup function to remove the client when the connection closes.
   *
   * @param {import("express").Response} res - The Express response object for the client.
   * @returns {Function} A function that removes the client from the set.
   */
  addClient(res) {
    this.clients.add(res);
    return () => this.clients.delete(res);
  }

  /**
   * Broadcasts an event to all connected clients via SSE.
   * Formats the data as a stringified JSON object and writes it to each client's stream.
   * Handles disconnected or non-writable clients by removing them from the set.
   *
   * @param {Object} event - The event data to broadcast.
   */
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
