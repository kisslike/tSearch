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

/**
 * @typedef {{}} ExplorerSectionMetaM
 * Model:
 * @property {string} name
 * @property {string} [downloadURL]
 * Actions:
 * Views:
 */

const explorerSectionMetaModel = types.model('explorerSectionMetaModel', {
  name: types.string,
  downloadURL: types.maybe(types.string),
});

const explorerSectionModel = types.model('explorerSectionModel', {
  id: types.identifier(types.string),
  meta: explorerSectionMetaModel
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