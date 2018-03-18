import exploreSectionWorkerModel from "./sectionWorker";

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
 * Actions:
 * @property {function} createWorker
 * @property {function} destroyWorker
 * Views:
 * @property {function} getItems
 * @property {function(string)} sendEvent
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
 * Actions:
 * Views:
 */

/**
 * @typedef {{}} ExploreSectionMetaActionM
 * Model:
 * @property {string} type
 * @property {string} title
 * @property {string} event
 * @property {*} event
 * @property {boolean} isLoading
 * Actions:
 * @property {function(boolean)} setLoading
 * Views:
 * @property {function} handleClick
 */

const exploreSectionMetaActionModel = types.model('exploreSectionMetaActionModel', {
  type: types.string,
  title: types.string,
  event: types.frozen,
  isLoading: types.optional(types.boolean, false)
}).actions(/**ExploreSectionMetaActionM*/self => {
  return {
    setLoading(state) {
      self.isLoading = state;
    },
  };
}).views(/**ExploreSectionMetaActionM*/self => {
  return {
    handleClick(e) {
      e.preventDefault();

      if (!self.isLoading) {
        self.setLoading(true);
        /**@type {ExploreSectionM}*/
        const section = getParent(self, 3);
        section.sendEvent(self.event).finally(() => {
          self.setLoading(false);
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
});

const exploreSectionModel = types.model('exploreSectionModel', {
  id: types.identifier(types.string),
  meta: exploreSectionMetaModel,
  info: types.model('sectionInfo', {
    lastUpdate: types.optional(types.number, 0),
    disableAutoUpdate: types.optional(types.boolean, false),
  }),
  code: types.string,
  worker: types.maybe(exploreSectionWorkerModel),
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
    }
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
    sendEvent(event) {
      if (!self.worker) {
        self.createWorker();
      }
      return self.worker.callFn('events.' + event).finally(() => {
        self.destroyWorker();
      });
    }
  };
});

export default exploreSectionModel;