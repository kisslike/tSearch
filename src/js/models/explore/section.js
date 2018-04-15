import {resolveIdentifier, types} from "mobx-state-tree";
import moduleModel from "./module";


/**
 * @typedef {{}} ExploreSectionM
 * Model:
 * @property {string} id
 * @property {string} [downloadURL]
 * @property {number} lines
 * @property {number} width
 * Actions:
 * Views:
 * @property {ExploreModuleM} [module]
 */

const sectionModel = types.model('sectionModel', {
  id: types.identifier(types.string),
  downloadURL: types.maybe(types.string),
  lines: types.optional(types.number, 2),
  width: types.optional(types.number, 120),
}).actions(/**ExploreSectionM*/self => {
  return {};
}).views(/**ExploreSectionM*/self => {
  return {
    get module() {
      return resolveIdentifier(moduleModel, self, self.id);
    },
  };
});

export default sectionModel;