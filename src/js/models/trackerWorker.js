const debug = require('debug')('trackerWorker');
const {types, getParent} = require('mobx-state-tree');
import FrameWorker from '../tools/frameWorker';


const trackerWorker = types.model('trackerWorker', {
  readyState: types.optional(types.string, 'idle'), // idle, loading, ready, error
}).actions(self => {
  return {};
}).views(self => {
  let worker = null;
  return {
    afterCreate() {
      if (!worker) {
        const tracker = getParent(self, 1);
        worker = new FrameWorker(tracker.id);
        worker.init();
      }
    },
    beforeDestroy() {
      if (worker) {
        worker.destroy();
        worker = null;
      }
    }
  };
});

export default trackerWorker;