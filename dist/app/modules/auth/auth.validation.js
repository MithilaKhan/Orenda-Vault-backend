"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthValidation = void 0;
const zod_1 = require("zod");
const createVerifyEmailZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string({ message: 'Email is required' }),
        oneTimeCode: zod_1.z.number({ message: 'One time code is required' }),
    }),
});
const createLoginZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string({ message: 'Email is required' }),
        password: zod_1.z.union([zod_1.z.string(), zod_1.z.number()], { message: 'Password is required' }).transform(String),
    }),
});
const createForgetPasswordZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string({ message: 'Email is required' }),
    }),
});
const createResetPasswordZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        newPassword: zod_1.z.union([zod_1.z.string(), zod_1.z.number()], { message: 'Password is required' }).transform(String),
        confirmPassword: zod_1.z.union([zod_1.z.string(), zod_1.z.number()], {
            message: 'Confirm Password is required',
        }).transform(String),
    }),
});
const createChangePasswordZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        currentPassword: zod_1.z.union([zod_1.z.string(), zod_1.z.number()], {
            message: 'Current Password is required',
        }).transform(String),
        newPassword: zod_1.z.union([zod_1.z.string(), zod_1.z.number()], { message: 'New Password is required' }).transform(String),
        confirmPassword: zod_1.z.union([zod_1.z.string(), zod_1.z.number()], {
            message: 'Confirm Password is required',
        }).transform(String),
    }),
});
exports.AuthValidation = {
    createVerifyEmailZodSchema,
    createForgetPasswordZodSchema,
    createLoginZodSchema,
    createResetPasswordZodSchema,
    createChangePasswordZodSchema,
};
