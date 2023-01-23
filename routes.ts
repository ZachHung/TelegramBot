import { Router, Express, Request, Response, NextFunction } from 'express';
import { webhookCallback } from 'grammy';
import bot from './bot.js';
import ChatService from './services.js';
const chatService = new ChatService();

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
  // app.use(
  //   '/test',
  //   router.get(
  //     '',
  //     async (req: Request, res: Response, next: NextFunction) =>
  //       await chatService.logAllUser(req, res, next),
  //   ),
  // );
  if (process.env.NODE_ENV !== 'development') {
    app.use('/bot', webhookCallback(bot, 'express'));
  }
};

export default route;
