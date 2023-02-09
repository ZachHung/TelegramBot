import { Router, Express, Request, Response, NextFunction } from 'express';
import { webhookCallback } from 'grammy';
import bot from './bot_telegram.js';
import { getEnv } from './helpers.js';
import ChatService from './services_telegram.js';
const chatService = new ChatService();
import * as dotenv from 'dotenv';
dotenv.config();
import { getWebhook, postWebhook } from './bot_messenger.js';

const router = Router();
const route = (app: Express) => {
  app.use(
    '/telegram',
    router.post(
      '',
      async (req: Request, res: Response, next: NextFunction) =>
        await chatService.sendMessage(req, res, next),
    ),
  );

  if (process.env.NODE_ENV !== 'development') {
    app.use('/bot', webhookCallback(bot, 'express'));
  }
  app.post('/webhook', postWebhook);
  app.get('/webhook', getWebhook);
};

export default route;
