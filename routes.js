import ChatService from './services.js';
import { Router } from 'express';
import { webhookCallback } from 'grammy';
import bot from './bot.js';

const router = Router();
const route = (app) => {
  app.use(
    '/telegram',
    router.post('', (req, res) => ChatService.sendMessage(req, res)),
  );
  if (process.env.NODE_ENV !== 'development') {
    app.use('/bot', webhookCallback(bot, 'express'));
  }
};

export default route;
