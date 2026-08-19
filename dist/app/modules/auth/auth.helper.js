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
exports.AuthHelper = void 0;
const generateOTP_1 = __importDefault(require("../../../util/generateOTP"));
const user_model_1 = require("../user/user.model");
const emailTemplate_1 = require("../../../shared/emailTemplate");
const emailHelper_1 = require("../../../helpers/emailHelper");
const unverifiedAccountHandle = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const otp = (0, generateOTP_1.default)();
    const authentication = {
        oneTimeCode: otp,
        expireAt: new Date(Date.now() + 3 * 60000),
    };
    const user = yield user_model_1.User.findOne({ email });
    yield user_model_1.User.findOneAndUpdate({ email }, { $set: { authentication } });
    const values = {
        otp: otp,
        email: email,
        name: user === null || user === void 0 ? void 0 : user.name,
    };
    const createAccountTemplate = emailTemplate_1.emailTemplate.createAccount(values);
    yield emailHelper_1.emailHelper.sendEmail(createAccountTemplate);
    return otp;
});
exports.AuthHelper = {
    unverifiedAccountHandle,
};
