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
Object.defineProperty(exports, "__esModule", { value: true });
exports.callMcpToolsClient = void 0;
const mcp_client_1 = require("./mcp-client");
class CallMcpToolsClient {
    constructor() { }
    callTool(toolName, toolInput, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield (0, mcp_client_1.getClient)();
            let args = {};
            if (typeof toolInput === "string") {
                try {
                    args = JSON.parse(toolInput);
                }
                catch (e) {
                    args = {};
                }
            }
            else if (toolInput && typeof toolInput === "object") {
                args = Object.assign({}, toolInput);
            }
            args.userId = userId;
            const response = yield client.callTool({
                name: toolName,
                arguments: args,
            });
            return response;
        });
    }
}
exports.callMcpToolsClient = new CallMcpToolsClient();
