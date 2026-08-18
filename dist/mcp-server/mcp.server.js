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
exports.server = void 0;
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const zod_1 = __importDefault(require("zod"));
const create_collection_tool_1 = require("./tools/collection/create-collection.tool");
const get_all_collection_tool_1 = require("./tools/collection/get-all-collection.tool");
const get_collection_by_id_tool_1 = require("./tools/collection/get-collection-by-id.tool");
const update_collection_tool_1 = require("./tools/collection/update-collection.tool");
const delete_collection_tool_1 = require("./tools/collection/delete-collection.tool");
const create_note_tool_1 = require("./tools/note/create-note.tool");
const get_all_note_tool_1 = require("./tools/note/get-all-note.tool");
const update_note_tool_1 = require("./tools/note/update-note.tool");
const delete_note_tool_1 = require("./tools/note/delete-note.tool");
exports.server = new mcp_js_1.McpServer({
    name: "mongodb-mcp-server",
    version: "1.0.0",
});
exports.server.registerTool("sayHello", {
    title: "Say Hello",
    description: "A simple tool that says hello.",
    inputSchema: {
        name: zod_1.default.string().describe("The name of the person to greet."),
    }
}, (_a) => __awaiter(void 0, [_a], void 0, function* ({ name }) {
    console.log(`Hello, ${name}!`);
    return {
        content: [
            {
                type: "text",
                text: `Hello, ${name}!`,
            }
        ]
    };
}));
(0, create_collection_tool_1.createCollectionTool)(exports.server);
(0, get_all_collection_tool_1.getAllCollectionTool)(exports.server);
(0, get_collection_by_id_tool_1.getCollectionByIdTool)(exports.server);
(0, update_collection_tool_1.updateCollectionTool)(exports.server);
(0, delete_collection_tool_1.deleteCollectionTool)(exports.server);
(0, create_note_tool_1.createNoteTool)(exports.server);
(0, get_all_note_tool_1.getAllNoteTool)(exports.server);
(0, update_note_tool_1.updateNoteTool)(exports.server);
(0, delete_note_tool_1.deleteNoteTool)(exports.server);
