import { bot } from './app.js';
import { CHAT_ID } from './config/env.js';
class ChatService {
  sendMessage(req, res) {
    let message = `${req.body.page.properties['Tên (hoặc FB)'].title[0].text.content} đã đến hạn`;
    console.log(req.body);
    bot.telegram.sendMessage(CHAT_ID, message);
    res.status(200).json(message);
  }
}

export default new ChatService();
