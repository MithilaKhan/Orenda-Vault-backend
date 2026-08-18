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
exports.handleStripeWebhook = void 0;
const stripe_1 = __importDefault(require("../config/stripe"));
const config_1 = __importDefault(require("../config"));
const handlePurchaseCheckout_1 = require("../handlers/handlePurchaseCheckout");
const handleStripeWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sig = req.headers['stripe-signature'];
        let event = yield stripe_1.default.webhooks.constructEvent(req.body, sig, config_1.default.stripe.webhook_secret);
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object;
                yield (0, handlePurchaseCheckout_1.handlePurchaseCheckout)(session);
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
    }
    catch (error) {
        console.log(error);
    }
});
exports.handleStripeWebhook = handleStripeWebhook;
