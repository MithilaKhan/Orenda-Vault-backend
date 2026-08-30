import express from 'express';
import { ChatController } from './chat.controller';

const router = express.Router();

router.post('/send', ChatController.sendMessage);
router.get('/', ChatController.getChatHistory);
router.get('/history', ChatController.getChatHistory);
router.delete('/clear', ChatController.clearChatHistory);
router.delete('/', ChatController.clearChatHistory);

export const ChatRoutes = router;
