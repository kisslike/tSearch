import promisifyApi from "./promisifyApi";

/**
 * @typedef {{}} CacheObject
 * @property {number} [insertTime]
 * @property {any} data
 */

class Cache {
  constructor(id) {
    this.id = id;
    this._cache = null;
  }

  /**
   * @return {string}
   * @private
   */
  getKey() {
    return `cache_${this.id}`;
  }

  /**
   * @return {Promise<CacheObject>}
   * @private
   */
  loadCache() {
    return promisifyApi(chrome.storage.local.get)({
      [this.getKey()]: {
        insertTime: 0
      }
    }).then(storage => this._cache = storage[this.getKey()]);
  }

  /**
   * @return {boolean}
   */
  isLoaded() {
    return !!this._cache;
  }

  /**
   * @param {CacheObject} cacheData
   * @return {boolean}
   */
  isExpire(cacheData) {
    return cacheData.insertTime + 24 * 60 * 60 * 60 < Date.now() / 1000;
  }

  /**
   * @return {Promise<CacheObject>}
   */
  async getData() {
    if (!this._cache) {
      this._cache = await this.loadCache();
    }
    return this._cache;
  }

  /**
   * @param {any} data
   * @return {Promise<CacheObject>}
   */
  setData(data) {
    return promisifyApi(chrome.storage.local.set)({
      [this.getKey()]: this._cache = {
        data: data,
        insertTime: Math.trunc(Date.now() / 1000),
      }
    }).then(() => this._cache);
  }
}

export default Cache;