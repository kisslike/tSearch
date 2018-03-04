const {types, resolveIdentifier} = require('mobx-state-tree');
import profile from './profile';
import tracker from './tracker';


const indexStore = types.model('indexStore', {
  currentProfileId: types.reference(profile),
  profiles: types.array(profile),
  trackers: types.array(tracker),
}).preProcessSnapshot(snapshot => {
  if (!snapshot.profiles.length) {
    snapshot.profiles.push({
      name: 'Default',
      trackers: [{
        id: 'rutracker',
        meta: {
          name: 'rutracker'
        }
      }]
    });
    snapshot.profiles.push({
      name: 'Default2',
      trackers: [{
        id: 'nnmclub',
        meta: {
          name: 'nnmclub'
        }
      }]
    });
  }
  const profileFound = snapshot.profiles.some(profile => {
    return snapshot.currentProfileId === profile.name;
  });
  if (!profileFound) {
    snapshot.currentProfileId = snapshot.profiles[0].name;
  }

  return snapshot;
}).actions(self => {
  return {
    setCurrentProfileId(name) {
      self.currentProfileId = name;
    }
  };
}).views(self => {
  return {
    get profile() {
      return self.currentProfileId;
    },
    getProfileByName(name) {
      return resolveIdentifier(profile, self, name);
    }
  };
});

export default indexStore;