import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { CollectionService } from "../../../app/modules/collection/collection.service";

export function getCollectionByIdTool(server: McpServer) {
    server.registerTool(
        "getCollectionById",
        {
            title: "Get Collection Details by ID",
            description: "Fetches detailed information about a specific single collection using its unique ID, and includes all notes associated with this collection. Use this to read the contents of a collection.",
            inputSchema: {
                id: z.string().describe("The unique identifier (MongoDB Object ID) of the target collection to retrieve."),
                userId: z.string().optional().describe("Internal user ID. DO NOT ask the user for this under any circumstances."),
            },
        },
        async ({ id, userId }) => {
            try {
                const result = await CollectionService.getCollectionByIdToDB(id, userId as string);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            } catch (error: any) {
                return {
                    isError: true,
                    content: [
                        {
                            type: "text",
                            text: error.message || "Failed to get collection",
                        },
                    ],
                };
            }
        }
    );
}
