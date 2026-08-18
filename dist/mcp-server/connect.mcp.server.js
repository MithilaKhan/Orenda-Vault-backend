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
exports.mcpServerConnect = mcpServerConnect;
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const mcp_server_1 = require("./mcp.server");
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("../config"));
function mcpServerConnect() {
    return __awaiter(this, void 0, void 0, function* () {
        if (config_1.default.database_url) {
            yield mongoose_1.default.connect(config_1.default.database_url);
            console.error("🚀 Database connected for MCP server");
        }
        const transport = new stdio_js_1.StdioServerTransport();
        yield mcp_server_1.server.connect(transport);
        console.error("✅ MCP Server is running...");
    });
}
mcpServerConnect().catch(console.error);
