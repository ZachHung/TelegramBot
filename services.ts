import { Client } from '@notionhq/client';
import { NextFunction, Request, Response } from 'express';
import bot from './bot.js';
import { getEnv } from './helpers.js';
import { INotionPage } from './interface.js';

const notion = new Client({
  auth: getEnv('NOTION_TOKEN'),
});
class ChatService {
  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const message = `‼ ${req.body.page.properties['Tên (hoặc FB)'].title[0].text.content} đã đến hạn ‼`;
      await bot.api.sendMessage(getEnv('CHAT_ID'), message);
      res.status(200).json(message);
    } catch (error) {
      next(error);
    }
  }

  async createNotionPage(data: INotionPage) {
    try {
      const result = await notion.pages.create({
        parent: {
          database_id: getEnv('NOTION_DATABASE_ID'),
        },
        properties: {
          'Tên (hoặc FB)': {
            title: [
              {
                text: {
                  content: data.name,
                },
              },
            ],
          },

          Username: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: data.username,
                },
              },
            ],
          },

          Pass: {
            rich_text: [
              {
                text: {
                  content: data.password,
                },
              },
            ],
          },

          Slot: {
            rich_text: [
              {
                text: {
                  content: data.slotName,
                },
              },
            ],
          },

          Date: {
            date: {
              start: data.date,
            },
          },

          'Subcribe?': {
            select: {
              name: data.time,
            },
          },
        },
      });
      return result;
    } catch (err) {
      throw new Error(err as string);
    }
  }

  async logAllUser(): Promise<any[]> {
    try {
      const message = `hello`;
      const response = await notion.databases.query({
        database_id: getEnv('NOTION_DATABASE_ID'),
      });
      const listAllUser = response.results.map(
        (result) => (result as any).properties,
      );

      return listAllUser;

      // status(200).json(message);
    } catch (err) {
      throw new Error(err as string);
    }
  }
}

export default new ChatService();
