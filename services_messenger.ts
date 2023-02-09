import * as dotenv from 'dotenv';
import { response } from 'express';
dotenv.config();
import { getEnv } from './helpers.js';
import { callSendAPI } from './bot_messenger.js';
import ChatService from './services_telegram.js';
import { writeFileSync } from 'fs';
const chatService = new ChatService();

export async function handleGetStarted(sender_psid: any) {
  return new Promise(async (resolve: any, reject: any) => {
    try {
      // let username = getUserName(sender_psid);
      let response = {
        text: `'Đây là một con bot được xây dựng để hỗ trợ TTL trong việc buôn bán netflix.\n Hướng dẫn sử dụng: '`,
      };
      await callSendAPI(sender_psid, response);
      await callSendAPI(sender_psid, await sendGetStartedTemplate());

      resolve('done');
    } catch (e) {
      reject(e);
    }
  });
}

async function sendGetStartedTemplate() {
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

export async function handleGetPassword(sender_psid: any) {
  // validateUser(sender_psid);
}
async function handleGetInfo() {}
export async function validateUser(message: any, sender_psid: any) {
  callSendAPI(sender_psid, {
    text: 'Validating.',
  });
  message = message.split('-');
  console.log(message);
  const usersList = await chatService.logAllUser();
  let user = usersList.find((user) => user.username === message[0]);
  if (user?.password === message[1]) {
    console.log(user);
  }
}
