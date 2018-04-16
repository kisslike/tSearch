import {types} from "mobx-state-tree";
import exploreModuleModel from "./module";
import exploreModuleMetaModel from "./moduleMeta";

const debug = require('debug')('favoriteModuleModel');

/**
 * @typedef {ExploreModuleM} ExploreFavoriteModuleM
 * Model:
 * Actions:
 * Views:
 * @property {function:Promise} loadCache
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
  cache.setStorageType('sync');

  return {
    loadCache() {
      if (!cache.isLoaded()) {
        return this.loadItems();
      }
      return Promise.resolve();
    },
    loadItems() {
      self.setState('loading');

      return cache.getData([]).then(cacheDate => {
        return cacheDate.data;
      }).then(items => {
        self.setItems(items);
        self.setState('ready');
      }).catch(err => {
        debug('loadItems error', err);
        self.setState('error');
      });
    },
    addItem(item) {
      return self.loadCache().then(() => {
        const items = self.items.slice(0);
        items.push(item);
        self.setItems(items);
        return self.saveItems(items);
      });
    },
    removeItem(item) {
      const items = self.items.slice(0);
      const pos = items.indexOf(item);
      if (pos === -1) {
        throw new Error('Item is not found!');
      }
      items.splice(pos, 1);
      self.setItems(items);
      return self.saveItems(items);
    },
    moveItem(index, prevIndex, nextIndex) {
      const items = self.items.slice(0);
      const item = items[index];
      const prevItem = items[prevIndex];
      const nextItem = items[nextIndex];

      items.splice(index, 1);

      if (prevItem) {
        const pos = items.indexOf(prevItem);
        if (pos !== -1) {
          items.splice(pos + 1, 0, item);
        }
      } else
      if (nextItem) {
        const pos = items.indexOf(nextItem);
        if (pos !== -1) {
          items.splice(pos, 0, item);
        }
      }

      self.setItems(items);
      self.saveItems(items);
    },
    sendCommand() {}
  };
});

export default favoriteModuleModel;