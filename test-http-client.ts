/**
 * Test script for HTTP client
 * Tests all MCP protocol methods
 */

import "dotenv/config";

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || "http://localhost:3000/mcp";
const MCP_API_KEY = process.env.MCP_API_KEY || "development-key";

async function testHttpClient() {
  console.log("╔════════════════════════════════════════╗");
  console.log("║  MCP HTTP Client Test Suite           ║");
  console.log("╚════════════════════════════════════════╝\n");

  let sessionId: string | undefined;
  let testsPassed = 0;
  let testsFailed = 0;

  async function sendRequest(method: string, params?: any): Promise<any> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${MCP_API_KEY}`,
      "Accept": "application/json",
    };

    if (sessionId) {
      headers["Mcp-Session-Id"] = sessionId;
    }

    const response = await fetch(MCP_SERVER_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: Date.now(),
        method,
        params: params || {},
      }),
    });

    const newSessionId = response.headers.get("Mcp-Session-Id");
    if (newSessionId) {
      sessionId = newSessionId;
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message);
    }
    return data.result;
  }

  // Test 1: Initialize
  try {
    console.log("Test 1: Initialize connection");
    const result = await sendRequest("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: { sampling: {} },
      clientInfo: { name: "test-client", version: "1.0.0" },
    });
    console.log(`  ✅ Connected to ${result.serverInfo.name} v${result.serverInfo.version}`);
    console.log(`  ✅ Session ID: ${sessionId || "N/A"}`);
    testsPassed++;
  } catch (error) {
    console.log(`  ❌ Failed: ${error}`);
    testsFailed++;
  }

  // Test 2: List tools
  try {
    console.log("\nTest 2: List tools");
    const result = await sendRequest("tools/list");
    console.log(`  ✅ Found ${result.tools.length} tools:`);
    result.tools.forEach((tool: any) => console.log(`     - ${tool.name}`));
    testsPassed++;
  } catch (error) {
    console.log(`  ❌ Failed: ${error}`);
    testsFailed++;
  }

  // Test 3: Call add tool
  try {
    console.log("\nTest 3: Call add tool (10 + 25)");
    const result = await sendRequest("tools/call", {
      name: "add",
      arguments: { a: 10, b: 25 },
    });
    const answer = result.content[0]?.text;
    console.log(`  ✅ Result: ${answer}`);
    if (answer === "35") {
      console.log(`  ✅ Correct answer!`);
    } else {
      console.log(`  ❌ Wrong answer! Expected 35, got ${answer}`);
    }
    testsPassed++;
  } catch (error) {
    console.log(`  ❌ Failed: ${error}`);
    testsFailed++;
  }

  // Test 4: List resources
  try {
    console.log("\nTest 4: List resources");
    const result = await sendRequest("resources/list");
    console.log(`  ✅ Found ${result.resources.length} resources:`);
    result.resources.forEach((res: any) => console.log(`     - ${res.name}: ${res.uri}`));
    testsPassed++;
  } catch (error) {
    console.log(`  ❌ Failed: ${error}`);
    testsFailed++;
  }

  // Test 5: Read resource
  try {
    console.log("\nTest 5: Read resource (greeting://TestUser)");
    const result = await sendRequest("resources/read", {
      uri: "greeting://TestUser",
    });
    const text = result.contents[0]?.text;
    console.log(`  ✅ Resource content: ${text}`);
    testsPassed++;
  } catch (error) {
    console.log(`  ❌ Failed: ${error}`);
    testsFailed++;
  }

  // Test 6: List prompts
  try {
    console.log("\nTest 6: List prompts");
    const result = await sendRequest("prompts/list");
    console.log(`  ✅ Found ${result.prompts.length} prompts:`);
    result.prompts.forEach((prompt: any) => console.log(`     - ${prompt.name}`));
    testsPassed++;
  } catch (error) {
    console.log(`  ❌ Failed: ${error}`);
    testsFailed++;
  }

  // Test 7: Get prompt
  try {
    console.log("\nTest 7: Get prompt (helloPrompt with name=Alice)");
    const result = await sendRequest("prompts/get", {
      name: "helloPrompt",
      arguments: { name: "Alice" },
    });
    const text = result.messages[0]?.content.text;
    console.log(`  ✅ Prompt result: ${text}`);
    testsPassed++;
  } catch (error) {
    console.log(`  ❌ Failed: ${error}`);
    testsFailed++;
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log(`Test Summary:`);
  console.log(`  ✅ Passed: ${testsPassed}`);
  console.log(`  ❌ Failed: ${testsFailed}`);
  console.log(`  Total:  ${testsPassed + testsFailed}`);
  console.log("=".repeat(50));

  if (testsFailed === 0) {
    console.log("\n🎉 All tests passed!");
    process.exit(0);
  } else {
    console.log("\n❌ Some tests failed!");
    process.exit(1);
  }
}

testHttpClient().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
