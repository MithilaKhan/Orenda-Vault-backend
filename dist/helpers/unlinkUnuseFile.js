"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unlinkUnuseFile = void 0;
const fs_1 = __importDefault(require("fs"));
const unlinkUnuseFile = (files) => {
    try {
        let unusedFileCount = 0;
        Object.keys(files).forEach(key => {
            const file = files[key];
            if (file.length) {
                file.forEach(f => {
                    if (f && fs_1.default.existsSync(f.path)) {
                        fs_1.default.unlinkSync(f.path);
                        unusedFileCount++;
                    }
                });
            }
        });
        console.log(`Removed ${unusedFileCount} unused files`);
    }
    catch (error) {
        console.log(error);
    }
};
exports.unlinkUnuseFile = unlinkUnuseFile;
