const {types} = require('mobx-state-tree');
const popsicle = require('popsicle');
const debug = require('debug')('searchFrom');
import {StatusCodeError, AbortError} from '../errors';
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
  let lastFetch = null;

  const fetchGoogleSuggestions = value => {
    let aborted = false;

    const request = popsicle.get({
      url: 'http://suggestqueries.google.com/complete/search',
      query: {
        client: 'firefox',
        q: value
      }
    });

    const promise = request.then(response => {
      if (!/^2/.test('' + response.status)) {
        throw new StatusCodeError(response.status, response.body, null, response);
      }

      if (aborted) {
        throw new AbortError('fetchGoogleSuggestions aborted');
      }

      return JSON.parse(response.body)[1];
    });
    promise.abort = () => {
      aborted = true;
      request.abort();
    };
    return promise;
  };

  const fetchHistorySuggestions = value => {
    let aborted = false;
    const promise = new Promise(r => chrome.storage.local.get({
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
        throw new AbortError('fetchHistorySuggestions aborted');
      }

      return suggestions;
    });
    promise.abort = () => {
      aborted = true;
    };
    return promise;
  };

  const fetchAbort = () => {
    if (lastFetch) {
      lastFetch.abort();
      lastFetch = null;
    }
  };

  return {
    getSuggestions() {
      return self.suggestions.slice(0);
    },
    fetchSuggestions(value) {
      fetchAbort();
      if (!value) {
        lastFetch = fetchHistorySuggestions();
      } else {
        lastFetch = fetchGoogleSuggestions(value);
      }
      lastFetch.then(results => {
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