import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { CollectionService } from "../../../app/modules/collection/collection.service";

export function deleteCollectionTool(server: McpServer) {
    server.registerTool(
        "deleteCollection",
        {
            title: "Delete Collection",
            description: "Permanently removes an existing collection from the database. Use this tool when a user asks to delete, remove, or trash a collection. If the user only provides the collection name, use 'getAllCollection' to find its ID first.",
            inputSchema: {
                id: z.string().describe("The exact unique identifier (MongoDB Object ID) of the collection that needs to be deleted."),
                userId: z.string().optional().describe("Internal user ID. DO NOT ask the user for this under any circumstances."),
            },
        },
        async ({ id, userId }) => {
            try {
                await CollectionService.deleteCollectionToDB(id, userId as string);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Collection deleted successfully`,
                        },
                    ],
                };
            } catch (error: any) {
                return {
                    isError: true,
                    content: [
                        {
                            type: "text",
                            text: error.message || "Failed to delete collection",
                        },
                    ],
                };
            }
        }
    );
}
