"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatRoutes = void 0;
const express_1 = __importDefault(require("express"));
const chat_controller_1 = require("./chat.controller");
const router = express_1.default.Router();
router.post('/send', chat_controller_1.ChatController.sendMessage);
router.get('/', chat_controller_1.ChatController.getChatHistory);
router.get('/history', chat_controller_1.ChatController.getChatHistory);
router.delete('/clear', chat_controller_1.ChatController.clearChatHistory);
router.delete('/', chat_controller_1.ChatController.clearChatHistory);
exports.ChatRoutes = router;
