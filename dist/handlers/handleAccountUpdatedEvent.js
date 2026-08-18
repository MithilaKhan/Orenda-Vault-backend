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
exports.handleAccountUpdatedEvent = void 0;
const stripe_1 = __importDefault(require("../config/stripe"));
const mongoose_1 = __importDefault(require("mongoose"));
const User = "";
const handleAccountUpdatedEvent = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    try {
        session.startTransaction();
        // Find the user by Stripe account ID
        const existingUser = yield User.findOne({ 'stripeAccountInfo.accountId': data.id });
        if (!existingUser) {
            return console.log('User not found');
        }
        // Check if the onboarding is complete
        if (data.charges_enabled) {
            const loginLink = yield stripe_1.default.accounts.createLoginLink(data.id);
            // Save Stripe account information to the user record
            yield User.findByIdAndUpdate(existingUser === null || existingUser === void 0 ? void 0 : existingUser._id, {
                stripeAccountInfo: {
                    accountId: data.id,
                    loginUrl: loginLink.url,
                }
            }, { session });
        }
        yield session.commitTransaction();
        session.endSession();
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
exports.handleAccountUpdatedEvent = handleAccountUpdatedEvent;
