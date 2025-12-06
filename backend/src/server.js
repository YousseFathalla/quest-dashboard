/**
 * @fileoverview Application entry point that starts the server.
 * Imports the configured Express application and listens on port 3000.
 */

import app from "./app.js";

/**
 * Starts the Express server on port 3000.
 * Logs a message to the console once the server is running.
 */
app.listen(3000, () => {
  console.log("Mock workflow SSE backend running on port 3000");
});
