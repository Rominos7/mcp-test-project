import type { Request, Response, NextFunction } from "express";

/**
 * Security middleware - prevents DNS rebinding attacks
 */
export function securityMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Skip for health check
  if (req.path === "/health") {
    return next();
  }

  const origin = req.headers.origin || req.headers.host;

  // When running locally, only accept localhost
  if (req.hostname === "localhost" || req.hostname === "127.0.0.1") {
    if (origin && !origin.includes("localhost") && !origin.includes("127.0.0.1")) {
      console.warn(`DNS rebinding attack detected from origin: ${origin}`);
      res.status(403).json({
        jsonrpc: "2.0",
        error: {
          code: -32002,
          message: "Forbidden: Invalid origin for localhost server",
        },
        id: null,
      });
      return;
    }
  }

  next();
}
