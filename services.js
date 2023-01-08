import { bot } from './app.js';
class ChatService {
  sendMessage(req, res) {
    let message = `${req.body.page.properties['Tên (hoặc FB)'].title[0].text.content} đã đến hạn`;
    bot.telegram.sendMessage(process.env.CHAT_ID, message);
    res.status(200).json(message);
  }
}

export default new ChatService();
