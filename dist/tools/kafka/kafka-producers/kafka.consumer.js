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
exports.kafkaConsumer = void 0;
const kafka_1 = __importDefault(require("../../../config/kafka"));
const kafkaConsumer = (_a) => __awaiter(void 0, [_a], void 0, function* ({ groupId, topic, cb }) {
    try {
        const consumer = kafka_1.default.consumer({ groupId: groupId });
        yield consumer.connect();
        yield consumer.subscribe({ topic: topic, fromBeginning: true });
        yield consumer.run({ eachBatch: (_a) => __awaiter(void 0, [_a], void 0, function* ({ batch, heartbeat, resolveOffset, commitOffsetsIfNecessary }) {
                batch.messages.forEach((message) => __awaiter(void 0, void 0, void 0, function* () {
                    var _a;
                    const data = JSON.parse((_a = message.value) === null || _a === void 0 ? void 0 : _a.toString());
                    yield cb(data);
                    resolveOffset(message.offset);
                }));
                yield commitOffsetsIfNecessary();
                heartbeat();
            }) });
    }
    catch (error) {
        console.log(error);
    }
});
exports.kafkaConsumer = kafkaConsumer;
