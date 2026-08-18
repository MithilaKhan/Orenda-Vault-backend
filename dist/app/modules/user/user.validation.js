"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidation = void 0;
const zod_1 = require("zod");
const createUserZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({ message: 'Name is required' }),
        email: zod_1.z.string({ message: 'Email is required' }),
        password: zod_1.z.union([zod_1.z.string(), zod_1.z.number()], { message: 'Password is required' }).transform(String),
        profile: zod_1.z.string().optional(),
    }),
});
const updateUserZodSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    contact: zod_1.z.string().optional(),
    email: zod_1.z.string().optional(),
    password: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).transform(String).optional(),
    location: zod_1.z.string().optional(),
    image: zod_1.z.string().optional(),
});
exports.UserValidation = {
    createUserZodSchema,
    updateUserZodSchema,
};
