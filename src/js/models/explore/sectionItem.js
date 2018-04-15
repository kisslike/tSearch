import {types, getRoot, clone} from "mobx-state-tree";

/**
 * @typedef {{}} ExploreSectionItemM
 * Model:
 * @property {string} title
 * @property {string} titleOriginal
 * @property {string} url
 * @property {string} poster
 * @property {Object} extra
 * Actions:
 * Views:
 * @property {function} handleAddFavorite
 * @property {function} handleEditFavorite
 * @property {function} handlePostMoveFavorite
 * @property {function} handleRemoveFavorite
 */

const sectionItemMode = types.model('sectionItemMode', {
  title: types.string,
  titleOriginal: types.maybe(types.string),
  url: types.string,
  poster: types.maybe(types.string),
  extra: types.frozen,
}).actions(self => {
  return {};
}).views(self => {
  return {
    handleAddFavorite(e) {
      e.preventDefault();
      const explore = /**ExploreM*/getRoot(self).explore;
      explore.favouriteModule.addItem(clone(self));
    },
    handleEditFavorite(e) {
      e.preventDefault();
    },
    handlePostMoveFavorite(e) {
      e.preventDefault();
    },
    handleRemoveFavorite(e) {
      e.preventDefault();
      const explore = /**ExploreM*/getRoot(self).explore;
      explore.favouriteModule.removeItem(self);
    },
  };
});

export default sectionItemMode;