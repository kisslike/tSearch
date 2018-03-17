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

  const importantKeys = [];
  const keyValidator = {};
  const keyType = {};
  Object.keys(fieldScheme).forEach(key => {
    const value = fieldScheme[key];
    const m = /^(\*)?([^!]+)(?:!(.+))?$/.exec(value);
    const isImportant = m[1];
    const type = m[2];
    const validatorType = m[3];

    let validator = null;
    switch (validatorType) {
      case 'version':
        validator = processVersion;
        break;
      case 'connect':
        validator = processConnect;
        break;
    }

    keyType[key] = type;
    if (isImportant) {
      importantKeys.push(key);
    }
    if (validator) {
      keyValidator[key] = validator;
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

  Object.keys(keyValidator).forEach(key => {
    const validator = keyValidator[key];
    if (meta[key]) {
      try {
        meta[key] = validator(meta[key]);
      } catch (err) {
        throw new Error(`Validate field ${key}: ${meta[key]} error: ${err.message}`);
      }
    }
  });

  return meta;
};

export default getCodeMeta;