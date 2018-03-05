const {types, resolveIdentifier} = require('mobx-state-tree');
import tracker from './tracker';
import {trackerMeta} from './tracker';
import search from './search';


const profileTrackerMeta = types.compose(trackerMeta, types.model({
  version: types.maybe(types.string),
  connect: types.maybe(types.array(types.string))
})).named('profileTrackerMeta');

const profileTracker = types.compose(tracker, types.model({
  meta: profileTrackerMeta,
  info: types.maybe(types.model('profileTrackerInfo', {
    lastUpdate: types.optional(types.number, 0),
    disableAutoUpdate: types.optional(types.boolean, false),
  })),
  code: types.maybe(types.string),
  search: types.maybe(search),
})).named('profileTracker').actions(self => {
  return {

  };
}).views(self => {
  return {
    getTracker() {
      return resolveIdentifier(tracker, self, self.id) || self;
    }
  };
});

export default profileTracker;