import PluginWorkerModel from "./pluginWorker";
const debug = require('debug')('trackerWorker');
const {types} = require('mobx-state-tree');

/**
 * @typedef {PluginWorkerM} TrackerWorkerM
 * Model:
 * Actions:
 * Views:
 * @property {function(string):Promise} search
 * @property {function(Object):Promise} searchNext
 */

const trackerWorkerModel = types.compose(PluginWorkerModel).named('trackerWorkerModel').views(/**TrackerWorkerM*/self => {
  return {
    search(query) {
      return self.callFn('events.search', [{
        query: query
      }]);
    },
    searchNext(next) {
      return self.callFn('events.getNextPage', [next]);
    }
  };
});

export default trackerWorkerModel;