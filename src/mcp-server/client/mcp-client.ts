import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

  const transport = new StdioClientTransport({
    command: "npx",
    args: ["tsx", "src/mcp-server/connect.mcp.server.ts"],
  });

  const client = new Client({
    name: "my-ai-client",
    version: "1.0.0",
  });
client.connect(transport);
export async function getClient(): Promise<Client> {
  return client;
}