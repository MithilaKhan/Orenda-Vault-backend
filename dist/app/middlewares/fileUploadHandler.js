"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const http_status_codes_1 = require("http-status-codes");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const fileUploadHandler = (customFile = []) => {
    var _a, _b;
    const fileTypeArray = [
        {
            name: 'image',
            type: ['image/jpeg', 'image/png', 'image/jpg'],
            maxCount: 3,
        },
        {
            name: 'media',
            type: [
                'video/mp4',
                'video/ogg',
                'video/webm',
                'audio/mpeg',
                'audio/ogg',
                'audio/webm',
                'audio/wav',
            ],
            maxCount: 3,
        },
        {
            name: 'doc',
            type: ['application/pdf'],
            maxCount: 3,
        },
    ];
    // merge custom config
    if (customFile.length) {
        for (const el of customFile) {
            fileTypeArray.push({
                name: el.name,
                type: ((_a = el.type) === null || _a === void 0 ? void 0 : _a.length) ? el.type : ['*'],
                maxCount: (_b = el.maxCount) !== null && _b !== void 0 ? _b : 3,
            });
        }
    }
    const baseUploadDir = process.env.VERCEL
        ? path_1.default.join('/tmp', 'uploads')
        : path_1.default.join(process.cwd(), 'uploads');
    if (!fs_1.default.existsSync(baseUploadDir)) {
        fs_1.default.mkdirSync(baseUploadDir, { recursive: true });
    }
    const createDir = (dirPath) => {
        if (!fs_1.default.existsSync(dirPath)) {
            fs_1.default.mkdirSync(dirPath, { recursive: true });
        }
    };
    const storage = multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            const config = fileTypeArray.find(f => f.name === file.fieldname);
            if (!config) {
                return cb(new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid file field'), '');
            }
            const uploadDir = path_1.default.join(baseUploadDir, config.name);
            createDir(uploadDir);
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const ext = path_1.default.extname(file.originalname);
            const name = path_1.default
                .basename(file.originalname, ext)
                .toLowerCase()
                .replace(/\s+/g, '-') +
                '-' +
                Date.now();
            cb(null, name + ext);
        },
    });
    const fileFilter = (req, file, cb) => {
        const config = fileTypeArray.find(f => f.name === file.fieldname);
        if (!config) {
            return cb(new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid file field'));
        }
        if (config.type.includes('*') || config.type.includes(file.mimetype)) {
            return cb(null, true);
        }
        cb(new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, `Only supports ${config.type.join(', ')}`));
    };
    return (0, multer_1.default)({
        storage,
        fileFilter,
    }).fields(fileTypeArray.map(f => ({
        name: f.name,
        maxCount: f.maxCount,
    })));
};
exports.default = fileUploadHandler;
