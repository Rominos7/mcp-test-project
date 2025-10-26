import { RESOURCE_DEFINITIONS, readGreetingResource } from "../../../server-core.js";

/**
 * List all available resources
 * Uses definitions from server-core (single source of truth)
 */
export async function handleResourcesList() {
  return {
    resources: Object.values(RESOURCE_DEFINITIONS).map((def) => ({
      uri: def.uriTemplate,
      name: def.name,
      description: def.description,
      mimeType: def.mimeType,
    })),
  };
}

/**
 * Read a resource by URI
 * Delegates to server-core functions (single source of truth)
 */
export async function handleResourcesRead(params: any) {
  const { uri } = params;

  // Parse greeting://name pattern
  const match = uri.match(/^greeting:\/\/(.+)$/);
  if (match) {
    const name = match[1];
    return readGreetingResource(uri, name);
  }

  throw new Error(`Unknown resource URI: ${uri}`);
}
