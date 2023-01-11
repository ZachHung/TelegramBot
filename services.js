import { Client } from '@notionhq/client';
import bot from './bot.js';

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});
class ChatService {
  sendMessage(req, res) {
    let message = `‼ ${req.body.page.properties['Tên (hoặc FB)'].title[0].text.content} đã đến hạn ‼`;
    bot.api.sendMessage(process.env.CHAT_ID, message);
    res.status(200).json(message);
  }

  async createNotionPage(data) {
    try {
      let result = await notion.pages.create({
        parent: {
          database_id: process.env.NOTION_DATABASE_ID,
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
      throw Error(err);
    }
  }
}

export default new ChatService();
