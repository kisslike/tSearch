import escapeRegExp from 'lodash.escaperegexp';
import sortByLength from "../tools/sortByLen";
import uniq from 'lodash.uniq';
const debug = require('debug')('searchFrag');
const {types} = require('mobx-state-tree');

/**
 * @typedef {{}} FilterM
 * Model:
 * @property {string} word
 * Actions:
 * @property {function(string)} setWord
 * Views:
 * @property {function:TextFilter} getTextFilterRe
 * @property {function(string):boolean} testTextFilter
 * @property {function(TrackerResultM[]):TrackerResultM[]} processResults
 */

/**
 * @typedef {{}}  TextFilter
 * @property {RegExp} [excludeRe]
 * @property {RegExp} [includeRe]
 * @property {number} includeCount
 */

const filterModel = types.model('filterModel', {
  text: types.optional(types.string, ''),
}).actions(/**FilterM*/self => {
  return {
    setText(value) {
      self.text = value;
    }
  };
}).views(/**FilterM*/self => {
  const textToWords = function (text) {
    const result = [];
    const isSpace = /\s/;
    let word = '';
    for (let i = 0, symbol; symbol = text[i]; i++) {
      if (isSpace.test(symbol)) {
        if (text[i - 1] !== '\\') {
          word && result.push(word);
          word = '';
        } else {
          word = word.substr(0, word.length - 1) + symbol;
        }
      } else {
        word += symbol;
      }
    }
    word && result.push(word);
    return result;
  };

  return {
    getTextFilterRe() {
      const text = self.text;
      const words = textToWords(text);
      let i;
      let word = '';
      const includeWords = [];
      const excludeWords = [];
      const excludeRe = /^[!-].+/;
      for (i = 0; word = words[i]; i++) {
        let list = null;
        if (excludeRe.test(word)) {
          list = excludeWords;
          word = word.substr(1);
        } else {
          list = includeWords;
        }
        let wordReStr = escapeRegExp(word);
        if (list.indexOf(wordReStr) === -1) {
          list.push(wordReStr);
        }
      }

      excludeWords.sort(sortByLength);
      includeWords.sort(sortByLength);

      const result = {
        excludeRe: null,
        includeRe: null,
        includeCount: 0
      };
      if (excludeWords.length) {
        result.excludeRe = new RegExp(excludeWords.join('|'), 'i');
      }
      if (includeWords.length) {
        result.includeRe = new RegExp(includeWords.join('|'), 'ig');
        result.includeCount = includeWords.length;
      }
      return result
    },
    testTextFilter(text) {
      const textFilter = self.getTextFilterRe();
      if (textFilter.excludeRe && textFilter.excludeRe.test(text)) {
        return false;
      }
      if (textFilter.includeRe) {
        const m = text.match(textFilter.includeRe);
        if (!m || uniq(m).length !== textFilter.includeCount) {
          return false;
        }
      }
      return true;
    },
    processResults(/**TrackerResultM[]*/results) {
      return results.filter(result => {
        if (!self.testTextFilter(result.categoryTitle + ' ' + result.title)) {
          return false;
        } else {
          return true;
        }
      });
    }
  };
});

export default filterModel;