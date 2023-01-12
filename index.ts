import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import route from './routes.js';
import bot from './bot.js';
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
app.use(errorResponder);
app.use(invalidPathHandler);

if (getEnv('NODE_ENV') === 'development') bot.start();

let port = getEnv('PORT') || 6969;
app.listen(port, async () => {
  console.log('Listening on', port);
  if (process.env.NODE_ENV !== 'development')
    await bot.api.setWebhook(`https://${process.env.HOST}/bot`);
});
