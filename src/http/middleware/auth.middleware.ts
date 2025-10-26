import type { Request, Response, NextFunction } from "express";
import { config } from "../../config/env.config.js";

/**
 * Authentication middleware - validates Bearer token
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Skip auth for health check
  if (req.path === "/health") {
    return next();
  }

  const authHeader = req.headers.authorization;
  const expectedAuth = `Bearer ${config.apiKey}`;

  if (authHeader !== expectedAuth) {
    console.warn(`Unauthorized access attempt from ${req.ip}`);
    res.status(401).json({
      jsonrpc: "2.0",
      error: {
        code: -32001,
        message: "Unauthorized: Invalid API key",
      },
      id: null,
    });
    return;
  }

  next();
}
