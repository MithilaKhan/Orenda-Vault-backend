import express from 'express';
import { ChatController } from './chat.controller';

const router = express.Router();

router.post(
  '/send',
  ChatController.sendMessage
);

export const ChatRoutes = router;
