import {
  Bot,
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
import moment from 'moment';
import { getEnv } from './helpers.js';
import ChatService from './services_telegram.js';
import { INotionPage, SessionData } from './interface.js';
dotenv.config();

const chatService = new ChatService();
let testID: string;
let testProp: string;
const bot = new Bot<MyContext>(getEnv('BOT_TOKEN'));

let userList = await chatService.logAllUser();

type MyContext = Context & ConversationFlavor & SessionFlavor<SessionData>;
type MyConversation = Conversation<MyContext>;

bot.use(
  session({
    initial(): SessionData {
      return { favoriteIds: [] };
    },
  }),
);

bot.use(conversations());

// ============================CONVERSATION==============================
async function commandCreateNotionPage(
  conversation: MyConversation,
  ctx: MyContext,
) {
  const questions = [
    "What is the user's Facebook name:",
    'What is the username:',
    'What is the slot name:',
    'What is the password:',
    'What is subscribe date (D/M/YY):',
    'How long is the subscription?',
  ];
  const answers = {
    name: '',
    username: '',
    slotName: '',
    password: '',
    date: '',
    duration: '',
  };
  await ctx.reply('Creating new notion page');

  for (let index = 0; index < questions.length; ++index) {
    await ctx.reply(questions[index]);
    const answer = await conversation.waitFor(':text');
    answers[Object.keys(answers)[index] as keyof typeof answers] =
      answer.msg.text;

    while (
      !moment(answers.date, 'D/M/YY', true).isValid() &&
      answers.date !== ''
    ) {
      await ctx.reply(`⁉ Invalid date format ⁉\n${questions[index]}`);
      const answer = await conversation.waitFor(':text');
      answers[Object.keys(answers)[index] as keyof typeof answers] = moment(
        answer.msg.text,
        'D/M/YY',
      ).format('D/M/YY');
    }
  }

  await chatService.createNotionPage({
    ...answers,
  });

  await ctx.reply('🎉 New account has been added! 🎉');
}

async function editNotionPage(conversation: MyConversation, ctx: MyContext) {
  await ctx.reply(`Enter your new ${testProp}?`);
  let message = await conversation.waitFor(':text');
  let answer = message.msg.text;
  while (
    !moment(answer, 'D/M/YY', true).isValid() &&
    answer !== '' &&
    testProp === 'date'
  ) {
    await ctx.reply(`⁉ Invalid date format ⁉\nTry again:`);
    message = await conversation.waitFor(':text');
    answer = moment(message.msg.text, 'D/M/YY').format('D/M/YY');
    console.log(answer);
  }
  await chatService.updateNotionPage(testID, testProp, answer);
  await ctx.reply(`New ${testProp} updated!`);
}

// ==========================================================

bot.use(createConversation(commandCreateNotionPage));
bot.use(createConversation(editNotionPage));

const mainText = 'Choose one user to inspect';
const mainMenu = new Menu<MyContext>('user-list');
mainMenu.dynamic(async () => {
  const range = new MenuRange<MyContext>();
  userList = await chatService.logAllUser();
  for (const [index, user] of userList.entries()) {
    if (index % 5 == 0) range.row();

    range.submenu(
      {
        text: user.name,
        payload: index + '',
      }, // label and payload
      'user', // navigation target menu
      (ctx) =>
        ctx.editMessageText(userText(user.name), {
          parse_mode: 'HTML',
        }), // handler
    );
  }
  return range;
});

// Create the sub-menu that is used for rendering useres
const userText = (user: string) => `____ <b>${user}</b>____`;
const userMenu = new Menu<MyContext>('user');
userMenu.dynamic((ctx) => {
  const user = ctx.match;
  if (typeof user !== 'string') throw new Error('No user chosen!');
  return createUserMenu(user);
});
/* Creates a menu that can render any given user */
async function createUserMenu(user: string) {
  const range = new MenuRange<MyContext>();
  userList = await chatService.logAllUser();
  let filteredList = userList.map(({ id, name, ...other }) => other);
  for (const property in filteredList[+user]) {
    range
      .text(
        {
          text: filteredList[+user][
            property as keyof Omit<INotionPage, 'name' | 'id'>
          ],
          payload: user,
        },
        async (ctx) => {
          testID = userList[+user].id;
          testProp = property;
          await ctx.conversation.enter('edit');
          ctx.menu.update();
        },
      )
      .row();
  }

  range
    .back({ text: 'X Delete', payload: user }, async (ctx) => {
      chatService.achriveNotionPage(userList[+user].id);
      userList.splice(+user, 1);
      await ctx.editMessageText('Choose one user to inspect:');
    })
    .row()
    .back({ text: 'Back', payload: user }, async (ctx) => {
      await ctx.editMessageText('Choose one user to inspect:');
    });
  return range;
}

mainMenu.register(userMenu);

bot.use(mainMenu);
bot.command('log', (ctx) => ctx.reply(mainText, { reply_markup: mainMenu }));
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
