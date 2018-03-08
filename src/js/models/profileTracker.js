import trackerModel from './tracker';
import blankSvg from '../../img/blank.svg';
import trackerSearchModel from "./trackerSearch";
const {types, resolveIdentifier, destroy} = require('mobx-state-tree');

/**
 * @typedef {{}} ProfileTrackerM
 * Model:
 * @property {string} id
 * @property {ProfileTrackerMetaM} meta
 * @property {TrackerSearchM} [search]
 * Actions:
 * @property {function(string)} createSearch
 * @property {function} clearSearch
 * Views:
 * @property {TrackerM} tracker
 * @property {function:string} getIconClassName
 * @property {function} beforeDestroy
 */

/**
 * @typedef {{}} ProfileTrackerMetaM
 * Model:
 * @property {string} name
 * @property {string} [downloadURL]
 * Actions:
 * Views:
 */


const profileTrackerMetaModel = types.model('profileTrackerMetaModel', {
  name: types.string,
  downloadURL: types.maybe(types.string),
});

const profileTrackerModel = types.model('profileTrackerModel', {
  id: types.string,
  meta: profileTrackerMetaModel,
  search: types.maybe(trackerSearchModel),
}).actions(/**ProfileTrackerM*/self => {
  return {
    createSearch(query) {
      if (self.tracker) {
        self.search = trackerSearchModel.create();
        self.search.search(query);
      }
    },
    clearSearch() {
      if (self.search) {
        destroy(self.search);
      }
    },
  };
}).views(/**ProfileTrackerM*/self => {
  let styleNode = null;
  return {
    get tracker() {
      return resolveIdentifier(trackerModel, self, self.id);
    },
    getIconClassName() {
      const className = 'icon_' + self.id;
      if (!styleNode) {
        let icon = null;
        if (self.tracker) {
          if (self.tracker.meta.icon64) {
            icon = JSON.stringify(self.tracker.meta.icon64);
          }
          if (self.tracker.meta.icon) {
            icon = JSON.stringify(self.tracker.meta.icon);
          }
        }
        if (!icon) {
          icon = blankSvg;
        }

        styleNode = document.createElement('style');
        styleNode.textContent = `.${className} {
          background-image:url(${icon});
        }`;

        document.body.appendChild(styleNode);
      }
      return className;
    },
    beforeDestroy() {
      if (styleNode) {
        if (styleNode.parentNode) {
          styleNode.parentNode.removeChild(styleNode);
        }
        styleNode = null;
      }
    }
  };
});

export default profileTrackerModel;