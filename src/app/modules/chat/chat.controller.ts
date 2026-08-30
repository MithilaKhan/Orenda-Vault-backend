import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Secret } from 'jsonwebtoken';
import config from '../../../config';
import { jwtHelper } from '../../../helpers/jwtHelper';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ChatService } from './chat.service';

/**
 * Helper to safely extract user ID from JWT token or request user object.
 */
const extractUserIdFromReq = (req: Request): string | undefined => {
  if (req.user?.id) {
    return req.user.id;
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const verifyUser = jwtHelper.verifyToken(token, config.jwt.jwt_secret as Secret);
      return verifyUser?.id;
    } catch {
      return undefined;
    }
  }
  return undefined;
};

/**
 * Handles incoming chat messages sent to Orenda-vault AI.
 */
const sendMessage = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return sendResponse(res, {
      success: false,
      statusCode: StatusCodes.BAD_REQUEST,
      message: 'An array of messages is required',
      data: null,
    });
  }

  const userId = extractUserIdFromReq(req);
  const result = await ChatService.processChatMessage(messages, userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Message processed successfully',
    data: result,
  });
});

/**
 * Retrieves past conversation history for the user.
 */
const getChatHistory = catchAsync(async (req: Request, res: Response) => {
  const userId = extractUserIdFromReq(req);

  if (!userId) {
    return sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'User is not logged in',
      data: [],
    });
  }

  const result = await ChatService.getChatHistory(userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Chat history retrieved successfully',
    data: result,
  });
});

/**
 * Clears all chat history for the user.
 */
const clearChatHistory = catchAsync(async (req: Request, res: Response) => {
  const userId = extractUserIdFromReq(req);

  if (!userId) {
    return sendResponse(res, {
      success: false,
      statusCode: StatusCodes.UNAUTHORIZED,
      message: 'You are not authorized',
      data: null,
    });
  }

  const result = await ChatService.clearChatHistory(userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Chat history cleared successfully',
    data: result,
  });
});

export const ChatController = {
  sendMessage,
  getChatHistory,
  clearChatHistory,
};
