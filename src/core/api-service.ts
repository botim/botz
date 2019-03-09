import { Status } from './symbols';

const apiUrl = 'http://localhost:8080/bots/';

// TODO: move storage to indexdb?
export class ApiService {
  constructor() {
    window.localStorage.botz = window.localStorage.botz || JSON.stringify({});
  }

  public async checkIfBot(userId: string | number, network: string) {
    const cachedValue = this._getFromCache(userId);
    console.log('_gotCache', userId, cachedValue);

    if (cachedValue) {
      console.log('returning cached data');
      return cachedValue;
    }
    console.log('fetching data for', userId);
    const botData = await this._callServer([userId as string], network);
    console.log('_callServer', userId, botData);
    //const status = isBot ? Status.BOT : Status.NOT_BOT;
    this._storeInCache(userId, botData);

    return botData;
  }

  public async report(body: any): Promise<boolean> {
    // TODO: send to server
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

  private async _callServer(userIds: string[], network: string): Promise<string> {
    const idsParam = 'userIds[]=' + userIds.join('&userIds[]=');
    console.log(apiUrl + 'confirmed?' + idsParam + '&platform=' + network);
    const response = await fetch(apiUrl + 'confirmed?' + idsParam + '&platform=' + network);

    return response.text();
  }
}
