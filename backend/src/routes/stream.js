// src/routes/stream.js
import { Router } from "express";
// ✅ FIX: Default import (no brackets) and camelCase name
import streamManager from "../utils/stream-manager.js";

const router = Router();

router.get("/", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  // Send immediate comment to establish connection (doesn't trigger onmessage)
  res.write(': connected\n\n');

  // ✅ FIX: Use the instance method
  const removeClient = streamManager.addClient(res);

  // 😈 Chaos: Check every 10 seconds. 5% chance to kill connection.
  const chaosInterval = setInterval(() => {
    if (Math.random() < 0.05) {
      console.log(`💥 Chaos Monkey cut the stream`);
      res.end(); // Close the connection
      clearInterval(chaosInterval); // Stop checking for this client
    }
  }, 10000);

  // Unref to allow process exit if this is the only thing keeping it alive (though usually clients keep it alive)
  if (chaosInterval.unref) chaosInterval.unref();

  req.on("close", () => {
    clearInterval(chaosInterval);
    removeClient();
  });
});

export default router;
