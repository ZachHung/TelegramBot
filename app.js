import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { Telegraf } from 'telegraf';
import cors from 'cors';
import route from './routes.js';

export const bot = new Telegraf(process.env.BOT_TOKEN);

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
route(app);

if (process.env.NODE_ENV !== 'development') {
  app.use(await bot.createWebhook({ domain: process.env.HOST }));
} else {
  bot.launch();
  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}
let port = process.env.PORT || 6969;
app.listen(port, () => console.log('Listening on', port));
