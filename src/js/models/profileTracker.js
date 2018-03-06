const {types, resolveIdentifier} = require('mobx-state-tree');
import tracker from './tracker';
import search from './profileTrackerSearch';


const profileTrackerMeta = types.model('profileTrackerMeta', {
  name: types.string,
  downloadURL: types.maybe(types.string),
});

const profileTracker = types.model('profileTracker', {
  id: types.string,
  meta: profileTrackerMeta,
  search: types.maybe(search)
}).actions(self => {
  return {

  };
}).views(self => {
  let styleNode = null;
  return {
    get tracker() {
      return resolveIdentifier(tracker, self, self.id);
    },
    getIconClassName() {
      const className = 'icon_' + self.id;
      if (!styleNode) {
        let icon = null;
        if (self.tracker) {
          if (self.tracker.meta.icon64) {
            icon = JSON.stringify(self.tracker.meta.icon64);
          }
          if (self.tracker.meta.icon) {
            icon = JSON.stringify(self.tracker.meta.icon);
          }
        }
        if (!icon) {
          icon = blankSvg;
        }

        styleNode = document.createElement('style');
        styleNode.textContent = `.${className} {
          background-image:url(${icon});
        }`;

        document.body.appendChild(styleNode);
      }
      return className;
    },
    beforeDestroy() {
      if (styleNode) {
        if (styleNode.parentNode) {
          styleNode.parentNode.removeChild(styleNode);
        }
        styleNode = null;
      }
    }
  };
});

export default profileTracker;