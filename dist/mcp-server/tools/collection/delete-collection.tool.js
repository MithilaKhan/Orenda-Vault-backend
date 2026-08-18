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
exports.deleteCollectionTool = deleteCollectionTool;
const zod_1 = __importDefault(require("zod"));
const collection_service_1 = require("../../../app/modules/collection/collection.service");
function deleteCollectionTool(server) {
    server.registerTool("deleteCollection", {
        title: "Delete Collection",
        description: "Permanently removes an existing collection from the database. Use this tool when a user asks to delete, remove, or trash a collection. If the user only provides the collection name, use 'getAllCollection' to find its ID first.",
        inputSchema: {
            id: zod_1.default.string().describe("The exact unique identifier (MongoDB Object ID) of the collection that needs to be deleted."),
            userId: zod_1.default.string().optional().describe("Internal user ID. DO NOT ask the user for this under any circumstances."),
        },
    }, (_a) => __awaiter(this, [_a], void 0, function* ({ id, userId }) {
        try {
            yield collection_service_1.CollectionService.deleteCollectionToDB(id, userId);
            return {
                content: [
                    {
                        type: "text",
                        text: `Collection deleted successfully`,
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
                        text: error.message || "Failed to delete collection",
                    },
                ],
            };
        }
    }));
}
