const {types} = require('mobx-state-tree');
import profile from './profile';
import tracker from './tracker';


const indexStore = types.model('indexStore', {
  currentProfileId: types.maybe(types.number),
  profiles: types.optional(types.array(profile), []),
  trackers: types.optional(types.array(tracker), []),
});

export default indexStore;