import ChatService from './services.js';
import { Router, Express, Request, Response, NextFunction } from 'express';
import { webhookCallback } from 'grammy';
import bot from './bot.js';

const router = Router();
const route = (app: Express) => {
  app.use(
    '/telegram',
    router.post(
      '',
      async (req: Request, res: Response, next: NextFunction) =>
        await ChatService.sendMessage(req, res, next),
    ),
  );
  if (process.env.NODE_ENV !== 'development') {
    app.use('/bot', webhookCallback(bot, 'express'));
  }
};

export default route;
