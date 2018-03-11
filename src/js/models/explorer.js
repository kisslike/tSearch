const debug = require('debug')('explorer');
const {types} = require('mobx-state-tree');

/**
 * @typedef {{}} ExplorerM
 * Model:
 * Actions:
 * Views:
 */

/**
 * @typedef {{}} ExplorerSectionM
 * Model:
 * Actions:
 * Views:
 */

const explorerSectionModel = types.model('explorerSectionModel', {
  id: types.identifier(types.string),
}).actions(/**ExplorerSectionM*/self => {
  return {};
}).views(/**ExplorerSectionM*/self => {
  return {};
});

const explorerModel = types.model('explorerModel', {
  sections: types.optional(types.array(explorerSectionModel), []),
}).actions(/**ExplorerM*/self => {
  return {};
}).views(/**ExplorerM*/self => {
  return {};
});

export default explorerModel;