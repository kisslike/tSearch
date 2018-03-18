import PluginWorkerModel from "../pluginWorker";
const debug = require('debug')('exploreSectionWorker');
const {types} = require('mobx-state-tree');

/**
 * @typedef {PluginWorkerM} ExploreSectionWorkerM
 * Model:
 * Actions:
 * Views:
 * @property {function:Promise} getItems
 */

const exploreSectionWorkerModel = types.compose(PluginWorkerModel).named('exploreSectionWorkerModel').views(/**ExploreSectionWorkerM*/self => {
  return {
    getItems() {
      return self.callFn('events.getItems');
    }
  };
});

export default exploreSectionWorkerModel;