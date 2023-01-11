import { Bot, Keyboard, session } from 'grammy';
import { conversations, createConversation } from '@grammyjs/conversations';
import * as dotenv from 'dotenv';
import ChatService from './services.js';
import moment from 'moment';

dotenv.config();

if (process.env.BOT_TOKEN === null) throw Error('BOT_TOKEN is missing.');
const bot = new Bot(process.env.BOT_TOKEN);
bot.use(session({ initial: () => ({}) }));
bot.use(conversations());

async function commandCreateNotionPage(conversation, ctx) {
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
    answers[Object.keys(answers)[index]] = answer.msg.text;

    while (
      !moment(answers.date, 'YYYY-MM-DD', true).isValid() &&
      answers.date !== ''
    ) {
      await ctx.reply(`⁉ Invalid date format ⁉\n${questions[index]}`);
      let answer = await conversation.waitFor(':text');
      answers[Object.keys(answers)[index]] = answer.msg.text;
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

  await ChatService.createNotionPage({ time: time.msg.text, ...answers });

  await ctx.reply('🎉 New account has been added! 🎉');
}

bot.use(createConversation(commandCreateNotionPage));
bot.command('new', async (ctx) => {
  await ctx.conversation.enter('commandCreateNotionPage');
});
bot.catch((err) => console.log(err));

export default bot;
