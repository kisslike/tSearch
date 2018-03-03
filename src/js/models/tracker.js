const {types} = require('mobx-state-tree');


const tracker = types.model('tracker', {
  id: types.identifier(types.string),
  meta: types.model('trackerMeta', {
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
  }),
  info: types.model('trackerInfo', {
    lastUpdate: types.optional(types.number, 0),
    disableAutoUpdate: types.optional(types.boolean, false),
  }),
  code: types.string,
});

export default tracker;