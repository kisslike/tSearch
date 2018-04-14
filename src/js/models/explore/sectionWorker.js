import PluginWorkerModel from "../pluginWorker";
import {types} from "mobx-state-tree";

const debug = require('debug')('exploreSectionWorker');

/**
 * @typedef {PluginWorkerM} ExploreSectionWorkerM
 * Model:
 * Actions:
 * Views:
 * @property {function:Promise} getItems
 * @property {function(string):Promise} sendCommand
 */

const exploreSectionWorkerModel = types.compose(PluginWorkerModel).named('exploreSectionWorkerModel').views(/**ExploreSectionWorkerM*/self => {
  return {
    getItems() {
      return self.callFn('events.getItems');
    },
    sendCommand(command) {
      return self.callFn('events.command', [command]);
    }
  };
});

export default exploreSectionWorkerModel;