import { MessageTypes } from './core/symbols';
import { API_URL } from './core/consts';

async function onReportMessage(body: any, reporterKey: string) {
  const response = await fetch(`${API_URL}/report`, {
    method: 'post',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json', Authorization: reporterKey }
  });

  return response.status;
}

// handle messages arriving from the content script
browser.runtime.onMessage.addListener((message, _, respond) => {
  if (!message || !message.type) {
    return;
  }

  if (message.type === MessageTypes.REPORT) {
    // const { reporterKey, ...body } = message.body;
    const { body } = message;
    const reporterKey = 'Bots-R-us';
    return onReportMessage(body, reporterKey);
  }
});
