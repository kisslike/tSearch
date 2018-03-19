const debug = require('debug')('cacheModel');
const {types, getParent} = require('mobx-state-tree');

/**
 * @typedef {{}} CacheM
 * Model:
 * @property {string} id
 * @property {string} state
 * @property {number} expire
 * @property {*} data
 * Actions:
 * @property {function(string)} setState
 * @property {function(number)} setExpire
 * @property {function(*)} setData
 * Views:
 * @property {function:boolean} isExpire
 * @property {function:Promise} update
 */

const cacheModel = types.model('cacheModel', {
  id: types.string,
  state: types.optional(types.string, 'idle'), // idle, loading, ready
  expire: types.optional(types.number, 0),
  data: types.frozen,
}).actions(/**CacheM*/self => {
  return {
    setState(value) {
      self.state = value;
    },
    setExpire(value) {
      self.expire = value;
    },
    setData(value) {
      self.data = value;
    },
  };
}).views(/**CacheM*/self => {
  return {
    isExpire() {
      return self.expire < Date.now() / 1000;
    },
    update() {
      self.setState('loading');
      return getParent(self, 1).getItems().then(data => {
        self.setData(data);
      }, err => {
        debug('Update error', err);
      }).then(() => {
        self.setExpire(Math.trunc(Date.now() / 1000));
        self.setState('ready');
      });
    },
    afterCreate() {
      self.setState('loading');
      const key = `cache_${self.id}`;
      return new Promise(r => chrome.storage.local.get(key, storage => r(storage[key]))).then(storage => {
        if (storage) {
          self.setExpire(storage.expire);
          self.setData(storage.data);
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