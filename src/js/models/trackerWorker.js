import PluginWorkerModel from "./pluginWorker";
import {types} from "mobx-state-tree";

const debug = require('debug')('trackerWorker');

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