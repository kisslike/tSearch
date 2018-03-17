const debug = require('debug')('getCodeMeta');
import compareVersion from 'compare-versions';

const processVersion = value => {
  compareVersion(value, value);
  return value;
};

const processConnect = value => {
  value = value.filter(function (pattern) {
    return !!pattern;
  });
  if (!value.length) {
    throw new Error("Connect field is empty!");
  }
  return value;
};

const getCodeMeta = (code, fieldScheme) => {
  const meta = {};

  const keyType = {};
  const importantKeys = [];
  const keyValidators = {};
  Object.keys(fieldScheme).forEach(key => {
    const value = fieldScheme[key];
    const m = /^(\*)?([^!]+)(?:!(.+))?$/.exec(value);
    const isImportant = m[1];
    const type = m[2];
    const typeValidators = !m[3] ? [] : m[3].split('!');

    const validators = typeValidators.map(type => {
      switch (type) {
        case 'version':
          return processVersion;
        case 'connect':
          return processConnect;
        default:
          throw new Error(`Validator is not found ${type}`);
      }
    });

    keyType[key] = type;
    if (isImportant) {
      importantKeys.push(key);
    }
    if (validators.length) {
      keyValidators[key] = validators;
    }
  });

  let readMeta = false;
  code.split(/\r?\n/).some(function (line) {
    if (/^\s*\/\//.test(line)) {
      if (!readMeta && /[=]+UserScript[=]+/.test(line)) {
        readMeta = true;
      }
      if (readMeta && /[=]+\/UserScript[=]+/.test(line)) {
        readMeta = false;
        return true;
      }
      if (readMeta) {
        const m = /^\s*\/\/\s*@([A-Za-z0-9]+)\s+(.+)$/.exec(line);
        if (m) {
          const key = m[1];
          const value = m[2].trim();
          const type = keyType[key];
          switch (type) {
            case 'string':
              meta[key] = value;
              break;
            case 'array':
              if (!meta[key]) {
                meta[key] = [];
              }
              meta[key].push(value);
              break;
            default: {
              debug('Skip meta key %s: %v', key, value);
            }
          }
        }
      }
    }
  });

  importantKeys.forEach(key => {
    if (!meta[key]) {
      throw new Error(`Field ${key} is important!`);
    }
  });

  Object.keys(keyValidators).forEach(key => {
    if (meta[key]) {
      const validators = keyValidators[key];
      validators.forEach(validator => {
        try {
          meta[key] = validator(meta[key]);
        } catch (err) {
          throw new Error(`Validate field ${key}: ${meta[key]} error: ${err.message}`);
        }
      });
    }
  });

  return meta;
};

export default getCodeMeta;