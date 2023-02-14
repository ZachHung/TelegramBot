import * as dotenv from 'dotenv';
import { getEnv } from './helpers.js';
import { callSendAPI } from './bot_messenger.js';
import ChatService from './services_telegram.js';
const chatService = new ChatService();
dotenv.config();

export async function handleGetStarted(sender_psid: any) {
  return new Promise(async (resolve: any, reject: any) => {
    try {
      // let username = getUserName(sender_psid);
      let response = {
        text: `'Đây là một con bot được xây dựng để hỗ trợ TTL trong việc buôn bán netflix.\n Hướng dẫn sử dụng: '`,
      };
      await callSendAPI(sender_psid, response);
      await callSendAPI(sender_psid, await sendMenu());


      resolve('done');
    } catch (e) {
      reject(e);
    }
  });
}

async function sendMenu() {

  let response = {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'generic',
        elements: [
          {
            title: 'BOT RĂM',
            subtitle: 'Vui lòng chọn dịch vụ',
            image_url: '',
            buttons: [
              {
                type: 'postback',
                title: 'Xác nhận user',
                payload: 'VALIDATE_USER',
              },
              {
                type: 'postback',

                title: 'Lấy mật khẩu',
                payload: 'GET_PASSWORD',
              },
              {
                type: 'postback',
                title: 'Xem thông tin tài khoản',
                payload: 'GET_INFO',
              },
            ],
          },
        ],
      },
    },
  };
  return response;
}

export async function getUserName(sender_psid: any) {
  await fetch(
    `https://graph.facebook.com/${sender_psid}?` +
      new URLSearchParams({
        fields: 'firstname,lastname',
        access_token: getEnv('PAGE_ACCESS_TOKEN'),
      }),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
    .then((response) => response.json())
    .then((result) => {
      console.log('Success:', result);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}
let user: any = {
  name: 'abc',
  username: 'a@b.c',
  password: '123456',
  date: '10/2/23',
  duration: '3 tháng',
  slotName: 'Long',
  id: '30fd42d2-8243-491b-b68f-6b75fac4ad38',
};
let credentials: any;
export async function handleGetPassword(sender_psid: any) {
  callSendAPI(sender_psid, { text: `Mật khẩu của bạn là ${user.password}.` });
}
export async function handleGetInfo(sender_psid: any) {}
export async function validateUser(combo: any, sender_psid: any) {
  callSendAPI(sender_psid, {
    text: 'Validating...',
  });
  credentials = combo.split('-');

  console.log(combo);

  const usersList = await chatService.logAllUser();
  if (
    usersList.find((user) => user.username === combo[0])?.password === combo[1]
  ) {
    user = usersList.find((user) => user.username === combo[0]);
    await callSendAPI(sender_psid, {
      text: 'Welcome',
    });
    callSendAPI(sender_psid, await sendMenu());
  } else
    await callSendAPI(sender_psid, {
      text: 'Invalid credentials. Check again.',
    });
  console.log(user);

}
