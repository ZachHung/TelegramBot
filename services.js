import { bot } from "./app.js";
import { notion } from "./app.js";
class ChatService {
  sendMessage(req, res) {
    let message = `${req.body.page.properties["Tên (hoặc FB)"].title[0].text.content} đã đến hạn`;
    bot.telegram.sendMessage(process.env.CHAT_ID, message);
    res.status(200).json(message);
  }

  async createNotionPage(req, res) {
    try {
      let result = await notion.pages.create({
        parent: {
          database_id: process.env.NOTION_DATABASE_ID,
        },
        properties: {
          "Tên (hoặc FB)": {
            title: [
              {
                text: {
                  content: "Dummy Name",
                },
              },
            ],
          },

          Username: {
            rich_text: [
              {
                type: "text",
                text: {
                  content: "Dummy username",
                },
              },
            ],
          },

          Pass: {
            rich_text: [
              {
                text: {
                  content: "Dummy password",
                },
              },
            ],
          },

          Slot: {
            rich_text: [
              {
                text: {
                  content: "Dummy slot name",
                },
              },
            ],
          },

          Date: {
            date: {
              start: "2023-01-01",
            },
          },

          "Subcribe?": {
            select: {
              name: "3 tháng",
            },
          },
        },
      });
      res.send(result);
    } catch (err) {
      res.send(err);
    }
  }
}

export default new ChatService();
