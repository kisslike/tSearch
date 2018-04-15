import {types} from "mobx-state-tree";

/**
 * @typedef {{}} ExploreSectionItemM
 * Model:
 * @property {string} title
 * @property {string} titleOriginal
 * @property {string} url
 * @property {string} poster
 * @property {Object} extra
 * @property {boolean} posterError
 * Actions:
 * @property {function(boolean)} setPosterError
 * Views:
 */

const sectionItemMode = types.model('sectionItemMode', {
  title: types.string,
  titleOriginal: types.maybe(types.string),
  url: types.string,
  poster: types.maybe(types.string),
  extra: types.frozen,
  posterError: types.optional(types.boolean, false)
}).actions(self => {
  return {
    setPosterError(value) {
      self.posterError = value;
    }
  };
});

export default sectionItemMode;