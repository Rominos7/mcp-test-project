import "dotenv/config";

/**
 * Environment configuration for the MCP server
 */
export const config = {
  // Server configuration
  port: process.env.MCP_PORT ? parseInt(process.env.MCP_PORT) : 3000,
  nodeEnv: process.env.NODE_ENV || "development",

  // Security
  apiKey: process.env.MCP_API_KEY || "development-key",
  allowedOrigins: (process.env.ALLOWED_ORIGINS || "http://localhost:*").split(","),

  // AI Configuration
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,

  // Session configuration
  sessionTimeout: 60 * 60 * 1000, // 1 hour in milliseconds
  sessionCleanupInterval: 5 * 60 * 1000, // 5 minutes
} as const;

/**
 * Validate required environment variables
 */
export function validateConfig(): void {
  if (!config.anthropicApiKey) {
    console.warn("⚠️  Warning: ANTHROPIC_API_KEY not set. AI summarization will not work.");
  }

  if (config.apiKey === "development-key") {
    console.warn("⚠️  Warning: Using default API key. Set MCP_API_KEY for production!");
  }
}
