import trackerModel from '../tracker/tracker';
import {types, resolveIdentifier, destroy, getParent, getRoot, isAlive} from "mobx-state-tree";

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
      return 'icon_' + self.id;
    },
    beforeDestroy() {
      if (self.trackerModule) {
        self.trackerModule.destroyWorker();
      }
    },
    afterCreate() {
      self.setState('loading');
      const indexModel = /**IndexM*/getRoot(self);
      readyPromise = indexModel.loadTrackerModule(self.id).then(() => {
        if (isAlive(self) && self.trackerModule) {
          self.trackerModule.createWorker();
        }
      }, err => {
        debug('loadTrackerModule error', self.id, err);
      }).then(() => {
        if (isAlive(self)) {
          self.setState('done');
        }
      });
    }
  };
});

export default profileTrackerModel;