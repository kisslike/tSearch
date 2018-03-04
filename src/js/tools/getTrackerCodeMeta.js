import compareVersion from 'compare-versions';

const getTrackerCodeMeta = function (code) {
  const meta = {};
  const fieldType = {
    name: 'string',
    version: 'string',
    author: 'string',
    description: 'string',
    homepageURL: 'string',
    icon: 'string',
    icon64: 'string',
    trackerURL: 'string',
    updateURL: 'string',
    downloadURL: 'string',
    supportURL: 'string',
    require: 'array',
    connect: 'array'
  };
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
          const type = fieldType[key];
          if (type === 'string') {
            meta[key] = value;
          } else if (type === 'array') {
            if (!meta[key]) {
              meta[key] = [];
            }
            meta[key].push(value);
          }
        }
      }
    }
  });
  if (!meta.name) {
    throw new Error("Name field is not found!");
  }
  if (!meta.version) {
    throw new Error("Version field is not found!");
  }

  if (!meta.connect) {
    throw new Error("Connect field is not found!");
  }
  meta.connect = meta.connect.filter(function (pattern) {
    return !!pattern;
  });
  if (!meta.connect.length) {
    throw new Error("Connect field is empty!");
  }

  // for validation
  compareVersion(meta.version, meta.version);

  return meta;
};

export default getTrackerCodeMeta;