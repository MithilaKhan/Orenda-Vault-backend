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
const dotenv_1 = __importDefault(require("dotenv"));
const promises_1 = __importDefault(require("node:readline/promises"));
const node_process_1 = require("node:process");
const chat_service_1 = require("../../app/modules/chat/chat.service");
dotenv_1.default.config();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const rl = promises_1.default.createInterface({
            input: node_process_1.stdin,
            output: node_process_1.stdout,
        });
        const question = yield rl.question("You: ");
        const messages = [{ role: "user", content: question }];
        const result = yield chat_service_1.ChatService.processChatMessage(messages);
        console.log("\nAssistant:");
        if (result.toolResult) {
            console.log(result.toolResult);
        }
        else {
            console.log(result.text);
        }
        rl.close();
    });
}
main().catch(console.error);
