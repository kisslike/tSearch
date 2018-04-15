import {getParent, types} from "mobx-state-tree";
import processLocale from "../../tools/processLocale";


/**
 * @typedef {{}} ExploreModuleMetaActionM
 * Model:
 * @property {string} icon
 * @property {string} title
 * @property {*} command
 * @property {boolean} isLoading
 * Actions:
 * @property {function(boolean)} setLoading
 * Views:
 * @property {function:string} getTitle
 * @property {function} handleClick
 */

const exploreModuleMetaActionModel = types.model('exploreModuleMetaActionModel', {
  icon: types.string,
  title: types.string,
  command: types.frozen,
  isLoading: types.boolean,
}).preProcessSnapshot(snapshot => {
  snapshot.isLoading = false;
  return snapshot;
}).actions(/**ExploreModuleMetaActionM*/self => {
  return {
    setLoading(state) {
      self.isLoading = state;
    },
  };
}).views(/**ExploreModuleMetaActionM*/self => {
  return {
    getTitle() {
      /**@type {ExploreModuleMetaM}*/
      const sectionMeta = getParent(self, 2);
      return processLocale(self.title, sectionMeta.locale);
    },
    handleClick(e) {
      e.preventDefault();

      if (!self.isLoading) {
        self.setLoading(true);
        /**@type {ExploreModuleM}*/
        const section = getParent(self, 3);
        section.sendCommand(self.command).finally(() => {
          self.setLoading(false);
        }).then(result => {
          debug('Command result', self.command, result);
          if (result.items) {
            return section.cache.onGetItems(result.items);
          }
        }, err => {
          debug('Command error', self.command, err);
        });
      }
    }
  };
});

export default exploreModuleMetaActionModel;