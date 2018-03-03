const {types} = require('mobx-state-tree');
const popsicle = require('popsicle');
const debug = require('debug')('searchFrom');
import {StatusCodeError} from '../errors';
import escapeRegExp from 'lodash.escaperegexp';

const searchFrom = types.model('searchFrom', {
  query: types.optional(types.string, ''),
  suggestions: types.optional(types.array(types.string), [])
}).actions(self => ({
  setQuery(value) {
    self.query = value;
  },
  setSuggestions(results) {
    self.suggestions = results;
  }
})).views(self => {
  let lastRequest = null;

  const fetchGoogleSuggestions = value => {
    fetchAbort();
    lastRequest = popsicle.get({
      url: 'http://suggestqueries.google.com/complete/search',
      query: {
        client: 'firefox',
        q: value
      }
    });

    return lastRequest.then(response => {
      if (!/^2/.test('' + response.status)) {
        throw new StatusCodeError(response.status, response.body, null, response);
      }
      return response;
    }).then(response => {
      return JSON.parse(response.body)[1];
    });
  };
  const fetchHistorySuggestions = value => {
    fetchAbort();
    let aborted = false;
    lastRequest = new Promise(r => chrome.storage.local.get({
      history: []
    }, r)).then(({history}) => {
      history.sort(({count: a}, {count: b}) => {
        return a === b ? 0 : a < b ? 1 : -1;
      });

      let suggestions = history.map(item => item.query).filter(item => item.length);

      if (value) {
        const queryRe = new RegExp('^' + escapeRegExp(value), 'i');
        suggestions = suggestions.filter(value => queryRe.test(value));
      }

      if (aborted) {
        const err = new Error('Aborted');
        err.code = 'EABORT';
        throw err;
      }

      return suggestions;
    });
    lastRequest.abort = () => {
      aborted = true;
    };
    return lastRequest;
  };
  const fetchAbort = () => {
    if (lastRequest) {
      lastRequest.abort();
      lastRequest = null;
    }
  };

  return {
    getSuggestions() {
      return self.suggestions.slice(0);
    },
    fetchSuggestions(value) {
      let promise = null;
      if (!value) {
        promise = fetchHistorySuggestions();
      } else {
        promise = fetchGoogleSuggestions(value);
      }
      promise.then(results => {
        self.setSuggestions(results);
      }, err => {
        if (err.code === 'EABORT') return;
        debug('fetchSuggestions error', err);
      });
    },
    handleFetchSuggestions({value}) {
      self.fetchSuggestions(value);
    },
    handleClearSuggestions() {
      fetchAbort();
      self.setSuggestions([]);
    }
  };
});

export default searchFrom;