import trackerModel from './tracker';
import blankSvg from '../../img/blank.svg';
const {types, resolveIdentifier} = require('mobx-state-tree');

/**
 * @typedef {{}} ProfileTrackerM
 * Model:
 * @property {string} id
 * @property {profileTrackerMetaM} meta
 * Actions:
 * Views:
 * @property {TrackerM} tracker
 * @property {function:string} getIconClassName
 * @property {function} beforeDestroyx
 */

/**
 * @typedef {{}} profileTrackerMetaM
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
  meta: profileTrackerMetaModel
}).actions(/**ProfileTrackerM*/self => {
  return {

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