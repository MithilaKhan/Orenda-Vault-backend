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
exports.kafkaProducer = void 0;
const kafka_1 = __importDefault(require("../../../config/kafka"));
exports.kafkaProducer = {
    sendMessage: (topic, message) => __awaiter(void 0, void 0, void 0, function* () {
        const producer = kafka_1.default.producer();
        yield producer.connect();
        yield producer.send({
            topic: topic,
            messages: [{ value: JSON.stringify(message) }],
        });
        yield producer.disconnect();
    }),
};
