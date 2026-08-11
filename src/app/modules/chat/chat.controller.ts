import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ChatService } from './chat.service';

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

  const result = await ChatService.processChatMessage(messages);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Message processed successfully',
    data: result,
  });
});

export const ChatController = { sendMessage };
