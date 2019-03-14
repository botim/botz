import { API_URL } from './consts';
import { Status, MessageTypes, ObjectKeyMap } from './symbols';
import { CacheService } from './cache-service';

// TODO: move storage to indexdb?
export class ApiService {
  private _cacheService = new CacheService();

  constructor(private _platform: string) {}

  // TODO: change to array
  public async checkIfBot(userIds: ObjectKeyMap<any>): Promise<ObjectKeyMap<Status>> {
    const cachedStatuses = await this._getFromCache(Object.keys(userIds));

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
  private _storeInCache(userStatuses: ObjectKeyMap<Status>) {
    for (const userId in userStatuses) {
      if (userStatuses.hasOwnProperty(userId)) {
        this._cacheService.set(userId, userStatuses[userId]);
      }
    }
  }

  private async _getFromCache(userIds: string[]): Promise<ObjectKeyMap<Status>> {
    const cachedUsers: ObjectKeyMap<Status> = {};

    for (const userId of userIds) {
      const cachedUser = await this._cacheService.get<Status>(userId);

      if (cachedUser) {
        cachedUsers[userId] = cachedUser;
      }
    }

    return cachedUsers;
  }

  private async _callServer(userIds: string[]): Promise<ObjectKeyMap<Status>> {
    const idsParam = 'userIds[]=' + userIds.join('&userIds[]=');
    const response = await fetch(`${API_URL}/check?${idsParam}&platform=${this._platform}`);

    return response.json();
  }
}
