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
exports.deleteNoteTool = deleteNoteTool;
const zod_1 = __importDefault(require("zod"));
const note_service_1 = require("../../../app/modules/note/note.service");
function deleteNoteTool(server) {
    server.registerTool("deleteNote", {
        title: "Delete Note",
        description: "Permanently removes an existing note from the database. Use this tool when a user asks to delete, remove, or trash a note. If the user only provides the note name, use 'getAllNote' to find its ID first.",
        inputSchema: {
            id: zod_1.default.string().describe("The exact unique identifier (MongoDB Object ID) of the note that needs to be deleted."),
            userId: zod_1.default.string().optional().describe("Internal user ID. DO NOT ask the user for this under any circumstances."),
        },
    }, (_a) => __awaiter(this, [_a], void 0, function* ({ id, userId }) {
        try {
            yield note_service_1.NoteService.deleteNoteToDB(id, userId);
            return {
                content: [
                    {
                        type: "text",
                        text: `Note deleted successfully`,
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
                        text: error.message || "Failed to delete note",
                    },
                ],
            };
        }
    }));
}
