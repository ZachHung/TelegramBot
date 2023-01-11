import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import route from "./routes.js";
import { Client } from "@notionhq/client";
import { Bot, Keyboard, session } from "grammy";
import { conversations, createConversation } from "@grammyjs/conversations";

export const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});
// export const bot = new Telegraf(process.env.BOT_TOKEN);

const app = express();

export const bot = new Bot(process.env.BOT_TOKEN);

// app.use(cors());
// app.use(express.json({ limit: "1mb" }));
// // route(app);

// ==========================================

bot.use(session({ initial: () => ({}) }));
bot.use(conversations());

async function commandCreateNotionPage(conversation, ctx) {
  // await ctx.reply("Creating new notion page");
  // await ctx.reply("What is the user's Facebook name:");
  // const inputFacebook = await conversation.waitFor(":text");
  // await ctx.reply("What is the username:");
  // const inputUsername = await conversation.waitFor(":text");
  // await ctx.reply("What is the slot name:");
  // const inputSlotName = await conversation.waitFor(":text");
  // await ctx.reply("What is the password:");
  // const inputPassword = await conversation.waitFor(":text");
  // await ctx.reply("What is subscribe date:");
  // const inputDate = await conversation.waitFor(":text");
  const keyboard = new Keyboard()
    .text("1 tháng")
    .row()
    .text("2 tháng")
    .oneTime();
  await ctx.reply("How long is the subscription?", {
    reply_markup: keyboard,
  });
  const inputTime = await conversation.waitFor(":text");
  await ctx.reply(inputTime.msg.text);
  await ctx.reply("New account has been added!");
}

bot.use(createConversation(commandCreateNotionPage));
bot.command("new", async (ctx) => {
  // enter the function "greeting" you declared
  await ctx.conversation.enter("commandCreateNotionPage");
});

// ==========================================

if (process.env.NODE_ENV !== "development") {
  app.use(await bot.createWebhook({ domain: process.env.HOST }));
} else {
  bot.start();
  // Enable graceful stop
  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));
}
let port = process.env.PORT || 6969;
// app.listen(port, () => console.log("Listening on", port));
