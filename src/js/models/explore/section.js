import exploreSectionWorkerModel from "./sectionWorker";

const debug = require('debug')('exploreSectionModel');
const {types, destroy, getParent} = require('mobx-state-tree');

/**
 * @typedef {{}} ExploreSectionM
 * Model:
 * @property {string} id
 * @property {ExploreSectionMetaM} meta
 * @property {ExploreSectionInfoM} info
 * @property {string} code
 * @property {ExploreSectionWorkerM} worker
 * Actions:
 * @property {function} createWorker
 * @property {function} destroyWorker
 * Views:
 * @property {function} getItems
 * @property {function(string)} sendCommand
 */

/**
 * @typedef {{}} ExploreSectionInfoM
 * Model:
 * @property {number} lastUpdate
 * @property {boolean} disableAutoUpdate
 * Actions:
 * Views:
 */

/**
 * @typedef {{}} ExploreSectionMetaM
 * Model:
 * @property {string} name
 * @property {string} version
 * @property {string} [author]
 * @property {string} [description]
 * @property {string} [homepageURL]
 * @property {string} [icon]
 * @property {string} [icon64]
 * @property {string} [siteURL]
 * @property {string} [updateURL]
 * @property {string} [downloadURL]
 * @property {string} [supportURL]
 * @property {string[]} require
 * @property {string[]} connect
 * @property {ExploreSectionMetaActionM[]} actions
 * @property {Object<string,Object<string,string>>} locales
 * @property {string} defaultLocale
 * @property {string} locale
 * Actions:
 * Views:
 */

/**
 * @typedef {{}} ExploreSectionMetaActionM
 * Model:
 * @property {string} icon
 * @property {string} title
 * @property {*} command
 * @property {boolean} isLoading
 * Actions:
 * @property {function(boolean)} setLoading
 * Views:
 * @property {function} handleClick
 */

const exploreSectionMetaActionModel = types.model('exploreSectionMetaActionModel', {
  icon: types.string,
  title: types.string,
  command: types.frozen,
  isLoading: types.boolean,
}).preProcessSnapshot(snapshot => {
  snapshot.isLoading = false;
  return snapshot;
}).actions(/**ExploreSectionMetaActionM*/self => {
  return {
    setLoading(state) {
      self.isLoading = state;
    },
  };
}).views(/**ExploreSectionMetaActionM*/self => {
  return {
    handleClick(e) {
      e.preventDefault();

      if (!self.isLoading) {
        self.setLoading(true);
        /**@type {ExploreSectionM}*/
        const section = getParent(self, 3);
        section.sendCommand(self.command).finally(() => {
          self.setLoading(false);
        }).then(result => {
          debug('Command result', self.command, result);
        }, err => {
          debug('Command error', self.command, err);
        });
      }
    }
  };
});

const exploreSectionMetaModel = types.model('exploreSectionMetaModel', {
  name: types.string,
  version: types.string,
  author: types.maybe(types.string),
  description: types.maybe(types.string),
  homepageURL: types.maybe(types.string),
  icon: types.maybe(types.string),
  icon64: types.maybe(types.string),
  siteURL: types.maybe(types.string),
  updateURL: types.maybe(types.string),
  downloadURL: types.maybe(types.string),
  supportURL: types.maybe(types.string),
  require: types.optional(types.array(types.string), []),
  connect: types.array(types.string),
  actions: types.optional(types.array(exploreSectionMetaActionModel), []),
  locales: types.frozen,
  defaultLocale: types.maybe(types.string),
  locale: types.maybe(types.string),
}).preProcessSnapshot(snapshot => {
  const getLocale = () => {
    const languages = [];
    const uiLang = chrome.i18n.getUILanguage();
    const m = /([^-]+)/.exec(uiLang);
    if (m) {
      languages.push(m[1]);
    }
    languages.push(snapshot.defaultLocale);

    let result = null;
    languages.some(language => {
      return result = snapshot.locales && snapshot.locales[language] && language;
    });

    return result;
  };

  snapshot.locale = getLocale();

  return snapshot;
}).views(/**ExploreSectionMetaM*/self => {
  const setLocale = value => {
    const key = value.substr(6, value.length - 6 - 2);
    return self.locales && self.locales[self.locale][key] || value;
  };

  const processLocale = value => {
    const readMsg = value => {
      const startMsg = 6;
      let endMsg = value.indexOf('__', startMsg);
      if (endMsg !== -1) {
        endMsg += 2;
      }
      let pos = null;
      let str = null;
      if (endMsg !== -1) {
        const msg = value.substr(0, endMsg);
        if (/^__MSG_[a-zA-Z_]+__$/.test(msg)) {
          str = setLocale(msg);
          pos = endMsg - 1;
        } else {
          str = value.substr(0, startMsg);
          pos = startMsg - 1;
        }
      } else {
        str = value;
        pos = value.length - 1;
      }
      return {
        text: str,
        i: pos
      };
    };

    let str = '';
    for (let i = 0, symbol; symbol = value[i]; i++) {
      if (value.substr(i, 6) === '__MSG_') {
        const result = readMsg(value.substr(i));
        i += result.i;
        str += result.text;
      } else {
        str += symbol;
      }
    }
    return str;
  };

  return {
    getName() {
      return processLocale(self.name);
    },
    getActions() {
      return self.actions.map(action => {
        return Object.assign({}, action, {title: processLocale(action.title)})
      });
    }
  }
});

const exploreSectionModel = types.model('exploreSectionModel', {
  id: types.identifier(types.string),
  meta: exploreSectionMetaModel,
  info: types.model('exploreSectionInfo', {
    lastUpdate: types.optional(types.number, 0),
    disableAutoUpdate: types.optional(types.boolean, false),
  }),
  code: types.string,
  worker: types.maybe(exploreSectionWorkerModel),
}).actions(/**ExploreSectionM*/self => {
  return {
    createWorker() {
      if (!self.worker) {
        self.worker = {};
      }
    },
    destroyWorker() {
      if (self.worker) {
        destroy(self.worker);
      }
    }
  };
}).views(/**ExploreSectionM*/self => {
  return {
    getItems() {
      if (!self.worker) {
        self.createWorker();
      }
      return self.worker.getItems().finally(() => {
        self.destroyWorker();
      });
    },
    sendCommand(command) {
      if (!self.worker) {
        self.createWorker();
      }
      return self.worker.sendCommand(command).finally(() => {
        self.destroyWorker();
      });
    }
  };
});

export default exploreSectionModel;