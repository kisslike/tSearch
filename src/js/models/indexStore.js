const debug = require('debug')('indexStore');
const {types, resolveIdentifier} = require('mobx-state-tree');
import profile from './profile';
import tracker from './tracker';


const indexStore = types.model('indexStore', {
  profile: types.reference(profile),
  profiles: types.array(profile),
  trackers: types.array(tracker),
}).preProcessSnapshot(snapshot => {
  if (!snapshot.profiles.length) {
    snapshot.profiles.push({
      name: 'Default',
      profileTrackers: [{
        id: 'rutracker',
        meta: {
          name: 'rutracker'
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
      self.trackers.forEach(tracker => {
        tracker.destroyWorker();
      });
    }
  };
}).views(self => {
  return {

  };
});

export default indexStore;