import exploreSectionWorkerModel from "./sectionWorker";
import processLocale from "../../tools/processLocale";
import getLocale from "../../tools/getLocale";
import cacheModel from "./cache";

const debug = require('debug')('exploreSectionModel');
const {types, destroy, getParent} = require('mobx-state-tree');

/**
 * @typedef {{}} ExploreSectionM
 * Model:
 * @property {string} id
 * @property {ExploreSectionMetaM} meta
 * @property {ExploreSectionInfoM} info
 * @property {string} code
 * @property {ExploreSectionWorkerM} worker
 * @property {CacheM} cache
 * @property {number} lines
 * @property {number} width
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

/**
 * @typedef {{}} ExploreSectionMetaM
 * Model:
 * @property {string} name
 * @property {string} version
 * @property {string} [author]
 * @property {string} [description]
 * @property {string} [homepageURL]
 * @property {string} [icon]
 * @property {string} [icon64]
 * @property {string} [siteURL]
 * @property {string} [updateURL]
 * @property {string} [downloadURL]
 * @property {string} [supportURL]
 * @property {string[]} require
 * @property {string[]} connect
 * @property {ExploreSectionMetaActionM[]} actions
 * @property {Object<string,Object<string,string>>} locales
 * @property {string} defaultLocale
 * @property {Object<string,string>} locale
 * Actions:
 * Views:
 * @property {function:string} getName
 */

/**
 * @typedef {{}} ExploreSectionMetaActionM
 * Model:
 * @property {string} icon
 * @property {string} title
 * @property {*} command
 * @property {boolean} isLoading
 * Actions:
 * @property {function(boolean)} setLoading
 * Views:
 * @property {function:string} getTitle
 * @property {function} handleClick
 */

const exploreSectionMetaActionModel = types.model('exploreSectionMetaActionModel', {
  icon: types.string,
  title: types.string,
  command: types.frozen,
  isLoading: types.boolean,
}).preProcessSnapshot(snapshot => {
  snapshot.isLoading = false;
  return snapshot;
}).actions(/**ExploreSectionMetaActionM*/self => {
  return {
    setLoading(state) {
      self.isLoading = state;
    },
  };
}).views(/**ExploreSectionMetaActionM*/self => {
  return {
    getTitle() {
      /**@type {ExploreSectionMetaM}*/
      const sectionMeta = getParent(self, 2);
      return processLocale(self.title, sectionMeta.locale);
    },
    handleClick(e) {
      e.preventDefault();

      if (!self.isLoading) {
        self.setLoading(true);
        /**@type {ExploreSectionM}*/
        const section = getParent(self, 3);
        section.sendCommand(self.command).finally(() => {
          self.setLoading(false);
        }).then(result => {
          debug('Command result', self.command, result);
          if (result.items) {
            return section.cache.onGetItems(result.items);
          }
        }, err => {
          debug('Command error', self.command, err);
        });
      }
    }
  };
});

const exploreSectionMetaModel = types.model('exploreSectionMetaModel', {
  name: types.string,
  version: types.string,
  author: types.maybe(types.string),
  description: types.maybe(types.string),
  homepageURL: types.maybe(types.string),
  icon: types.maybe(types.string),
  icon64: types.maybe(types.string),
  siteURL: types.maybe(types.string),
  updateURL: types.maybe(types.string),
  downloadURL: types.maybe(types.string),
  supportURL: types.maybe(types.string),
  require: types.optional(types.array(types.string), []),
  connect: types.array(types.string),
  actions: types.optional(types.array(exploreSectionMetaActionModel), []),
  locales: types.frozen,
  defaultLocale: types.maybe(types.string),
  locale: types.frozen,
}).actions(/**ExploreSectionMetaM*/self => {
  return {
    afterCreate() {
      self.locale = getLocale(self.defaultLocale, self.locales);
    },
  };
}).views(/**ExploreSectionMetaM*/self => {
  return {
    getName() {
      return processLocale(self.name, self.locale);
    }
  }
});

const exploreSectionModel = types.model('exploreSectionModel', {
  id: types.identifier(types.string),
  meta: exploreSectionMetaModel,
  info: types.model('exploreSectionInfo', {
    lastUpdate: types.optional(types.number, 0),
    disableAutoUpdate: types.optional(types.boolean, false),
  }),
  code: types.string,
  worker: types.maybe(exploreSectionWorkerModel),
  cache: types.maybe(cacheModel),
  lines: types.optional(types.number, 2),
  width: types.optional(types.number, 120),
}).actions(/**ExploreSectionM*/self => {
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
}).views(/**ExploreSectionM*/self => {
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

export default exploreSectionModel;