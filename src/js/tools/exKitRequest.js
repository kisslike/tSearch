const popsicle = require('popsicle');

const exKitRequest = (tracker, options) => {
  if (typeof options !== 'object') {
    options = {url: options};
  }

  if (!tracker.connectRe || !tracker.connectRe.test(options.url)) {
    const err = new Error(`Connection is not allowed! ${options.url} Add url patter in @connect!`);
    throw err;
  }

  if (options.type) {
    options.method = options.type;
    delete options.type;
  }

  if (options.data) {
    if (options.method === 'POST') {
      options.body = options.data;
    } else {
      options.query = options.data;
    }
    delete options.data;
  }

  if (!options.headers) {
    options.headers = {};
  }

  if (options.body && !options.headers['Content-Type']) {
    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
  }

  if (!options.query) {
    options.query = {};
  }

  if (options.cache === false && ['GET', 'HEAD'].indexOf(options.method) !== -1) {
    options.query._ = Date.now();
  }

  const toJson = options.json;
  delete options.json;

  const request = popsicle.request(options);
  tracker.requests.push(request);

  return request.then(function (response) {
    const is2xx = /^2/.test('' + response.status);
    if (!is2xx) {
      const err = new Error(response.status + ' - ' + JSON.stringify(response.body));
      err.name = 'StatusCodeError';
      throw err;
    }
    if (toJson) {
      response.body = JSON.parse(response.body);
    }
    const result = {};
    ['url', 'headers', 'body', {key: 'status', value: 'statusCode'}, 'statusText'].forEach(function (key) {
      if (typeof key === 'string') {
        result[key] = response[key];
      } else {
        result[key.value] = response[key.key];
      }
    });
    return result;
  }).then(function (result) {
    tracker.requests.splice(tracker.requests.indexOf(request), 1);
    return result;
  }, function (err) {
    tracker.requests.splice(tracker.requests.indexOf(request), 1);
    throw err;
  });
};

export default exKitRequest;