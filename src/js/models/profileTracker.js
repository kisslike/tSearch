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
 * Actions:
 * @property {function} resetSelected
 * @property {function(boolean)} setSelected
 * Views:
 * @property {TrackerM} tracker
 * @property {function:TrackerInfo} getInfo
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

/**
 * @typedef {{}} TrackerInfo
 * @property {string} id
 * @property {string} name
 * @property {string} iconClassName
 */

/**
 * @typedef {{}} TrackerSearchResult
 * @property {TrackerInfo} trackerInfo
 * @property {TrackerResultM} result
 */


const profileTrackerMetaModel = types.model('profileTrackerMetaModel', {
  name: types.string,
  downloadURL: types.maybe(types.string),
});

const profileTrackerModel = types.model('profileTrackerModel', {
  id: types.string,
  meta: profileTrackerMetaModel,
  selected: types.optional(types.boolean, false),
}).actions(/**ProfileTrackerM*/self => {
  return {
    resetSelected() {
      self.selected = false;
    },
    setSelected(value) {
      /**@type {ProfileM}*/
      const profile = getParent(self, 2);
      profile.profileTrackers.forEach(profileTracker => {
        if (profileTracker !== self) {
          profileTracker.resetSelected();
        }
      });
      self.selected = value;
    }
  };
}).views(/**ProfileTrackerM*/self => {
  let styleNode = null;
  return {
    get tracker() {
      return resolveIdentifier(trackerModel, self, self.id);
    },
    getInfo() {
      return {
        id: self.id,
        name: self.meta.name,
        iconClassName: self.getIconClassName()
      };
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