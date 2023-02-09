import { Client } from '@notionhq/client';
import { NextFunction, Request, Response } from 'express';
import bot from './bot_telegram.js';
import moment from 'moment';
import * as dotenv from 'dotenv';
dotenv.config();
import { getEnv } from './helpers.js';
import { INotionPage, IUser } from './interface.js';

const notion = new Client({
  auth: getEnv('NOTION_TOKEN'),
});
class ChatService {
  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const message = `‼ ${req.body.page.properties.Customer_name.title[0].text.content} đã đến hạn ‼`;
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
          Customer_name: {
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
              start: moment(data.date, 'D/M/YY').format('YYYY-MM-DD'),
            },
          },

          Duration: {
            select: {
              name: `${data.duration} tháng`,
            },
          },
        },
      });
      return result;
    } catch (err) {
      throw new Error(err as string);
    }
  }

  async logAllUser(): Promise<IUser[]> {
    try {
      const response = await notion.databases.query({
        database_id: getEnv('NOTION_DATABASE_ID'),
      });
      let listAllUser = response.results.map((result) => {
        return {
          id: result.id,
          prop: (result as any).properties,
        };
      });

      let users = listAllUser.map((user): IUser => {
        return {
          name: user.prop.Customer_name.title[0].text.content || '',
          username: user.prop.Username.rich_text[0].text.content || '',
          password: user.prop.Pass.rich_text[0].text.content || '',
          date:
            moment(user.prop.Date.date.start, 'YYYY-MM-DD').format('D/M/YY') ||
            '',
          duration: user.prop.Duration.select?.name || '',
          slotName: user.prop.Slot.rich_text[0].text.content || '',
          id: user.id || '',
        };
      });
      return users;
    } catch (err) {
      throw new Error(err as string);
    }
  }

  async achriveNotionPage(id: string) {
    try {
      await notion.pages.update({
        page_id: id,
        archived: true,
      });
    } catch (err) {
      throw new Error(err as string);
    }
  }

  async updateNotionPage(id: string, property: string, data: string) {
    try {
      let a;
      switch (property) {
        case 'username':
          a = {
            Username: {
              rich_text: [
                {
                  type: 'text',
                  text: {
                    content: data,
                  },
                },
              ],
            },
          };
          break;
        case 'slotName':
          a = {
            Slot: {
              rich_text: [
                {
                  text: {
                    content: data,
                  },
                },
              ],
            },
          };
          break;
        case 'password':
          a = {
            Pass: {
              rich_text: [
                {
                  text: {
                    content: data,
                  },
                },
              ],
            },
          };
          break;
        case 'date':
          a = {
            Date: {
              date: {
                start: moment(data, 'D/M/YY').format('YYYY-MM-DD'),
              },
            },
          };
          break;
        case 'time':
          a = {
            'Subcribe?': {
              select: {
                name: data,
              },
            },
          };
          break;

        default:
          break;
      }
      await notion.pages.update({
        page_id: id,
        properties: a as any,
      });
    } catch (err) {
      throw new Error(err as string);
    }
  }
}

export default ChatService;
