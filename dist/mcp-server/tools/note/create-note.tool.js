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
exports.createNoteTool = createNoteTool;
const zod_1 = __importDefault(require("zod"));
const note_service_1 = require("../../../app/modules/note/note.service");
function createNoteTool(server) {
    server.registerTool("createNote", {
        title: "Create Note",
        description: "Creates a new note inside a specific collection. Use this tool when the user asks to create, add, or make a new note, task, or document.",
        inputSchema: {
            title: zod_1.default.string().describe("The primary name or title for the new note. E.g., 'Meeting Minutes', 'Shopping List'."),
            description: zod_1.default.string().describe("The main content or body text of the note."),
            collectionId: zod_1.default.string().describe("The unique identifier (MongoDB Object ID) of the collection where this note will be saved. If you don't know it, use 'getAllCollection' to search for it first."),
            userId: zod_1.default.string().describe("The unique identifier (MongoDB Object ID) of the user who owns this note."),
        },
    }, (_a) => __awaiter(this, [_a], void 0, function* ({ title, description, collectionId, userId }) {
        try {
            const result = yield note_service_1.NoteService.createNoteToDB({ title, description, collection: collectionId, user: userId });
            return {
                content: [
                    {
                        type: "text",
                        text: `Note created successfully with ID: ${result._id}`,
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
                        text: error.message || "Failed to create note",
                    },
                ],
            };
        }
    }));
}
