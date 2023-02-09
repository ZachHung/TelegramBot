import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import route from './routes.js';
import bot from './bot_telegram.js';
import {
  errorLogger,
  errorResponder,
  getEnv,
  invalidPathHandler,
  requestLogger,
} from './helpers.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(requestLogger);
route(app);
app.use(errorLogger);
// app.use(errorResponder);
app.use(invalidPathHandler);

if (getEnv('NODE_ENV') === 'development') bot.start();

const port = getEnv('PORT') || 6969;

if (getEnv('NODE_ENV') !== 'development') {
  app.listen(port, async () => {
    await bot.api.setWebhook(`https://${process.env.HOST}/bot`);
  });
} else {
  app.listen(port, async () => {
    console.log('Listening on', port);
  });
}
