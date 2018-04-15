const cache = new WeakMap();

const promisifyApi = fn => {
  if (!cache.has(fn)) {
    cache.set(fn, (...args) => new Promise(resolve => fn(...args, resolve)));
  }
  return cache.get(fn);
};

export default promisifyApi;