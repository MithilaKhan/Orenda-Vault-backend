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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisHelper = void 0;
const redis_1 = require("../../config/redis");
const buildField = (query) => {
    if (!query)
        return '';
    const sortedQuery = Object.keys(query)
        .sort()
        .reduce((acc, key) => {
        acc[key] = query[key];
        return acc;
    }, {});
    return new URLSearchParams(sortedQuery).toString();
};
const redisSet = (key_1, value_1, query_1, ...args_1) => __awaiter(void 0, [key_1, value_1, query_1, ...args_1], void 0, function* (key, value, query, ttl = 60) {
    const queryString = buildField(query);
    yield redis_1.redisClient.set(`${key}:${queryString || '1'}`, JSON.stringify(value), "EX", ttl);
    return false;
});
const redisGet = (key, query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryString = buildField(query);
    const data = JSON.parse((yield redis_1.redisClient.get(`${key}:${queryString || '1'}`)) || "[]");
    if (Array.isArray(data) && !data.length) {
        return null;
    }
    return data;
});
const redisHset = (key_1, query_1, value_1, ...args_1) => __awaiter(void 0, [key_1, query_1, value_1, ...args_1], void 0, function* (key, query, value, ttl = 60) {
    const field = buildField(query);
    ;
    yield redis_1.redisClient.hset(key, field, JSON.stringify(value), "EX", ttl);
});
const redisHget = (key, query) => __awaiter(void 0, void 0, void 0, function* () {
    const field = buildField(query);
    ;
    const data = JSON.parse((yield redis_1.redisClient.hget(key, field)) || "[]");
    if (Array.isArray(data) && !data.length) {
        return null;
    }
    return data;
});
const keyDelete = (pattern) => __awaiter(void 0, void 0, void 0, function* () {
    const keys = yield redis_1.redisClient.scanStream({ match: pattern }).toArray();
    if (!(keys === null || keys === void 0 ? void 0 : keys.flat().length))
        return;
    // Use pipeline for efficient deletion
    const pipeline = redis_1.redisClient.multi();
    keys.forEach((key) => {
        if (key.length)
            pipeline.del(key);
    });
    yield pipeline.exec();
});
// ✅ Fixed HKeyDelete function
const HKeyDelete = (key) => __awaiter(void 0, void 0, void 0, function* () {
    const fields = yield redis_1.redisClient.hkeys(key);
    console.log('Fields to delete:', fields);
    if (!fields.length)
        return;
    yield redis_1.redisClient.hdel(key, ...fields);
});
exports.RedisHelper = {
    redisSet,
    redisGet,
    redisHset,
    redisHget,
    keyDelete,
    HKeyDelete,
};
