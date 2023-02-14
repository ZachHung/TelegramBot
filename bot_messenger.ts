import * as dotenv from 'dotenv';
dotenv.config();
import { getEnv } from './helpers.js';
import {
  handleGetStarted,
  handleGetPassword,
  validateUser,
} from './services_messenger.js';

export const postWebhook = (req: any, res: any) => {
  let body = req.body;
  if (body.object === 'page') {
    body.entry.forEach(function (entry: any) {
      let webhook_event = entry.messaging[0];
      let sender_psid = webhook_event.sender.id;
      let format = /[0-9A-Za-z]+@[0-9A-Za-z]+\.[A-Za-z]+-[0-9]/;

      if (webhook_event.message?.text.match(format)) {

        validateUser(webhook_event.message.text, sender_psid);
      } else if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);
      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback);
      }
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
};

export const getWebhook = (req: any, res: any) => {
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === getEnv('VERIFY_TOKEN')) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
};

const handleMessage = (sender_psid: any, received_message: any) => {
  let response;

  if (received_message.text) {
    response = {
      text: `You sent the message: "${received_message.text}". Now send me an attachment!`,
    };
  } else if (received_message.attachments) {
    response = { text: 'hi' };
  }
  callSendAPI(sender_psid, response);
};

async function handlePostback(sender_psid: any, received_postback: any) {
  let response;
  let payload = received_postback.payload;
  switch (payload) {
    case 'yes':
      response = { text: 'Thanks!' };
      break;
    case 'no':
      response = { text: 'Oops, try sending another image.' };
      break;
    case 'GET_STARTED':
      await handleGetStarted(sender_psid);
      break;
    case 'GET_PASSWORD':

      await handleGetPassword(sender_psid);
      break;
    case 'GET_INFO':
      await handleGetInfo(sender_psid);

      break;

    default:
      break;
  }
}

export async function callSendAPI(sender_psid: any, response: any) {
  let request_body = {
    recipient: {
      id: sender_psid,
    },
    message: response,
  };

  await fetch(
    `https://graph.facebook.com/${getEnv('LATEST_API_VERSION')}/${getEnv(
      'PAGE_ID',
    )}/messages?` +
      new URLSearchParams({
        recipient: `{'id':'${sender_psid}'}`,
        messaging_type: 'RESPONSE',
        message: JSON.stringify(response),
        access_token: getEnv('PAGE_ACCESS_TOKEN'),
      }),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request_body),
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
