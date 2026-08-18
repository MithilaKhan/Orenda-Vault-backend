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
exports.mcpRoutes = void 0;
const express_1 = __importDefault(require("express"));
const sse_js_1 = require("@modelcontextprotocol/sdk/server/sse.js");
const mcp_server_1 = require("./mcp.server");
const router = express_1.default.Router();
// A map to store transports by session ID if needed, 
// though typically a single instance might handle one or multiple transports.
const transports = new Map();
router.get('/sse', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Received new SSE connection request");
    // Initialize SSE transport. The URL '/api/mcp/messages' is where the client will POST messages.
    const transport = new sse_js_1.SSEServerTransport('/api/mcp/messages', res);
    yield mcp_server_1.server.connect(transport);
    transports.set(transport.sessionId, transport);
    console.log(`SSE connection established. Session ID: ${transport.sessionId}`);
    req.on('close', () => {
        console.log(`SSE connection closed for session: ${transport.sessionId}`);
        transports.delete(transport.sessionId);
    });
}));
router.post('/messages', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Note: The client typically appends ?sessionId=... to the POST URL 
    // when using SSEServerTransport.
    const sessionId = req.query.sessionId;
    let transport;
    if (sessionId) {
        transport = transports.get(sessionId);
    }
    else {
        // Fallback: If no sessionId is provided, try to use the first available transport (not ideal for multi-client).
        transport = Array.from(transports.values())[0];
    }
    if (!transport) {
        return res.status(404).send("Active SSE connection not found for this session. Note: This can happen in serverless environments like Vercel due to statelessness.");
    }
    yield transport.handlePostMessage(req, res);
}));
exports.mcpRoutes = router;
