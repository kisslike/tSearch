const {types} = require('mobx-state-tree');


const profileTracker = types.model('profileTracker', {
  id: types.identifier(types.string),
  meta: types.model('profileTrackerMeta', {
    name: types.string,
    downloadURL: types.maybe(types.string),
  }),
});

export default profileTracker;