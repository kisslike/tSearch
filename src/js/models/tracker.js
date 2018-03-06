const {types} = require('mobx-state-tree');
import trackerWorker from './trackerWorker';


const trackerMeta = types.model('trackerMeta', {
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

const tracker = types.model('tracker', {
  id: types.identifier(types.string),
  meta: trackerMeta,
  info: types.model('trackerInfo', {
    lastUpdate: types.optional(types.number, 0),
    disableAutoUpdate: types.optional(types.boolean, false),
  }),
  code: types.string,
  $worker: types.maybe(trackerWorker)
}).actions(self => {
  return {
    get worker() {
      if (!self.$worker) {
        self.$worker = {};
      }
      return self.$worker;
    },
    destroyWorker() {
      self.$worker = null;
    }
  };
}).views(self => {
  return {
    search(query) {
      return self.worker.search(query);
    },
    searchNext(next) {
      return self.worker.searchNext(next);
    }
  };
});

export default tracker;
export {trackerMeta};