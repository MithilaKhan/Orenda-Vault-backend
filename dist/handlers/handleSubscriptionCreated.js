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
exports.handleSubscriptionCreated = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const stripe_1 = __importDefault(require("../config/stripe"));
const Package = "";
const Subscription = "";
const User = "";
const handleSubscriptionCreated = (event) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const mongooseSession = yield mongoose_1.default.startSession();
    try {
        mongooseSession.startTransaction();
        // console.log(event);
        const subscription = yield stripe_1.default.subscriptions.retrieve(event.id);
        if (!subscription) {
            console.log("subscription not found");
            return;
        }
        // console.log(subscription);
        const price_id = (_b = (_a = subscription === null || subscription === void 0 ? void 0 : subscription.items) === null || _a === void 0 ? void 0 : _a.data[0]) === null || _b === void 0 ? void 0 : _b.price.id;
        if (!price_id) {
            console.log("price_id not found");
            return;
        }
        const packageData = yield Package.findOne({ price_id });
        if (!packageData) {
            console.log("package not found");
            return;
        }
        const customer = yield stripe_1.default.customers.retrieve(subscription.customer);
        if (!customer) {
            console.log("customer not found");
            return;
        }
        const user = yield User.findOne({ email: customer.email }).lean();
        if (!user) {
            console.log("user not found");
            return;
        }
        const existingSubscription = yield Subscription.findById(user.subscription);
        if (existingSubscription) {
            yield Subscription.findByIdAndUpdate(user.subscription, { status: "inactive" }, { session: mongooseSession });
        }
        const startDate = new Date();
        const endDate = packageData.recurring == "week" ? new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000) : packageData.recurring == "month" ? new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000) : new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);
        const newSubscription = yield Subscription.create({
            subscriptionId: event.id,
            status: "active",
            user: user._id,
            package: packageData._id,
            startDate: startDate,
            endDate: endDate,
            price: packageData.price,
        });
        yield User.findByIdAndUpdate(user._id, { subscription: newSubscription._id }, { session: mongooseSession });
        yield mongooseSession.commitTransaction();
        yield mongooseSession.endSession();
    }
    catch (error) {
        yield mongooseSession.abortTransaction();
        yield mongooseSession.endSession();
        console.log(error);
    }
});
exports.handleSubscriptionCreated = handleSubscriptionCreated;
