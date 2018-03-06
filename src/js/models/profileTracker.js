const {types, resolveIdentifier} = require('mobx-state-tree');
import tracker from './tracker';
import getIconClassNameExtend from './getIconClassNameExtend';
import search from './profileTrackerSearch';


const profileTrackerMeta =  types.model('profileTrackerMeta', {
  name: types.string,
  downloadURL: types.maybe(types.string),
});

const profileTracker = types.model('profileTracker', {
  id: types.string,
  meta: profileTrackerMeta,
  search: types.maybe(search)
}).extend(getIconClassNameExtend).actions(self => {
  return {

  };
}).views(self => {
  return {
    getTracker() {
      return resolveIdentifier(tracker, self, self.id);
    }
  };
});

export default profileTracker;