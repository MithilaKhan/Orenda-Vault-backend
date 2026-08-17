import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { NoteService } from "../../../app/modules/note/note.service";

export function deleteNoteTool(server: McpServer) {
    server.registerTool(
        "deleteNote",
        {
            title: "Delete Note",
            description: "Permanently removes an existing note from the database. Use this tool when a user asks to delete, remove, or trash a note. If the user only provides the note name, use 'getAllNote' to find its ID first.",
            inputSchema: {
                id: z.string().describe("The exact unique identifier (MongoDB Object ID) of the note that needs to be deleted."),
                userId: z.string().optional().describe("Internal user ID. DO NOT ask the user for this under any circumstances."),
            },
        },
        async ({ id, userId }) => {
            try {
                await NoteService.deleteNoteToDB(id, userId as string);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Note deleted successfully`,
                        },
                    ],
                };
            } catch (error: any) {
                return {
                    isError: true,
                    content: [
                        {
                            type: "text",
                            text: error.message || "Failed to delete note",
                        },
                    ],
                };
            }
        }
    );
}
