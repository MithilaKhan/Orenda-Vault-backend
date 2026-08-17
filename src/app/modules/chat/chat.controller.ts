import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ChatService } from './chat.service';
import { jwtHelper } from '../../../helpers/jwtHelper';
import config from '../../../config';
import { Secret } from 'jsonwebtoken';

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

  const tokenWithBearer = req.headers.authorization;
  let userId: string | undefined = undefined;
  if (tokenWithBearer && tokenWithBearer.startsWith('Bearer ')) {
    const token = tokenWithBearer.split(' ')[1];
    try {
      const verifyUser = jwtHelper.verifyToken(
        token,
        config.jwt.jwt_secret as Secret
      );
      req.user = verifyUser;
      userId = verifyUser.id;
    } catch (error) {
      // Ignore token verification errors
    }
  }

  const result = await ChatService.processChatMessage(messages, userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Message processed successfully',
    data: result,
  });
});

export const ChatController = { sendMessage };
