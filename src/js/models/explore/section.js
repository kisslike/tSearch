import {resolveIdentifier, types} from "mobx-state-tree";
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
 * @property {function} toggleCollapse
 * @property {function(number)} setItemZoom
 * @property {function(number)} setRowCount
 * Views:
 * @property {ExploreModuleM} [module]
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
    },
    setItemZoom(size) {
      self.zoom = size;
    },
    setRowCount(count) {
      self.rowCount = count;
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
  };
});

export default sectionModel;