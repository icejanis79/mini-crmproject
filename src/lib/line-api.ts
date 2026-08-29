import * as line from '@line/bot-sdk';

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || '',
};

export const lineClient = new line.messagingApi.MessagingApiClient({
  channelAccessToken: config.channelAccessToken,
});

export async function sendLineMessage(userId: string, text: string) {
  try {
    await lineClient.pushMessage({
      to: userId,
      messages: [{ type: 'text', text }],
    });
    console.log('LINE message sent to', userId);
    return true;
  } catch (error) {
    console.error('Error sending LINE message:', error);
    return false;
  }
}
