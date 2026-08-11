import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { CollectionService } from "../../../app/modules/collection/collection.service";

export function getAllCollectionTool(server: McpServer) {
    server.registerTool(
        "getAllCollection",
        {
            title: "Get All Collections",
            description: "Retrieves a paginated list of all collections owned by a specific user. Use this tool to search for collections by name, or to find a specific collection ID when the user only provides the collection name.",
            inputSchema: {
                userId: z.string().describe("The unique identifier (MongoDB Object ID) of the user requesting their collections."),
                search: z.string().optional().describe("An optional search keyword or query to filter collections by their title. Useful for finding a specific collection."),
                page: z.string().optional().describe("The page number for fetching paginated results (e.g., '1', '2'). Defaults to '1'."),
                limit: z.string().optional().describe("The maximum number of collections to return per page (e.g., '10', '20'). Defaults to '10'."),
            },
        },
        async ({ userId, search, page, limit }) => {
            try {
                const result = await CollectionService.getAllCollectionToDB(userId, { search, page, limit });
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
                            text: error.message || "Failed to get collections",
                        },
                    ],
                };
            }
        }
    );
}
