import trackerModel from './tracker';
import blankSvg from '../../img/blank.svg';
import trackerSearchModel from "./trackerSearch";
const {types, resolveIdentifier, destroy, getParent} = require('mobx-state-tree');

/**
 * @typedef {{}} ProfileTrackerM
 * Model:
 * @property {string} id
 * @property {ProfileTrackerMetaM} meta
 * @property {boolean} selected
 * @property {TrackerSearchM} [search]
 * Actions:
 * @property {function(string):Promise} createSearch
 * @property {function} clearSearch
 * @property {function(boolean)} setSelected
 * @property {function(boolean)} applySelected
 * Views:
 * @property {TrackerM} tracker
 * @property {function:Promise} searchNext
 * @property {function:ProfileTrackerInfoM} getInfo
 * @property {function(number):TrackerResultM[]} getSearchResultsPage
 * @property {function:number} getSearchPageCount
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
  selected: types.optional(types.boolean, false),
  search: types.maybe(trackerSearchModel),
}).actions(/**ProfileTrackerM*/self => {
  return {
    createSearch(query) {
      if (self.tracker) {
        self.search = trackerSearchModel.create({
          tracker: self.tracker,
          trackerInfo: self.getInfo()
        });
        return self.search.search(query);
      } else {
        return Promise.resolve();
      }
    },
    clearSearch() {
      if (self.search) {
        destroy(self.search);
      }
    },
    setSelected(value) {
      self.selected = value;
    },
    applySelected(value) {
      /**@type {ProfileM}*/
      const profile = getParent(self, 2);
      profile.profileTrackers.forEach(profileTracker => {
        if (value) {
          profileTracker.setSelected(profileTracker === self);
        } else {
          profileTracker.setSelected(false);
        }
      });
    }
  };
}).views(/**ProfileTrackerM*/self => {
  let styleNode = null;
  return {
    get tracker() {
      return resolveIdentifier(trackerModel, self, self.id);
    },
    searchNext() {
      if (self.search) {
        return self.search.searchNext();
      } else {
        return Promise.resolve();
      }
    },
    getInfo() {
      return {
        id: self.id,
        name: self.meta.name,
        iconClassName: self.getIconClassName()
      };
    },
    getSearchResultsPage(index) {
      if (self.search) {
        return self.search.getResultsPage(index);
      } else {
        return [];
      }
    },
    getSearchPageCount() {
      if (self.search) {
        return self.search.pages.length;
      } else {
        return 0;
      }
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