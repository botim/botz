import { API_URL } from './consts';
import { Status, MessageTypes, ObjectKeyMap } from './symbols';

// TODO: move storage to indexdb?
export class ApiService {
  constructor(private _platform: string) {
    window.localStorage.botz = window.localStorage.botz || JSON.stringify({});
  }

  public async checkIfBot(userIds: ObjectKeyMap<any>): Promise<ObjectKeyMap<Status>> {
    const cachedStatuses = this._getFromCache(Object.keys(userIds));

    for (const cachedUserId of Object.keys(cachedStatuses)) {
      delete userIds[cachedUserId];
    }

    if (!Object.keys(userIds).length) {
      return cachedStatuses;
    }

    const statuses = await this._callServer(Object.keys(userIds));

    this._storeInCache(statuses);

    return { ...statuses, ...cachedStatuses };
  }

  public async report(body: any): Promise<boolean> {
    const responseStatus: number = await window.browser.runtime.sendMessage({
      type: MessageTypes.REPORT,
      body: { ...body, platform: this._platform }
    });

    if (responseStatus === 401) {
      throw new Error('מפתח מדווח חסר או שגוי');
    }

    this._storeInCache({ [body.userId]: Status.REPORTED });
    return true;
  }

  private _getCache() {
    return JSON.parse(window.localStorage.botz);
  }

  private _storeInCache(values: ObjectKeyMap) {
    const cache = this._getCache();

    const newCache = { ...cache, ...values };

    window.localStorage.setItem('botz', JSON.stringify(newCache));
  }

  private _getFromCache(userIds: string[]): ObjectKeyMap<Status> {
    const cache = this._getCache();
    const cachedUserIds: ObjectKeyMap<Status> = {};

    for (const userId of userIds) {
      if (userId in cache) {
        cachedUserIds[userId] = cache[userId];
      }
    }

    return cachedUserIds;
  }

  private async _callServer(userIds: string[]): Promise<ObjectKeyMap<Status>> {
    const idsParam = 'userIds[]=' + userIds.join('&userIds[]=');
    const response = await window.fetch(
      `${API_URL}/confirmed?${idsParam}&platform=${this._platform}`
    );

    return response.json();
  }
}
