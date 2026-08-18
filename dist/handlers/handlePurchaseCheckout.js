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
exports.handlePurchaseCheckout = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const handlePurchaseCheckout = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const mongoSession = yield mongoose_1.default.startSession();
    try {
        mongoSession.startTransaction();
        const metadata = data === null || data === void 0 ? void 0 : data.metadata;
        yield mongoSession.commitTransaction();
        mongoSession.endSession();
    }
    catch (error) {
        mongoSession.abortTransaction();
        mongoSession.endSession();
        console.log(error);
    }
});
exports.handlePurchaseCheckout = handlePurchaseCheckout;
