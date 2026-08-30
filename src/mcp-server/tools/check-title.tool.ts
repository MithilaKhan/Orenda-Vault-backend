import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { Note } from "../../app/modules/note/note.model";
import { Collection } from "../../app/modules/collection/collection.model";
import { createTitleRegex } from "../../app/shared/titleUtils";

export function checkTitleTool(server: McpServer) {
    server.registerTool(
        "checkTitle",
        {
            title: "Check Title Availability",
            description: "Checks if a title name is already taken by an existing note or collection for the user. Use this tool whenever a user asks if a title name is available, or before creating/updating notes and collections to avoid duplicate titles.",
            inputSchema: {
                title: z.string().describe("The title name to check for availability."),
                userId: z.string().optional().describe("Internal user ID. DO NOT ask the user for this under any circumstances."),
            },
        },
        async ({ title, userId }) => {
            try {
                if (!userId) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({ exists: false, message: "User not authenticated" }),
                            },
                        ],
                    };
                }

                const titleRegex = createTitleRegex(title);

                const existingNote = await Note.findOne({
                    user: userId,
                    title: { $regex: titleRegex }
                });

                if (existingNote) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({
                                    exists: true,
                                    type: "note",
                                    title: existingNote.title,
                                    message: `A note with the title "${existingNote.title}" already exists.`
                                }),
                            },
                        ],
                    };
                }

                const existingCollection = await Collection.findOne({
                    user: userId,
                    title: { $regex: titleRegex }
                });

                if (existingCollection) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({
                                    exists: true,
                                    type: "collection",
                                    title: existingCollection.title,
                                    message: `A collection with the title "${existingCollection.title}" already exists.`
                                }),
                            },
                        ],
                    };
                }

                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                exists: false,
                                title: title,
                                message: `The title "${title}" is available.`
                            }),
                        },
                    ],
                };
            } catch (error: any) {
                return {
                    isError: true,
                    content: [
                        {
                            type: "text",
                            text: error.message || "Failed to check title",
                        },
                    ],
                };
            }
        }
    );
}
