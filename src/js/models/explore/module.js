import exploreSectionWorkerModel from "./sectionWorker";
import {types, destroy, getSnapshot} from "mobx-state-tree";
import exploreModuleMetaModel from "./moduleMeta";
import sectionItemMode from "./sectionItem";
import Cache from "../../tools/cache";

const debug = require('debug')('exploreModuleModel');

/**
 * @typedef {{}} ExploreModuleM
 * Model:
 * @property {string} id
 * @property {ExploreModuleMetaM} meta
 * @property {ExploreModuleInfoM} info
 * @property {{url: string}} [authRequired]
 * @property {string} code
 * @property {ExploreSectionWorkerM} worker
 * @property {ExploreSectionItemM[]} items
 * Actions:
 * @property {function} createWorker
 * @property {function} destroyWorker
 * @property {function(string)} setState
 * @property {function(ExploreSectionItemM[])} setItems
 * @property {function({url:string}|null)} setAuthRequired
 * Views:
 * @property {function:Cache} getCache
 * @property {function:Promise} saveItems
 * @property {function:ExploreSectionItemM[]} getItems
 * @property {function} loadItems
 * @property {function(string)} sendCommand
 */

/**
 * @typedef {{}} ExploreModuleInfoM
 * Model:
 * @property {number} lastUpdate
 * @property {boolean} disableAutoUpdate
 * Actions:
 * Views:
 */

const exploreModuleModel = types.model('exploreModuleModel', {
  id: types.identifier(types.string),
  state: types.optional(types.string, 'idle'), // idle, loading, ready, error
  meta: exploreModuleMetaModel,
  info: types.model('exploreModuleInfo', {
    lastUpdate: types.optional(types.number, 0),
    disableAutoUpdate: types.optional(types.boolean, false),
  }),
  authRequired: types.maybe(types.model({
    url: types.string
  })),
  code: types.string,
  worker: types.maybe(exploreSectionWorkerModel),
  items: types.optional(types.array(sectionItemMode), []),
}).actions(/**ExploreModuleM*/self => {
  return {
    createWorker() {
      if (!self.worker) {
        self.worker = {};
      }
    },
    destroyWorker() {
      if (self.worker) {
        destroy(self.worker);
      }
    },
    setState(value) {
      self.state = value;
    },
    setItems(items) {
      self.items = items;
    },
    setAuthRequired(value) {
      self.authRequired = value;
    },
  };
}).views(/**ExploreModuleM*/self => {
  const cache = new Cache(self.id);

  return {
    getCache() {
      return cache;
    },
    saveItems() {
      return cache.setData(getSnapshot(self.items));
    },
    getItems() {
      if (!cache.isLoaded()) {
        self.loadItems();
      }
      return self.items;
    },
    loadItems() {
      self.setState('loading');
      self.setAuthRequired(null);

      return Promise.resolve().then(() => {
        return cache.getData([]);
      }).then(cacheData => {
        if (!cache.isExpire(cacheData)) {
          self.setItems(cacheData.data);
        } else {
          self.createWorker();
          return self.worker.getItems().finally(() => {
            self.destroyWorker();
          }).then(async response => {
            const {items} = response;
            if (items) {
              self.setItems(items);
              await self.saveItems();
            }
          });
        }
      }).then(() => {
        self.setState('ready');
      }).catch(err => {
        debug('loadItems error', err);
        if (err.message === 'AUTH') {
          self.setAuthRequired({url: err.url});
        }
        self.setState('error');
      });
    },
    sendCommand(command) {
      self.setAuthRequired(null);

      self.createWorker();
      return self.worker.sendCommand(command).finally(() => {
        self.destroyWorker();
      }).then(async result => {
        debug('Command result', command, result);
        const {items} = result;
        if (items) {
          self.setItems(items);
          await self.saveItems();
        }
      }).catch(err => {
        debug('sendCommand error', command, err);
        if (err.message === 'AUTH') {
          self.setAuthRequired({url: err.url});
        }
      });
    },
    postProcessSnapshot(snapshot) {
      snapshot.state = undefined;
      snapshot.authRequired = undefined;
      snapshot.worker = undefined;
      snapshot.items = undefined;
      return snapshot;
    },
  };
});

export default exploreModuleModel;