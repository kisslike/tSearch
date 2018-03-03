const {types} = require('mobx-state-tree');
import profileTracker from './profileTracker';


const profile = types.model('profile', {
  id: types.identifier(types.number),
  name: types.optional(types.string, 'Default'),
  trackers: types.optional(types.array(profileTracker), []),
});

export default profile;