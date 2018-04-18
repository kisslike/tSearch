import {types} from "mobx-state-tree";

/**
 * @typedef {ProfileM} ProfileItemM
 * Model:
 * Actions:
 * Views:
 */

const profileTemplateModel = types.model('profileTemplateModel', {
  name: types.identifier(types.string),
  trackers: types.optional(types.array(types.model('profileItemTrackerModel', {
    id: types.string,
    meta: types.model('profileItemTrackerMetaModel', {
      name: types.string,
      downloadURL: types.maybe(types.string),
    }),
  })), []),
});

export default profileTemplateModel;