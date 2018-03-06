const {types} = require('mobx-state-tree');
import profileTracker from './profileTracker';


const profile = types.model('profile', {
  name: types.identifier(types.string),
  profileTrackers: types.optional(types.array(profileTracker), []),
}).actions(self => {
  return {

  };
}).views(self => {
  return {

  };
});

export default profile;