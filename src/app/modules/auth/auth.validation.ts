import { z } from 'zod';

const createVerifyEmailZodSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }),
    oneTimeCode: z.number({ required_error: 'One time code is required' }),
  }),
});

const createLoginZodSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }),
    password: z.union([z.string(), z.number()], { required_error: 'Password is required' }).transform(String),
  }),
});

const createForgetPasswordZodSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }),
  }),
});

const createResetPasswordZodSchema = z.object({
  body: z.object({
    newPassword: z.union([z.string(), z.number()], { required_error: 'Password is required' }).transform(String),
    confirmPassword: z.union([z.string(), z.number()], {
      required_error: 'Confirm Password is required',
    }).transform(String),
  }),
});

const createChangePasswordZodSchema = z.object({
  body: z.object({
    currentPassword: z.union([z.string(), z.number()], {
      required_error: 'Current Password is required',
    }).transform(String),
    newPassword: z.union([z.string(), z.number()], { required_error: 'New Password is required' }).transform(String),
    confirmPassword: z.union([z.string(), z.number()], {
      required_error: 'Confirm Password is required',
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
