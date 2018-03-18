const debug = require('debug')('loadExploreSections');
const popsicle = require('popsicle');
import {StatusCodeError} from "./errors";
import getExploreSectionCodeMeta from "./getExploreSectionCodeMeta";


const loadExploreSections = () => {
  return Promise.all([
    'kpInCinema',
    /*'favorites',
    'kpFavorites', 'kpInCinema', 'kpSerials', 'kpPopular',
    'imdbInCinema', 'imdbPopular', 'imdbSerials',
    'ggGamesTop', 'ggGamesNew',*/
  ].map(id => {
    return popsicle.get('./exploreSections/' + id + '.js').then(response => {
      if (!/^2/.test('' + response.status)) {
        throw new StatusCodeError(response.status, response.body, null, response);
      }

      return {
        id: id,
        meta: getExploreSectionCodeMeta(response.body),
        info: {
          lastUpdate: 0,
          disableAutoUpdate: false,
        },
        code: response.body,
      }
    }).catch(function (err) {
      debug('Load explore section error', err);
    });
  }));
};

export default loadExploreSections;