import {
  Bot,
  Keyboard,
  Context,
  session,
  GrammyError,
  HttpError,
} from 'grammy';
import {
  conversations,
  createConversation,
  type Conversation,
  type ConversationFlavor,
} from '@grammyjs/conversations';
import * as dotenv from 'dotenv';
import ChatService from './services.js';
import moment from 'moment';
import { getEnv } from './helpers.js';

// Typing for bot
type MyContext = Context & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

dotenv.config();

const bot = new Bot<MyContext>(getEnv('BOT_TOKEN'));
bot.use(session({ initial: () => ({}) }));
bot.use(conversations());

async function commandCreateNotionPage(
  conversation: MyConversation,
  ctx: MyContext,
) {
  let questions = [
    "What is the user's Facebook name:",
    'What is the username:',
    'What is the slot name:',
    'What is the password:',
    'What is subscribe date (YYYY-MM-DD):',
  ];
  let answers = {
    name: '',
    username: '',
    slotName: '',
    password: '',
    date: '',
  };
  await ctx.reply('Creating new notion page');

  for (let index = 0; index < questions.length; ++index) {
    await ctx.reply(questions[index]);
    let answer = await conversation.waitFor(':text');
    answers[Object.keys(answers)[index] as keyof typeof answers] =
      answer.msg.text;

    while (
      !moment(answers.date, 'YYYY-MM-DD', true).isValid() &&
      answers.date !== ''
    ) {
      await ctx.reply(`⁉ Invalid date format ⁉\n${questions[index]}`);
      let answer = await conversation.waitFor(':text');
      answers[Object.keys(answers)[index] as keyof typeof answers] =
        answer.msg.text;
    }
  }
  const keyboard = new Keyboard()
    .text('1 tháng')
    .row()
    .text('3 tháng')
    .oneTime();

  await ctx.reply('How long is the subscription?', {
    reply_markup: keyboard,
  });
  let time = await conversation.waitFor(':text');

  await ChatService.createNotionPage({
    time: time.msg.text,
    ...answers,
  });

  await ctx.reply('🎉 New account has been added! 🎉');
}

bot.use(createConversation(commandCreateNotionPage));
bot.command('new', async (ctx) => {
  await ctx.conversation.enter('commandCreateNotionPage');
});
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error('Error in request:', e.description);
  } else if (e instanceof HttpError) {
    console.error('Could not contact Telegram:', e);
  } else {
    console.error('Unknown error:', e);
  }
});

export default bot;
