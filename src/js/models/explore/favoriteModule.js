import {types} from "mobx-state-tree";
import exploreModuleModel from "./module";
import exploreModuleMetaModel from "./moduleMeta";

const debug = require('debug')('favoriteModuleModel');

/**
 * @typedef {ExploreModuleM} ExploreFavoriteModuleM
 * Model:
 * Actions:
 * Views:
 * @property {function:ExploreSectionItemM[]} getCacheItems
 * @property {function(ExploreSectionItemM):Promise} addItem
 * @property {function(ExploreSectionItemM):Promise} removeItem
 */

const favoriteModuleModel = types.compose('favoriteModuleModel', exploreModuleModel, types.model({
  meta: types.optional(exploreModuleMetaModel, {
    name: '__MSG_name__',
    version: '1.0',
    connect: [],
    locales: {
      ru: {name: 'Избранное'},
      en: {name: 'Favorites'},
    },
    defaultLocale: 'en'
  }),
  info: types.frozen,
  code: types.frozen,
})).actions(/**ExploreFavoriteModuleM*/self => {
  return {};
}).views(/**ExploreFavoriteModuleM*/self => {
  const cache = self.getCache();

  return {
    getCacheItems() {
      return cache.getData().then(cacheDate => {
        return cacheDate.data || [];
      });
    },
    loadItems() {
      self.setState('loading');

      return self.getCacheItems().then(items => {
        self.setItems(items);
        self.setState('ready');
      }).catch(err => {
        debug('loadItems error', err);
        self.setState('error');
      });
    },
    addItem(item) {
      const items = self.items.slice(0);
      items.push(item);
      self.setItems(items);
      return self.saveItems(items);
    },
    removeItem(item) {
      return Promise.resolve().then(() => {
        const items = self.items.slice(0);
        const pos = items.indexOf(item);
        if (pos === -1) {
          throw new Error('Item is not found!');
        }
        items.splice(pos, 1);
        self.setItems(items);
        return self.saveItems(items);
      });
    },
    sendCommand() {}
  };
});

export default favoriteModuleModel;