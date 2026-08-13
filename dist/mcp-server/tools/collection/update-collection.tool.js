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
exports.updateCollectionTool = updateCollectionTool;
const zod_1 = __importDefault(require("zod"));
const collection_service_1 = require("../../../app/modules/collection/collection.service");
function updateCollectionTool(server) {
    server.registerTool("updateCollection", {
        title: "Update Collection",
        description: "Modifies or renames an existing collection. Use this tool when the user wants to change a collection's title, description, or icon. If you don't know the collection ID, use 'getAllCollection' to search for it first.",
        inputSchema: {
            id: zod_1.default.string().describe("The unique identifier (MongoDB Object ID) of the collection to update."),
            userId: zod_1.default.string().describe("The unique identifier of the user making the update request."),
            title: zod_1.default.string().optional().describe("The updated name or title for the collection. Provide only if changing the title."),
            description: zod_1.default.string().optional().describe("The updated description or summary for the collection. Provide only if changing the description."),
            icon: zod_1.default.enum(["FileText", "Code", "Briefcase", "Folder"]).optional().describe("The updated visual icon for the collection. Provide only if changing the icon."),
        },
    }, (_a) => __awaiter(this, [_a], void 0, function* ({ id, userId, title, description, icon }) {
        try {
            const payload = {};
            if (title !== undefined)
                payload.title = title;
            if (description !== undefined)
                payload.description = description;
            if (icon !== undefined)
                payload.icon = icon;
            const result = yield collection_service_1.CollectionService.updateCollectionToDB(id, payload, userId);
            return {
                content: [
                    {
                        type: "text",
                        text: `Collection updated successfully:\n${JSON.stringify(result, null, 2)}`,
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
                        text: error.message || "Failed to update collection",
                    },
                ],
            };
        }
    }));
}
