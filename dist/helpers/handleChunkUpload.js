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
exports.handleChunkUpload = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const handleChunkUpload = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const chunk = req.file;
    const { originalname, chunkIndex, totalChunks } = req.body;
    const uploadDir = path_1.default.join(__dirname, '../../uploads/video');
    const filePath = path_1.default.join(uploadDir, originalname);
    if (!fs_1.default.existsSync(uploadDir)) {
        fs_1.default.mkdirSync(uploadDir);
    }
    fs_1.default.appendFileSync(filePath, fs_1.default.readFileSync(chunk === null || chunk === void 0 ? void 0 : chunk.path));
    fs_1.default.unlinkSync(chunk === null || chunk === void 0 ? void 0 : chunk.path);
    if (chunk) {
        if (Number(chunkIndex) + 1 === Number(totalChunks)) {
            res.json(`/${originalname}`);
        }
        else {
            res.json({ status: 'chunkReceived', message: 'Chunk received!' });
        }
    }
    else {
        res.status(400).json({ status: 'error', message: 'No chunk received' });
    }
});
exports.handleChunkUpload = handleChunkUpload;
