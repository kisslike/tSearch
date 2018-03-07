const debug = require('debug')('indexStore');
const {types, resolveIdentifier} = require('mobx-state-tree');
import profile from './profile';
import tracker from './tracker';
import searchFrom from "./searchForm";
import search from "./search";


const indexStore = types.model('indexStore', {
  profile: types.reference(profile),
  profiles: types.array(profile),
  trackers: types.array(tracker),
  searchForm: types.optional(searchFrom, {}),
  search: types.optional(types.maybe(search), null),
}).preProcessSnapshot(snapshot => {
  if (!snapshot.profiles.length) {
    snapshot.profiles.push({
      name: 'Default',
      profileTrackers: [{
        id: 'rutracker',
        meta: {
          name: 'rutracker'
        }
      }, {
        id: 'rutracker1',
        meta: {
          name: 'rutracker1'
        }
      }]
    });
    snapshot.profiles.push({
      name: 'Default2',
      profileTrackers: [{
        id: 'nnmclub',
        meta: {
          name: 'nnmclub'
        }
      }, {
        id: 'nnmclub1',
        meta: {
          name: 'nnmclub1'
        }
      }]
    });
  }
  const profileFound = snapshot.profiles.some(profile => {
    return snapshot.profile === profile.name;
  });
  if (!profileFound) {
    snapshot.profile = snapshot.profiles[0].name;
  }

  return snapshot;
}).actions(self => {
  return {
    setProfile(name) {
      self.profile = name;
      self.onProfileChange();
    },
    createSearch(query) {
      self.search = {
        query: query,
        trackers: self.profile.getTrackers().map(tracker => {
          return {
            tracker: tracker
          }
        })
      };
      self.search.search(query);
    },
  };
}).views(self => {
  return {
    onProfileChange() {
      const trackers = self.profile.getTrackers();
      self.trackers.forEach(tracker => {
        if (trackers.indexOf(tracker) !== -1) {
          tracker.createWorker();
        } else {
          tracker.destroyWorker();
        }
      });
    },
    afterCreate() {
      self.onProfileChange();
    }
  };
});

export default indexStore;