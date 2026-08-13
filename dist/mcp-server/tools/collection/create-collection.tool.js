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
exports.createCollectionTool = createCollectionTool;
const zod_1 = __importDefault(require("zod"));
const collection_service_1 = require("../../../app/modules/collection/collection.service");
function createCollectionTool(server) {
    server.registerTool("createCollection", {
        title: "Create Collection",
        description: "Creates a new custom workspace collection or folder for the user in the database. Use this tool when the user asks to create, make, or add a new collection to organize their notes or items.",
        inputSchema: {
            title: zod_1.default.string().describe("The primary name or title for the new collection. E.g., 'My Projects', 'Ideas'."),
            description: zod_1.default.string().describe("A brief summary or detailed explanation of what this collection will contain."),
            icon: zod_1.default.enum(["FileText", "Code", "Briefcase", "Folder"]).describe("Visual representation icon for the collection. Choose an appropriate icon based on the collection's context (e.g., 'Briefcase' for work, 'Code' for programming)."),
            userId: zod_1.default.string().describe("The unique identifier (MongoDB Object ID) of the user who owns this collection."),
        },
    }, (_a) => __awaiter(this, [_a], void 0, function* ({ title, description, icon, userId }) {
        try {
            const result = yield collection_service_1.CollectionService.createCollectionToDB({ title, description, icon, user: userId });
            return {
                content: [
                    {
                        type: "text",
                        text: `Collection created successfully with ID: ${result._id}`,
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
                        text: error.message || "Failed to create collection",
                    },
                ],
            };
        }
    }));
}
