const apiUrl = 'https://reqres.in/api/user/1';

export class ApiService {
  constructor() {
    window.localStorage.botz = window.localStorage.botz || JSON.stringify({});
  }

  public async checkIfBot(userId: string | number) {
    const cachedValue = this._getFromCache(userId);

    if (cachedValue) {
      return cachedValue;
    }

    var isBot = await this._callServer(userId as string);
    this._storeInCache(userId, isBot);

    return isBot;
  }

  private _getCache() {
    return JSON.parse(window.localStorage.botz);
  }

  private _storeInCache(userId: string | number, isBot: boolean) {
    const cache = this._getCache();
    cache[userId] = isBot;

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
    const response = await fetch(apiUrl);

    // return true;
    return userId.search(/^[srneby]/i) >= 0;
  }
}
