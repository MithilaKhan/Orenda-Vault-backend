import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { createCollectionTool } from "./tools/collection/create-collection.tool";
import { getAllCollectionTool } from "./tools/collection/get-all-collection.tool";
import { getCollectionByIdTool } from "./tools/collection/get-collection-by-id.tool";
import { updateCollectionTool } from "./tools/collection/update-collection.tool";
import { deleteCollectionTool } from "./tools/collection/delete-collection.tool";
import { createNoteTool } from "./tools/note/create-note.tool";
import { getAllNoteTool } from "./tools/note/get-all-note.tool";
import { updateNoteTool } from "./tools/note/update-note.tool";
import { deleteNoteTool } from "./tools/note/delete-note.tool";


export const server = new McpServer({
    name: "mongodb-mcp-server",
    version: "1.0.0",
});

server.registerTool(
    "sayHello",
    {
        title: "Say Hello",
        description: "A simple tool that says hello.",
        inputSchema: {
            name: z.string().describe("The name of the person to greet."),
        }
    },
    async ({ name }) => {
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
getAllCollectionTool(server);
getCollectionByIdTool(server);
updateCollectionTool(server);
deleteCollectionTool(server);

createNoteTool(server);
getAllNoteTool(server);
updateNoteTool(server);
deleteNoteTool(server);
