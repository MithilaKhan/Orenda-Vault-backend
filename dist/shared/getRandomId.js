"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandomId = void 0;
const crypto_1 = __importDefault(require("crypto"));
const getRandomId = (prefix, length = 6, caseType = "uppercase") => {
    const randomBytes = crypto_1.default.randomBytes(length);
    const randomId = randomBytes.toString('hex');
    const id = prefix ? `${prefix}${randomId}` : randomId;
    const numberId = Math.floor(Math.random() * 1000000);
    if (caseType == 'number') {
        return prefix + numberId.toString();
    }
    return caseType == 'uppercase' ? id.toUpperCase() : id.toLowerCase();
};
exports.getRandomId = getRandomId;
