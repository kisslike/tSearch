const {types} = require('mobx-state-tree');
import profileTracker from './profileTracker';


const profile = types.model('profile', {
  name: types.identifier(types.string),
  trackers: types.optional(types.array(profileTracker), []),
}).actions(self => {
  return {
    setName(value) {
      self.name = value;
    }
  };
}).views(self => {
  return {
    getTrackers() {
      return self.trackers.map(tracker => tracker.getTracker()).filter(a => !!a);
    }
  };
});

export default profile;