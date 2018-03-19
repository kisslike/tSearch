const debug = require('debug')('cacheModel');
const {types, getParent} = require('mobx-state-tree');

/**
 * @typedef {{}} CacheM
 * Model:
 * @property {string} id
 * @property {string} state
 * @property {number} createTime
 * @property {*} data
 * Actions:
 * @property {function(string)} setState
 * @property {function(number)} setCreateTime
 * @property {function(*)} setData
 * Views:
 * @property {function:string} getKey
 * @property {function:boolean} isExpire
 * @property {function:Promise} update
 */

const cacheModel = types.model('cacheModel', {
  id: types.string,
  state: types.optional(types.string, 'idle'), // idle, loading, ready
  createTime: types.optional(types.number, 0),
  data: types.frozen,
}).actions(/**CacheM*/self => {
  return {
    setState(value) {
      self.state = value;
    },
    setCreateTime(value) {
      self.createTime = value;
    },
    setData(value) {
      self.data = value;
    },
  };
}).views(/**CacheM*/self => {
  return {
    getKey() {
      return `cache_${self.id}`;
    },
    isExpire() {
      return self.createTime + 24 * 60 * 60 * 60 < Date.now() / 1000;
    },
    update() {
      self.setState('loading');
      return getParent(self, 1).getItems().then(data => {
        self.setData(data);
      }, err => {
        debug('Update error', err);
      }).then(() => {
        self.setCreateTime(Math.trunc(Date.now() / 1000));
        self.setState('ready');
        return self.save();
      });
    },
    save() {
      const key = self.getKey();
      return new Promise(r => chrome.storage.local.set({
        [key]: {
          data: self.data,
          createTime: self.createTime
        }
      }, r));
    },
    afterCreate() {
      self.setState('loading');
      const key = self.getKey();
      return new Promise(r => chrome.storage.local.get(key, storage => r(storage[key]))).then(storage => {
        if (storage) {
          self.setData(storage.data);
          self.setCreateTime(storage.createTime);
        }
      }).then(() => {
        if (self.isExpire()) {
          return self.update();
        }
      }).then(() => {
        self.setState('ready');
      });
    },
  };
});

export default cacheModel;