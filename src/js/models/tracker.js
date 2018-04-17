import trackerWorkerModel from './trackerWorker';
import {types, destroy} from "mobx-state-tree";

/**
 * @typedef {{}} TrackerM
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
 * @typedef {{}} TrackerMetaM
 * Model:
 * @property {string} name
 * @property {string} version
 * @property {string} [author]
 * @property {string} [description]
 * @property {string} [homepageURL]
 * @property {string} [icon]
 * @property {string} [icon64]
 * @property {string} [trackerURL]
 * @property {string} [updateURL]
 * @property {string} [downloadURL]
 * @property {string} [supportURL]
 * @property {string[]} require
 * @property {string[]} connect
 * Actions:
 * Views:
 */

/**
 * @typedef {{}} TrackerInfoM
 * Model:
 * @property {number} lastUpdate
 * @property {boolean} disableAutoUpdate
 * Actions:
 * Views:
 */


const trackerMetaModel = types.model('trackerMetaModel', {
  name: types.string,
  version: types.string,
  author: types.maybe(types.string),
  description: types.maybe(types.string),
  homepageURL: types.maybe(types.string),
  icon: types.maybe(types.string),
  icon64: types.maybe(types.string),
  trackerURL: types.maybe(types.string),
  updateURL: types.maybe(types.string),
  downloadURL: types.maybe(types.string),
  supportURL: types.maybe(types.string),
  require: types.optional(types.array(types.string), []),
  connect: types.array(types.string),
});

const trackerModel = types.model('trackerModel', {
  id: types.identifier(types.string),
  meta: trackerMetaModel,
  info: types.model('trackerInfo', {
    lastUpdate: types.optional(types.number, 0),
    disableAutoUpdate: types.optional(types.boolean, false),
  }),
  code: types.string,
  worker: types.maybe(trackerWorkerModel)
}).actions(/**TrackerM*/self => {
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
}).views(/**TrackerM*/self => {
  return {
    afterCreate() {
      self.createWorker();
    }
  };
});

export default trackerModel;