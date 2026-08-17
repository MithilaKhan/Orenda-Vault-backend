import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { NoteService } from "../../../app/modules/note/note.service";

export function updateNoteTool(server: McpServer) {
    server.registerTool(
        "updateNote",
        {
            title: "Update Note",
            description: "Modifies or edits an existing note. Use this tool when the user wants to change a note's title, description, or move it to another collection. If you don't know the note ID, use 'getAllNote' to search for it first.",
            inputSchema: {
                id: z.string().describe("The unique identifier (MongoDB Object ID) of the note to update."),
                userId: z.string().optional().describe("Internal user ID. DO NOT ask the user for this under any circumstances."),
                title: z.string().optional().describe("The updated name or title for the note. Provide only if changing the title."),
                description: z.string().optional().describe("The updated content or body text for the note. Provide only if changing the description."),
                collectionId: z.string().optional().describe("The updated collection ID if moving the note to a different collection. Provide only if changing collections."),
            },
        },
        async ({ id, userId, title, description, collectionId }) => {
            try {
                const payload: any = {};
                if (title !== undefined) payload.title = title;
                if (description !== undefined) payload.description = description;
                if (collectionId !== undefined) payload.collection = collectionId;

                const result = await NoteService.updateNoteToDB(id, payload, userId as string);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Note updated successfully:\n${JSON.stringify(result, null, 2)}`,
                        },
                    ],
                };
            } catch (error: any) {
                return {
                    isError: true,
                    content: [
                        {
                            type: "text",
                            text: error.message || "Failed to update note",
                        },
                    ],
                };
            }
        }
    );
}
