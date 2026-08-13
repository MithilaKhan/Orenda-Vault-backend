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
exports.getAllCollectionTool = getAllCollectionTool;
const zod_1 = __importDefault(require("zod"));
const collection_service_1 = require("../../../app/modules/collection/collection.service");
function getAllCollectionTool(server) {
    server.registerTool("getAllCollection", {
        title: "Get All Collections",
        description: "Retrieves a paginated list of all collections owned by a specific user. Use this tool to search for collections by name, or to find a specific collection ID when the user only provides the collection name.",
        inputSchema: {
            userId: zod_1.default.string().describe("The unique identifier (MongoDB Object ID) of the user requesting their collections."),
            search: zod_1.default.string().optional().describe("An optional search keyword or query to filter collections by their title. Useful for finding a specific collection."),
            page: zod_1.default.string().optional().describe("The page number for fetching paginated results (e.g., '1', '2'). Defaults to '1'."),
            limit: zod_1.default.string().optional().describe("The maximum number of collections to return per page (e.g., '10', '20'). Defaults to '10'."),
        },
    }, (_a) => __awaiter(this, [_a], void 0, function* ({ userId, search, page, limit }) {
        try {
            const result = yield collection_service_1.CollectionService.getAllCollectionToDB(userId, { search, page, limit });
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
                        text: error.message || "Failed to get collections",
                    },
                ],
            };
        }
    }));
}
