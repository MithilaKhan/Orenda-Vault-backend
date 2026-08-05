import { z } from 'zod';

const createVerifyEmailZodSchema = z.object({
  body: z.object({
    email: z.string({ message: 'Email is required' }),
    oneTimeCode: z.number({ message: 'One time code is required' }),
  }),
});

const createLoginZodSchema = z.object({
  body: z.object({
    email: z.string({ message: 'Email is required' }),
    password: z.union([z.string(), z.number()], { message: 'Password is required' }).transform(String),
  }),
});

const createForgetPasswordZodSchema = z.object({
  body: z.object({
    email: z.string({ message: 'Email is required' }),
  }),
});

const createResetPasswordZodSchema = z.object({
  body: z.object({
    newPassword: z.union([z.string(), z.number()], { message: 'Password is required' }).transform(String),
    confirmPassword: z.union([z.string(), z.number()], {
      message: 'Confirm Password is required',
    }).transform(String),
  }),
});

const createChangePasswordZodSchema = z.object({
  body: z.object({
    currentPassword: z.union([z.string(), z.number()], {
      message: 'Current Password is required',
    }).transform(String),
    newPassword: z.union([z.string(), z.number()], { message: 'New Password is required' }).transform(String),
    confirmPassword: z.union([z.string(), z.number()], {
      message: 'Confirm Password is required',
    }).transform(String),
  }),
});

export const AuthValidation = {
  createVerifyEmailZodSchema,
  createForgetPasswordZodSchema,
  createLoginZodSchema,
  createResetPasswordZodSchema,
  createChangePasswordZodSchema,
};
