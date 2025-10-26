/**
 * Resources Index
 *
 * Central export point for all MCP resources.
 * Import from here to get access to all resources.
 */

import greetingResource, { greetingResourceDefinition, readGreetingResource } from "./greeting.resource.js";

// Export individual resources
export { greetingResource };

// Export definitions
export { greetingResourceDefinition };

// Export readers
export { readGreetingResource };

// Export all definitions as a collection
export const RESOURCE_DEFINITIONS = {
  greeting: greetingResourceDefinition,
} as const;

// Export all readers as a collection
export const RESOURCE_READERS = {
  greeting: readGreetingResource,
} as const;

// Export all resources (definitions + readers)
export const ALL_RESOURCES = {
  greeting: greetingResource,
} as const;
