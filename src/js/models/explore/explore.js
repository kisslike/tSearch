import sectionModel from "./section";
const debug = require('debug')('explore');
const {types, resolveIdentifier} = require('mobx-state-tree');

/**
 * @typedef {{}} ExploreM
 * Model:
 * @property {ExploreItemM[]} sections
 * Actions:
 * Views:
 * @property {function:ExploreSectionM[]} getSections
 */

/**
 * @typedef {{}} ExploreItemM
 * Model:
 * @property {string} id
 * @property {ExploreItemMetaM} meta
 * Actions:
 * Views:
 */

/**
 * @typedef {{}} ExploreItemMetaM
 * Model:
 * @property {string} name
 * @property {string} [downloadURL]
 * Actions:
 * Views:
 */

const exploreItemMetaModel = types.model('exploreItemMetaModel', {
  name: types.string,
  downloadURL: types.maybe(types.string),
});

const exploreItemModel = types.model('exploreItemModel', {
  id: types.identifier(types.string),
  meta: exploreItemMetaModel
}).actions(/**ExploreItemM*/self => {
  return {};
}).views(/**ExploreItemM*/self => {
  return {
    get section() {
      return resolveIdentifier(sectionModel, self, self.id);
    },
  };
});

const exploreModel = types.model('exploreModel', {
  items: types.optional(types.array(exploreItemModel), []),
}).actions(/**ExploreM*/self => {
  return {};
}).views(/**ExploreM*/self => {
  return {
    getSections() {
      return self.items.map(item => {
        return item.section;
      }).filter(a => !!a);
    },
  };
});

export default exploreModel;