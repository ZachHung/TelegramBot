import { BOT_TOKEN, PORT } from './config/env.js';
import express from 'express';
import { Telegraf } from 'telegraf';
import cors from 'cors';

export const bot = new Telegraf(BOT_TOKEN);
const app = express();
import route from './routes.js';

app.use(cors());
app.use(express.json({ limit: '1mb' }));
// Set the bot API endpoint
// app.use(await bot.createWebhook({ domain: `localhost:${PORT}` }));

bot.on('text', (ctx) => {
  console.log(ctx.chat.id);
});
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
route(app);
app.listen(PORT, () => console.log('Listening on port', PORT));
