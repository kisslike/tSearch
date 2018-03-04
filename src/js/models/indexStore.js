const {types} = require('mobx-state-tree');
import profile from './profile';
import tracker from './tracker';


const indexStore = types.model('indexStore', {
  currentProfileId: types.reference(profile),
  profiles: types.array(profile),
  trackers: types.array(tracker),
}).actions(self => {
  return {
    setCurrentProfileId(id) {
      self.currentProfileId = id;
    }
  };
}).views(self => {
  return {
    get profile() {
      return self.currentProfileId;
    }
  };
});

export default indexStore;