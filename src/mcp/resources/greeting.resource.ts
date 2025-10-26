/**
 * Greeting Resource
 *
 * Dynamic greeting generator that returns personalized greetings.
 * URI pattern: greeting://{name}
 */

// Resource Definition (metadata)
export const greetingResourceDefinition = {
  name: "greeting",
  title: "Greeting Resource",
  description: "Dynamic greeting generator",
  uriTemplate: "greeting://{name}",
  mimeType: "text/plain",
} as const;

// Resource Handler (implementation)
export async function readGreetingResource(uri: string, name: string) {
  return {
    contents: [
      {
        uri,
        mimeType: "text/plain",
        text: `Hello, ${name}!`,
      },
    ],
  };
}

// Export both for convenience
export default {
  definition: greetingResourceDefinition,
  read: readGreetingResource,
};
