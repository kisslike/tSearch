const {types} = require('mobx-state-tree');
import blankSvg from '../../img/blank.svg';

const trackerMeta = types.model('trackerMeta', {
  name: types.string,
  version: types.string,
  author: types.maybe(types.string),
  description: types.maybe(types.string),
  homepageURL: types.maybe(types.string),
  icon: types.maybe(types.string),
  icon64: types.maybe(types.string),
  trackerURL: types.maybe(types.string),
  updateURL: types.maybe(types.string),
  downloadURL: types.maybe(types.string),
  supportURL: types.maybe(types.string),
  require: types.optional(types.array(types.string), []),
  connect: types.array(types.string),
});

const tracker = types.model('tracker', {
  id: types.identifier(types.string),
  meta: trackerMeta,
  info: types.model('trackerInfo', {
    lastUpdate: types.optional(types.number, 0),
    disableAutoUpdate: types.optional(types.boolean, false),
  }),
  code: types.string,
}).actions(self => {
  return {

  };
}).views(self => {
  let styleNode = null;
  return {
    getIconClassName() {
      const className = 'icon_' + self.id;
      if (!styleNode) {
        let icon = null;
        if (self.meta.icon64) {
          icon = JSON.stringify(self.meta.icon64);
        }
        if (self.meta.icon) {
          icon = JSON.stringify(self.meta.icon);
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

export default tracker;
export {trackerMeta};