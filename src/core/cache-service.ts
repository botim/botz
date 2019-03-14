import { Store, set, get, del } from 'idb-keyval';

import { CACHE_EXPIRE_MIN } from './consts';

export class CacheService {
  private _store = new Store('botim', 'statuses');

  /**
   * Store value in store, with last updated key.
   *
   * @param key Usually an id
   * @param value
   */
  public set(key: string, value: any): Promise<void> {
    const entry = { value, lastUpdated: new Date() };

    return set(key, entry, this._store);
  }

  /**
   * Retrieve key from store, if not expired.
   *
   * @param key
   */
  public async get<Type>(key: string): Promise<Type> {
    const entry: any = await get<any>(key, this._store);

    if (this._removeIfExpired(key, entry)) {
      return null;
    }

    return entry.value;
  }

  /**
   * Remove a key from the store.
   *
   * @param key
   */
  public remove(key: string): Promise<void> {
    return del(key, this._store);
  }

  /**
   * Check if key has expired and remove him.
   *
   * @param key
   * @param entry
   */
  private _removeIfExpired(key: string, entry: any): boolean {
    if (!entry || !(entry.lastUpdated instanceof Date)) {
      return true;
    }

    const elapsedTime = new Date().getTime() - entry.lastUpdated.getTime();
    const elapsedSeconds = Math.round(elapsedTime / 1000);

    if (elapsedSeconds > 60 * CACHE_EXPIRE_MIN) {
      this.remove(key);

      return true;
    }

    return false;
  }
}
