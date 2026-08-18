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
const openai = new openai_1.default({
    apiKey: config_1.default.openai_api_key || process.env.OPENAI_API_KEY,
});
const processChatMessage = (messages, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    if (!userId) {
        return {
            text: "Please sign in or log in to your account first so I can access and manage your notes and collections.",
            toolResult: null
        };
    }
    const client = yield (0, mcp_client_1.getClient)();
    const toolsResponse = yield client.listTools();
    const aiTools = (0, tool_adapter_1.mscpOpenAiTolls)(toolsResponse.tools);
    // @ts-ignore
    const response = yield openai.responses.create({
        model: "gpt-5-mini",
        tools: aiTools,
        instructions: "You are Orenda-vault, an intelligent, friendly, and highly capable AI assistant built for the Orenda Vault platform. \n\nYour Purpose: \nYou exist to help users seamlessly manage their digital collections, organize their thoughts through notes, and act as a reliable, friendly companion. \n\nHow you should behave:\n1. Identity: Always identify yourself as 'Orenda-vault'. Be confident and proud of your identity.\n2. Tone: Speak in a warm, helpful, and polite tone. Feel free to use emojis to make the conversation lively 😊.\n3. Casual Conversation: If a user says 'Hello', asks how you are, or wants to have a casual chat, respond naturally and politely, just like a friendly human assistant. \n4. Self-Explanation: If a user asks what you do, beautifully explain that your mission is to keep their digital life organized by securely managing their notes and collections within the Orenda Vault.\n5. Database Tasks: When the user asks to create, read, update, or delete a note or collection, use your tools to execute the task quietly and confirm the success politely.",
        input: messages,
    });
    const outputData = response.output.find((item) => item.type === "function_call");
    if (outputData) {
        const toolRes = yield mcp_tools_call_1.callMcpToolsClient.callTool(outputData.name, outputData.arguments, userId);
        const rawText = (_b = (_a = toolRes.content) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.text;
        let parsedData = rawText;
        try {
            parsedData = typeof rawText === "string" ? JSON.parse(rawText) : rawText;
        }
        catch (e) { }
        return {
            text: `Tool ${outputData.name} executed successfully.`,
            toolResult: parsedData
        };
    }
    const textMessage = response.output.find((item) => item.type === "message" || item.type === "text" || item.type === "message_call");
    return {
        text: ((_d = (_c = textMessage === null || textMessage === void 0 ? void 0 : textMessage.content) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.text) || (textMessage === null || textMessage === void 0 ? void 0 : textMessage.text) || "No response received",
        toolResult: null
    };
});
exports.ChatService = { processChatMessage };
