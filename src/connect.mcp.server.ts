import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { server } from "./mcp.server";

export async function mcpServerConnect() {
    const transport = new StdioServerTransport();

    await server.connect(transport);

    // MUST use console.error instead of console.log for STDIO transport
    console.error("✅ MCP Server is running...");
}

// Call the function to start the server when this file is run directly
mcpServerConnect().catch(console.error);