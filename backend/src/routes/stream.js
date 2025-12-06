/**
 * @fileoverview Express router for handling Server-Sent Events (SSE) stream.
 */

import { Router } from "express";
import streamManager from "../utils/stream-manager.js";

const router = Router();

/**
 * GET /stream
 * Establishes an SSE connection with the client.
 * Sets appropriate headers and adds the client to the StreamManager.
 * Also introduces a chaos element that randomly disconnects clients.
 *
 * @name GET/stream
 * @function
 * @param {import("express").Request} req - The Express request object.
 * @param {import("express").Response} res - The Express response object.
 */
router.get("/", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  // Send immediate comment to establish connection (doesn't trigger onmessage)
  res.write(': connected\n\n');

  // Register client with StreamManager
  const removeClient = streamManager.addClient(res);

  // 😈 Chaos: Check every 10 seconds. 5% chance to kill connection.
  const chaosInterval = setInterval(() => {
    if (Math.random() < 0.05) {
      console.log(`💥 Chaos Monkey cut the stream`);
      res.end(); // Close the connection
      clearInterval(chaosInterval); // Stop checking for this client
    }
  }, 10000);

  // Clean up on client disconnect
  req.on("close", () => {
    clearInterval(chaosInterval);
    removeClient();
  });
});

export default router;
