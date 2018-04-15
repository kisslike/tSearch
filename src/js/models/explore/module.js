import exploreSectionWorkerModel from "./sectionWorker";
import cacheModel from "./cache";
import {types, destroy} from "mobx-state-tree";
import exploreModuleMetaModel from "./moduleMeta";

const debug = require('debug')('exploreModuleModel');

/**
 * @typedef {{}} ExploreModuleM
 * Model:
 * @property {string} id
 * @property {ExploreModuleMetaM} meta
 * @property {ExploreSectionInfoM} info
 * @property {string} code
 * @property {ExploreSectionWorkerM} worker
 * @property {CacheM} cache
 * Actions:
 * @property {function} createWorker
 * @property {function} destroyWorker
 * @property {function:CacheM} getCache
 * Views:
 * @property {function} getItems
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
  meta: exploreModuleMetaModel,
  info: types.model('exploreSectionInfo', {
    lastUpdate: types.optional(types.number, 0),
    disableAutoUpdate: types.optional(types.boolean, false),
  }),
  code: types.string,
  worker: types.maybe(exploreSectionWorkerModel),
  cache: types.maybe(cacheModel),
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
    getCache() {
      if (!self.cache) {
        self.cache = {
          id: self.id
        };
      }
      return self.cache;
    },
  };
}).views(/**ExploreModuleM*/self => {
  return {
    getItems() {
      if (!self.worker) {
        self.createWorker();
      }
      return self.worker.getItems().finally(() => {
        self.destroyWorker();
      });
    },
    sendCommand(command) {
      if (!self.worker) {
        self.createWorker();
      }
      return self.worker.sendCommand(command).finally(() => {
        self.destroyWorker();
      });
    }
  };
});

export default exploreModuleModel;