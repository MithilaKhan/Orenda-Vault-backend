"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const kafkajs_1 = require("kafkajs");
const _1 = __importDefault(require("."));
const kafka = new kafkajs_1.Kafka({
    clientId: 'my-app',
    brokers: [_1.default.kafka.url],
    logLevel: 2,
});
exports.default = kafka;
