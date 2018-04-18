import trackerModel from '../tracker';
import blankSvg from '../../../img/blank.svg';
import {types, resolveIdentifier, destroy, getParent, getRoot} from "mobx-state-tree";

const debug = require('debug')('profileTracker');

/**
 * @typedef {{}} ProfileTrackerM
 * Model:
 * @property {string} state
 * @property {string} id
 * @property {ProfileTrackerMetaM} meta
 * @property {boolean} selected
 * Actions:
 * @property {function(boolean)} setSelected
 * @property {function(boolean)} applySelected
 * Views:
 * @property {Promise} readyPromise
 * @property {TrackerM} trackerModule
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
  state: types.optional(types.string, 'idle'), // idle, loading, done
  id: types.identifier(types.string),
  meta: profileTrackerMetaModel,
  selected: types.optional(types.boolean, false),
}).actions(/**ProfileTrackerM*/self => {
  return {
    setSelected(value) {
      self.selected = value;
    },
    setState(value) {
      self.state = value;
    },
    applySelected(value) {
      /**@type {ProfileM}*/
      const profile = getParent(self, 2);
      profile.trackers.forEach(profileTracker => {
        if (value) {
          profileTracker.setSelected(profileTracker === self);
        } else {
          profileTracker.setSelected(false);
        }
      });
    }
  };
}).views(/**ProfileTrackerM*/self => {
  let readyPromise = null;
  let styleNode = null;
  return {
    get readyPromise() {
      return readyPromise;
    },
    get trackerModule() {
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
        if (self.trackerModule) {
          if (self.trackerModule.meta.icon64) {
            icon = JSON.stringify(self.trackerModule.meta.icon64);
          }
          if (self.trackerModule.meta.icon) {
            icon = JSON.stringify(self.trackerModule.meta.icon);
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
    },
    afterCreate() {
      self.setState('loading');
      const indexModel = /**IndexM*/getRoot(self);
      readyPromise = indexModel.loadTrackerModule(self.id).catch(err => {
        debug('loadTrackerModule error', self.id, err);
      }).then(() => {
        self.setState('done');
      });
    }
  };
});

export default profileTrackerModel;