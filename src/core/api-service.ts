import { Status } from './symbols';

const apiUrl = 'https://reqres.in/api/user/1';

// TODO: move storage to indexdb?
export class ApiService {
  constructor() {
    window.localStorage.botz = window.localStorage.botz || JSON.stringify({});
  }

  public async checkIfBot(userId: string | number) {
    const cachedValue = this._getFromCache(userId);

    if (cachedValue) {
      return cachedValue;
    }

    const isBot = await this._callServer(userId as string);
    const status = isBot ? Status.BOT : Status.NOT_BOT;
    this._storeInCache(userId, status);

    return status;
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

    window.localStorage.setItem('botz', JSON.stringify(cache));
  }

  private _getFromCache(userId: string | number): string | null {
    const cache = this._getCache();

    if (userId in cache) {
      return cache[userId];
    }
  }

  private async _callServer(userId: string): Promise<boolean> {
    // todo: use the actual response
    // const response = await fetch(apiUrl);

    // return true;
    return userId.search(/^[sreby]/i) >= 0;
  }
}
