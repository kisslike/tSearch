import moduleModel from "./module";
import {types, applySnapshot} from "mobx-state-tree";
import loadExploreModules from "../../tools/loadExploreModules";
import promisifyApi from "../../tools/promisifyApi";
import sectionModel from "./section";

const debug = require('debug')('explore');

/**
 * @typedef {{}} ExploreM
 * Model:
 * @property {string} state
 * @property {ExploreSectionM[]} sections
 * @property {ExploreModuleM[]} modules
 * Actions:
 * @property {string} setState
 * Views:
 * @property {function:ExploreModuleM[]} getSections
 */

const exploreModel = types.model('exploreModel', {
  state: types.optional(types.string, 'idle'), // idle, loading, ready, error
  sections: types.optional(types.array(sectionModel), []),
  modules: types.optional(types.array(moduleModel), []),
}).actions(/**ExploreM*/self => {
  return {
    setState(value) {
      self.state = value;
    }
  };
}).views(/**ExploreM*/self => {
  return {
    afterCreate() {
      self.setState('loading');
      return promisifyApi(chrome.storage.local.get)({
        explorerSections: [],
        explorerModules: []
      }).then(async storage => {
        if (!storage.explorerModules.length) {
          storage.explorerModules = await loadExploreModules();
        }
        if (!storage.explorerSections.length) {
          storage.explorerSections = [{
            id: 'kpInCinema'
          }];
        }
        applySnapshot(self, Object.assign({}, {
          sections: storage.explorerSections,
          modules: storage.explorerModules
        }));
        self.setState('ready');
      }).catch(err => {
        debug('Load explore error', err);
        self.setState('error');
      });
    },
    getSections() {
      return self.sections.map(section => {
        return section;
      });
    }
  };
});

export default exploreModel;