import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { createCollectionTool } from "./tools/mcp/collection-tools";


export const server = new McpServer({
  name: "mongodb-mcp-server",
  version: "1.0.0",
});

server.registerTool(
    "sayHello",
    {
        title: "Say Hello",
        description: "A simple tool that says hello.",
        inputSchema:{
            name:z.string().describe("The name of the person to greet."),
        }
    },
    async ({name}) => {
        console.log(`Hello, ${name}!`);
        return {
            content: [
                {
                    type: "text",
                    text: `Hello, ${name}!`,
                }
            ]
        }
    }
)

createCollectionTool(server);
