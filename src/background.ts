import { MessageTypes } from './core/symbols';
import { API_URL } from './core/consts';

async function onReportMessage(body: any) {
  const response = await fetch(`${API_URL}/suspected`, {
    method: 'post',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }
  });

  return response.status;
}

// handle messages arriving from the content script
browser.runtime.onMessage.addListener((message, _, respond) => {
  if (!message || !message.type) {
    return;
  }

  if (message.type === MessageTypes.REPORT) {
    return onReportMessage(message.body);
  }
});
