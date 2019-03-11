import { API_URL } from './consts';
import { Status, MessageTypes } from './symbols';

// TODO: move storage to indexdb?
export class ApiService {
  constructor(private _platform: string) {
    window.localStorage.botz = window.localStorage.botz || JSON.stringify({});
  }

  public async checkIfBot(userId: string | number) {
    const cachedValue = this._getFromCache(userId);
    console.log('_gotCache', userId, cachedValue);

    if (cachedValue) {
      console.log('returning cached data');
      return cachedValue;
    }
    console.log('fetching data for', userId);
    const botData = await this._callServer([userId as string]);
    console.log('_callServer', userId, botData);

    this._storeInCache(userId, botData);

    return botData;
  }

  public async report(body: any): Promise<boolean> {
    const responseStatus: number = await window.browser.runtime.sendMessage({
      type: MessageTypes.REPORT,
      body: { ...body, platform: this._platform }
    });

    if (responseStatus === 401) {
      throw new Error('מפתח מדווח חסר או שגוי');
    }

    this._storeInCache(body.userId, Status.REPORTED);
    return true;
  }

  private _getCache() {
    return JSON.parse(window.localStorage.botz);
  }

  private _storeInCache(userId: string | number, value: string) {
    const cache = this._getCache();
    cache[userId] = value;
    console.log('_storeInCache', userId, cache[userId]);

    window.localStorage.setItem('botz', JSON.stringify(cache));
  }

  private _getFromCache(userId: string | number): string | null {
    const cache = this._getCache();
    console.log('_getFromCache', userId, cache[userId]);
    if (userId in cache) {
      return cache[userId];
    }
  }

  private async _callServer(userIds: string[]): Promise<string> {
    const idsParam = 'userIds[]=' + userIds.join('&userIds[]=');
    console.log(API_URL + 'confirmed?' + idsParam + '&platform=' + this._platform);
    const response = await fetch(
      `${API_URL}/confirmed?${idsParam}&platform=${this._platform}`
    );

    return response.text();
  }
}
