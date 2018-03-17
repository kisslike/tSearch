import sectionWorkerModel from "./sectionWorker";

const debug = require('debug')('sectionModel');
const {types, destroy} = require('mobx-state-tree');

/**
 * @typedef {{}} SectionM
 * Model:
 * @property {string} id
 * @property {TrackerMetaM} meta
 * @property {TrackerInfoM} info
 * @property {string} code
 * @property {TrackerWorkerM} worker
 * Actions:
 * @property {function} createWorker
 * @property {function} destroyWorker
 * Views:
 */

/**
 * @typedef {{}} SectionOptionsM
 * Model:
 * @property {number} lastUpdate
 * @property {boolean} disableAutoUpdate
 * Actions:
 * Views:
 */

/**
 * @typedef {{}} SectionMetaM
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
 * Actions:
 * Views:
 */

const sectionMetaModel = types.model('sectionMetaModel', {
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
});

const sectionModel = types.model('sectionModel', {
  id: types.identifier(types.string),
  meta: sectionMetaModel,
  options: types.model('sectionOptions', {
    lastUpdate: types.optional(types.number, 0),
    disableAutoUpdate: types.optional(types.boolean, false),
  }),
  code: types.string,
  worker: types.maybe(sectionWorkerModel)
}).actions(/**SectionM*/self => {
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
}).views(/**SectionM*/self => {
  return {

  };
});

export default sectionModel;