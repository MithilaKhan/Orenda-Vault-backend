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
exports.getCollectionByIdTool = getCollectionByIdTool;
const zod_1 = __importDefault(require("zod"));
const collection_service_1 = require("../../../app/modules/collection/collection.service");
function getCollectionByIdTool(server) {
    server.registerTool("getCollectionById", {
        title: "Get Collection Details by ID",
        description: "Fetches detailed information about a specific single collection using its unique ID, and includes all notes associated with this collection. Use this to read the contents of a collection.",
        inputSchema: {
            id: zod_1.default.string().describe("The unique identifier (MongoDB Object ID) of the target collection to retrieve."),
            userId: zod_1.default.string().optional().describe("Internal user ID. DO NOT ask the user for this under any circumstances."),
        },
    }, (_a) => __awaiter(this, [_a], void 0, function* ({ id, userId }) {
        try {
            const result = yield collection_service_1.CollectionService.getCollectionByIdToDB(id, userId);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(result, null, 2),
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
                        text: error.message || "Failed to get collection",
                    },
                ],
            };
        }
    }));
}
