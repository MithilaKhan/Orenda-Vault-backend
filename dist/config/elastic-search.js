"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.esClient = void 0;
const elasticsearch_1 = require("@elastic/elasticsearch");
const _1 = __importDefault(require("."));
exports.esClient = new elasticsearch_1.Client({
    node: _1.default.elasticSearch.url,
});
