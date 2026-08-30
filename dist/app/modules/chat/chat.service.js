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
exports.ChatService = void 0;
const openai_1 = __importDefault(require("openai"));
const mcp_client_1 = require("../../../mcp-server/client/mcp-client");
const mcp_tools_call_1 = require("../../../mcp-server/client/mcp-tools.call");
const tool_adapter_1 = require("../../../mcp-server/client/tool-adapter");
const config_1 = __importDefault(require("../../../config"));
const chat_model_1 = require("./chat.model");
const chat_constants_1 = require("./chat.constants");
const openai = new openai_1.default({
    apiKey: config_1.default.openai_api_key || process.env.OPENAI_API_KEY,
});
/**
 * Processes an incoming AI chat conversation message chain.
 * Handles OpenAI tool calls (MCP tools), database updates, and response generation.
 */
const processChatMessage = (messages, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const client = yield (0, mcp_client_1.getClient)();
    const toolsResponse = yield client.listTools();
    const aiTools = (0, tool_adapter_1.mscpOpenAiTolls)(toolsResponse.tools);
    const lastUserMsg = messages && messages.length > 0 ? messages[messages.length - 1] : null;
    const formattedMessages = [
        { role: 'system', content: chat_constants_1.SYSTEM_INSTRUCTIONS },
        ...messages.map((m) => ({
            role: (m.role === 'assistant' || m.role === 'user' || m.role === 'system' ? m.role : 'user'),
            content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
        })),
    ];
    // Turn 1: Initial call to OpenAI to determine if tool execution is required
    const completion = yield openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: formattedMessages,
        tools: aiTools,
    });
    const choice = completion.choices[0];
    const responseMessage = choice.message;
    let replyText = '';
    let toolResultData = null;
    // Turn 2: Handle tool calls if requested by OpenAI
    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
        if (!userId) {
            return {
                text: 'Please sign in or log in to your account first so I can access and manage your notes and collections.',
                toolResult: null,
            };
        }
        formattedMessages.push(responseMessage);
        for (const toolCall of responseMessage.tool_calls) {
            const toolName = ((_a = toolCall.function) === null || _a === void 0 ? void 0 : _a.name) || toolCall.name;
            let toolArgs = {};
            try {
                toolArgs = JSON.parse(((_b = toolCall.function) === null || _b === void 0 ? void 0 : _b.arguments) || toolCall.arguments || '{}');
            }
            catch (e) {
                toolArgs = {};
            }
            const toolRes = yield mcp_tools_call_1.callMcpToolsClient.callTool(toolName, toolArgs, userId);
            const rawText = (_d = (_c = toolRes.content) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.text;
            let parsedData = rawText;
            try {
                parsedData = typeof rawText === 'string' ? JSON.parse(rawText) : rawText;
            }
            catch (e) { }
            toolResultData = parsedData;
            formattedMessages.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                content: typeof rawText === 'string' ? rawText : JSON.stringify(rawText || { success: true }),
            });
        }
        const secondCompletion = yield openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: formattedMessages,
        });
        replyText = secondCompletion.choices[0].message.content || "Done! I've completed your request successfully. ✨";
    }
    else {
        replyText = responseMessage.content || 'No response received';
    }
    // Persist conversation turn to MongoDB if user is authenticated
    if (userId) {
        let chatDoc = yield chat_model_1.Chat.findOne({ user: userId });
        if (!chatDoc) {
            chatDoc = new chat_model_1.Chat({ user: userId, messages: [] });
        }
        if (lastUserMsg && lastUserMsg.content) {
            chatDoc.messages.push({
                role: lastUserMsg.role || 'user',
                content: typeof lastUserMsg.content === 'string' ? lastUserMsg.content : JSON.stringify(lastUserMsg.content),
            });
        }
        chatDoc.messages.push({
            role: 'assistant',
            content: replyText,
            toolResult: toolResultData,
        });
        yield chatDoc.save();
    }
    return {
        text: replyText,
        toolResult: toolResultData,
    };
});
/**
 * Retrieves chat message history for an authenticated user.
 */
const getChatHistory = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const chatDoc = yield chat_model_1.Chat.findOne({ user: userId });
    if (!chatDoc) {
        return [];
    }
    return chatDoc.messages;
});
/**
 * Clears chat history for an authenticated user.
 */
const clearChatHistory = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    yield chat_model_1.Chat.findOneAndDelete({ user: userId });
    return { message: 'Chat history cleared successfully' };
});
exports.ChatService = {
    processChatMessage,
    getChatHistory,
    clearChatHistory,
};
