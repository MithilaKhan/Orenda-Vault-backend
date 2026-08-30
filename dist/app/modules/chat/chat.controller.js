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
exports.ChatController = void 0;
const http_status_codes_1 = require("http-status-codes");
const config_1 = __importDefault(require("../../../config"));
const jwtHelper_1 = require("../../../helpers/jwtHelper");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const chat_service_1 = require("./chat.service");
/**
 * Helper to safely extract user ID from JWT token or request user object.
 */
const extractUserIdFromReq = (req) => {
    var _a;
    if ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) {
        return req.user.id;
    }
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const verifyUser = jwtHelper_1.jwtHelper.verifyToken(token, config_1.default.jwt.jwt_secret);
            return verifyUser === null || verifyUser === void 0 ? void 0 : verifyUser.id;
        }
        catch (_b) {
            return undefined;
        }
    }
    return undefined;
};
/**
 * Handles incoming chat messages sent to Orenda-vault AI.
 */
const sendMessage = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_codes_1.StatusCodes.BAD_REQUEST,
            message: 'An array of messages is required',
            data: null,
        });
    }
    const userId = extractUserIdFromReq(req);
    const result = yield chat_service_1.ChatService.processChatMessage(messages, userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Message processed successfully',
        data: result,
    });
}));
/**
 * Retrieves past conversation history for the user.
 */
const getChatHistory = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = extractUserIdFromReq(req);
    if (!userId) {
        return (0, sendResponse_1.default)(res, {
            success: true,
            statusCode: http_status_codes_1.StatusCodes.OK,
            message: 'User is not logged in',
            data: [],
        });
    }
    const result = yield chat_service_1.ChatService.getChatHistory(userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Chat history retrieved successfully',
        data: result,
    });
}));
/**
 * Clears all chat history for the user.
 */
const clearChatHistory = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = extractUserIdFromReq(req);
    if (!userId) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_codes_1.StatusCodes.UNAUTHORIZED,
            message: 'You are not authorized',
            data: null,
        });
    }
    const result = yield chat_service_1.ChatService.clearChatHistory(userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Chat history cleared successfully',
        data: result,
    });
}));
exports.ChatController = {
    sendMessage,
    getChatHistory,
    clearChatHistory,
};
