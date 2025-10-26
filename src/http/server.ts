import express from "express";
import { config, validateConfig } from "../config/env.config.js";
import { corsMiddleware } from "./middleware/cors.middleware.js";
import { authMiddleware } from "./middleware/auth.middleware.js";
import { securityMiddleware } from "./middleware/security.middleware.js";
import { sessionManager } from "./utils/session.manager.js";
import healthRoutes from "./routes/health.routes.js";
import mcpRoutes from "./routes/mcp.routes.js";

/**
 * Create and configure the Express HTTP server for MCP
 */
export function createHttpServer() {
  const app = express();

  // Validate configuration
  validateConfig();

  // Middleware
  app.use(express.json());
  app.use(corsMiddleware);
  app.use(authMiddleware);
  app.use(securityMiddleware);

  // Routes
  app.use(healthRoutes);
  app.use(mcpRoutes);

  return app;
}

/**
 * Start the HTTP server
 */
export function startServer() {
  const app = createHttpServer();

  // Start session cleanup
  sessionManager.startCleanup();

  // Start listening
  const server = app.listen(config.port, () => {
    console.log(`🚀 MCP HTTP Server running on http://localhost:${config.port}`);
    console.log(`📡 MCP endpoint: http://localhost:${config.port}/mcp`);
    console.log(`💚 Health check: http://localhost:${config.port}/health`);
    console.log(
      `🔑 Authentication: Bearer ${config.apiKey === "development-key" ? "development-key (⚠️  SET MCP_API_KEY!)" : "***"}`
    );
    console.log(`🤖 AI Sampling: ${config.anthropicApiKey ? "Enabled" : "Disabled (set ANTHROPIC_API_KEY)"}`);
    console.log(`\nPress Ctrl+C to stop the server.`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log("\n👋 Shutting down gracefully...");
    sessionManager.stopCleanup();
    server.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);

  return server;
}
