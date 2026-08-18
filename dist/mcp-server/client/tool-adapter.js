"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mscpOpenAiTolls = mscpOpenAiTolls;
function mscpOpenAiTolls(tools) {
    return tools.map((tool) => ({
        type: "function",
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema
    }));
}
