import PluginWorkerModel from "../pluginWorker";
const debug = require('debug')('sectionWorker');
const {types} = require('mobx-state-tree');

/**
 * @typedef {PluginWorkerM} SectionWorkerM
 * Model:
 * Actions:
 * Views:
 * @property {function(string):Promise} search
 * @property {function(Object):Promise} searchNext
 */

const sectionWorkerModel = types.compose(PluginWorkerModel).named('sectionWorkerModel').views(/**SectionWorkerM*/self => {
  return {
    getItems() {
      return self.callFn('events.getItems');
    }
  };
});

export default sectionWorkerModel;