import {
  Bot,
  Keyboard,
  Context,
  session,
  GrammyError,
  HttpError,
  SessionFlavor,
} from 'grammy';
import {
  conversations,
  createConversation,
  type Conversation,
  type ConversationFlavor,
} from '@grammyjs/conversations';
import { Menu, MenuRange } from '@grammyjs/menu';
import * as dotenv from 'dotenv';
import ChatService from './services.js';
import moment from 'moment';
import { getEnv } from './helpers.js';
import { Console } from 'console';
import fs from 'fs';
import { a } from './test-sync.js';

// Typing for bot
type MyContext = Context & ConversationFlavor & SessionFlavor<SessionData>;

type MyConversation = Conversation<MyContext>;

dotenv.config();

const bot = new Bot<MyContext>(getEnv('BOT_TOKEN'));
bot.use(
  session({
    initial(): SessionData {
      return { favoriteIds: [] };
    },
  }),
);

bot.use(conversations());

async function commandCreateNotionPage(
  conversation: MyConversation,
  ctx: MyContext,
) {
  const questions = [
    "What is the user's Facebook name:",
    'What is the username:',
    'What is the slot name:',
    'What is the password:',
    'What is subscribe date (YYYY-MM-DD):',
  ];
  const answers = {
    name: '',
    username: '',
    slotName: '',
    password: '',
    date: '',
  };
  await ctx.reply('Creating new notion page');

  for (let index = 0; index < questions.length; ++index) {
    await ctx.reply(questions[index]);
    const answer = await conversation.waitFor(':text');
    answers[Object.keys(answers)[index] as keyof typeof answers] =
      answer.msg.text;

    while (
      !moment(answers.date, 'YYYY-MM-DD', true).isValid() &&
      answers.date !== ''
    ) {
      await ctx.reply(`⁉ Invalid date format ⁉\n${questions[index]}`);
      const answer = await conversation.waitFor(':text');
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
  const time = await conversation.waitFor(':text');

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

interface SessionData {
  favoriteIds: string[];
}

const mainText = 'Choose one user to inspect';
const mainMenu = new Menu<MyContext>('food');
mainMenu.dynamic(async () => {
  fs.writeFileSync('./test-sync', JSON.stringify(a));
  const range = new MenuRange<MyContext>();
  for (const [index, dish] of a.entries()) {
    if (index % 5 == 0) range.row();

    range.submenu(
      {
        text: dish['Tên (hoặc FB)'].title[0].text.content,
        payload: index + '',
      }, // label and payload
      'dish', // navigation target menu
      (ctx) =>
        ctx.editMessageText(
          dishText(dish['Tên (hoặc FB)'].title[0].text.content),
          {
            parse_mode: 'HTML',
          },
        ), // handler
    );
  }
  return range;
});

// Create the sub-menu that is used for rendering dishes
const dishText = (dish: string) => `<b>${dish}</b>\n\nYour rating:`;
const dishMenu = new Menu<MyContext>('dish');
dishMenu.dynamic((ctx) => {
  const dish = ctx.match;
  if (typeof dish !== 'string') throw new Error('No dish chosen!');
  return createDishMenu(dish);
});
/** Creates a menu that can render any given dish */
async function createDishMenu(dish: string) {
  console.log(a.length);
  return new MenuRange<MyContext>()
    .text(
      {
        text: (ctx) =>
          ctx.session.favoriteIds.includes(dish) ? 'Yummy!' : 'Meh.',
        payload: dish,
      },
      (ctx) => {
        const set = new Set(ctx.session.favoriteIds);
        if (!set.delete(dish)) set.add(dish);
        ctx.session.favoriteIds = Array.from(set.values());
        ctx.menu.update();
      },
    )
    .row()
    .back({ text: 'X Delete', payload: dish }, async (ctx) => {
      console.log(dish);
      a.splice(+dish, 1);
      console.log(a.length);
      await ctx.editMessageText('Choose one user to inspect');
    })
    .row()
    .back({ text: 'Back', payload: dish }, async (ctx) => {
      await ctx.editMessageText('Choose one user to inspect');
    });
}

mainMenu.register(dishMenu);

bot.use(mainMenu);

bot.command('start', (ctx) => ctx.reply(mainText, { reply_markup: mainMenu }));
bot.command('help', async (ctx) => {
  const text =
    'Send /start to see and rate dishes. Send /fav to list your favorites!';
  await ctx.reply(text);
});

bot.catch(console.error.bind(console));
// bot.start();
export default bot;
