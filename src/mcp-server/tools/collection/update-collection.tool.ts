import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { CollectionService } from "../../../app/modules/collection/collection.service";

export function updateCollectionTool(server: McpServer) {
    server.registerTool(
        "updateCollection",
        {
            title: "Update Collection",
            description: "Modifies or renames an existing collection. Use this tool when the user wants to change a collection's title, description, or icon. If you don't know the collection ID, use 'getAllCollection' to search for it first.",
            inputSchema: {
                id: z.string().describe("The unique identifier (MongoDB Object ID) of the collection to update."),
                userId: z.string().describe("The unique identifier of the user making the update request."),
                title: z.string().optional().describe("The updated name or title for the collection. Provide only if changing the title."),
                description: z.string().optional().describe("The updated description or summary for the collection. Provide only if changing the description."),
                icon: z.enum(["FileText", "Code", "Briefcase", "Folder"]).optional().describe("The updated visual icon for the collection. Provide only if changing the icon."),
            },
        },
        async ({ id, userId, title, description, icon }) => {
            try {
                const payload: any = {};
                if (title !== undefined) payload.title = title;
                if (description !== undefined) payload.description = description;
                if (icon !== undefined) payload.icon = icon;

                const result = await CollectionService.updateCollectionToDB(id, payload, userId);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Collection updated successfully:\n${JSON.stringify(result, null, 2)}`,
                        },
                    ],
                };
            } catch (error: any) {
                return {
                    isError: true,
                    content: [
                        {
                            type: "text",
                            text: error.message || "Failed to update collection",
                        },
                    ],
                };
            }
        }
    );
}
