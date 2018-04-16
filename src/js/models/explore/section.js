import {resolveIdentifier, types, getParent} from "mobx-state-tree";
import moduleModel from "./module";
import favoriteModuleModel from "./favoriteModule";


/**
 * @typedef {{}} ExploreSectionM
 * Model:
 * @property {string} id
 * @property {string} [downloadURL]
 * @property {number} rowCount
 * @property {number} zoom
 * Actions:
 * @property {function:Promise} toggleCollapse
 * @property {function(number):Promise} setItemZoom
 * @property {function(number):Promise} setRowCount
 * Views:
 * @property {ExploreModuleM} [module]
 * @property {function:Promise} saveSection
 */

const sectionModel = types.model('sectionModel', {
  id: types.identifier(types.string),
  downloadURL: types.maybe(types.string),
  collapsed: types.optional(types.boolean, false),
  rowCount: types.optional(types.number, 2),
  zoom: types.optional(types.number, 100),
}).actions(/**ExploreSectionM*/self => {
  return {
    toggleCollapse() {
      self.collapsed = !self.collapsed;
      return self.saveSection();
    },
    setItemZoom(size) {
      self.zoom = size;
      return self.saveSection();
    },
    setRowCount(count) {
      self.rowCount = count;
      return self.saveSection();
    },
  };
}).views(/**ExploreSectionM*/self => {
  return {
    get module() {
      if (self.id === 'favorite') {
        return resolveIdentifier(favoriteModuleModel, self, self.id);
      } else {
        return resolveIdentifier(moduleModel, self, self.id);
      }
    },
    saveSection() {
      const sections = getParent(self, 2);
      return sections.saveSections();
    }
  };
});

export default sectionModel;