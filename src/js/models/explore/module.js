import exploreSectionWorkerModel from "./sectionWorker";
import {types, destroy} from "mobx-state-tree";
import exploreModuleMetaModel from "./moduleMeta";
import sectionItemMode from "./sectionItem";
import Cache from "../../tools/cache";

const debug = require('debug')('exploreModuleModel');

/**
 * @typedef {{}} ExploreModuleM
 * Model:
 * @property {string} id
 * @property {ExploreModuleMetaM} meta
 * @property {ExploreSectionInfoM} info
 * @property {string} code
 * @property {ExploreSectionWorkerM} worker
 * @property {ExploreSectionItemM[]} items
 * Actions:
 * @property {function} createWorker
 * @property {function} destroyWorker
 * @property {function(string)} setState
 * @property {function(ExploreSectionItemM[])} setItems
 * Views:
 * @property {function(ExploreSectionItemM[]):Promise} saveItems
 * @property {function:ExploreSectionItemM[]} getItems
 * @property {function} loadItems
 * @property {function(string)} sendCommand
 */

/**
 * @typedef {{}} ExploreSectionInfoM
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
  info: types.model('exploreSectionInfo', {
    lastUpdate: types.optional(types.number, 0),
    disableAutoUpdate: types.optional(types.boolean, false),
  }),
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
    }
  };
}).views(/**ExploreModuleM*/self => {
  let cache = new Cache(self.id);

  return {
    saveItems(items) {
      return cache.setData(items);
    },
    getItems() {
      if (!cache.isLoaded()) {
        self.loadItems();
      }
      return self.items;
    },
    loadItems() {
      self.setState('loading');

      return Promise.resolve().then(() => {
        return cache.getData();
      }).then(cacheData => {
        if (cache.isExpire(cacheData)) {
          if (!self.worker) {
            self.createWorker();
          }
          return self.worker.getItems().finally(() => {
            self.destroyWorker();
          }).then(response => {
            const {items} = response;
            return self.saveItems(items);
          });
        } else {
          return cacheData;
        }
      }).then(cacheData => {
        self.setItems(cacheData.data);
        self.setState('ready');
      }).catch(err => {
        debug('loadItems error', err);
        self.setState('error');
      });
    },
    sendCommand(command) {
      if (!self.worker) {
        self.createWorker();
      }
      return self.worker.sendCommand(command).finally(() => {
        self.destroyWorker();
      }).then(async result => {
        debug('Command result', command, result);
        const {items} = result;
        if (items) {
          await self.saveItems(items);
          self.setItems(items);
        }
      }).catch(err => {
        debug('sendCommand error', command, err);
      });
    }
  };
});

export default exploreModuleModel;