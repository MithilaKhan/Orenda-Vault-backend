"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNoteTool = updateNoteTool;
const zod_1 = __importDefault(require("zod"));
const note_service_1 = require("../../../app/modules/note/note.service");
function updateNoteTool(server) {
    server.registerTool("updateNote", {
        title: "Update Note",
        description: "Modifies or edits an existing note. Use this tool when the user wants to change a note's title, description, or move it to another collection. If you don't know the note ID, use 'getAllNote' to search for it first.",
        inputSchema: {
            id: zod_1.default.string().describe("The unique identifier (MongoDB Object ID) of the note to update."),
            userId: zod_1.default.string().optional().describe("Internal user ID. DO NOT ask the user for this under any circumstances."),
            title: zod_1.default.string().optional().describe("The updated name or title for the note. Provide only if changing the title."),
            description: zod_1.default.string().optional().describe("The updated content or body text for the note. Provide only if changing the description."),
            collectionId: zod_1.default.string().optional().describe("The updated collection ID if moving the note to a different collection. Provide only if changing collections."),
        },
    }, (_a) => __awaiter(this, [_a], void 0, function* ({ id, userId, title, description, collectionId }) {
        try {
            const payload = {};
            if (title !== undefined)
                payload.title = title;
            if (description !== undefined)
                payload.description = description;
            if (collectionId !== undefined)
                payload.collection = collectionId;
            const result = yield note_service_1.NoteService.updateNoteToDB(id, payload, userId);
            return {
                content: [
                    {
                        type: "text",
                        text: `Note updated successfully:\n${JSON.stringify(result, null, 2)}`,
                    },
                ],
            };
        }
        catch (error) {
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
    }));
}
