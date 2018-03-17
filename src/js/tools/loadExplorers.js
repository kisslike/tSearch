const debug = require('debug')('loadExplorers');
const popsicle = require('popsicle');
import {StatusCodeError} from "./errors";
import getExplorerCodeMeta from "./getExplorerCodeMeta";


const loadExplorers = () => {
  return Promise.all([
    'kpInCinema',
    /*'favorites',
    'kpFavorites', 'kpInCinema', 'kpSerials', 'kpPopular',
    'imdbInCinema', 'imdbPopular', 'imdbSerials',
    'ggGamesTop', 'ggGamesNew',*/
  ].map(id => {
    return popsicle.get('./explorers/' + id + '.js').then(response => {
      if (!/^2/.test('' + response.status)) {
        throw new StatusCodeError(response.status, response.body, null, response);
      }

      return {
        id: id,
        meta: getExplorerCodeMeta(response.body),
        info: {
          lastUpdate: 0,
          disableAutoUpdate: false,
        },
        code: response.body,
      }
    }).catch(function (err) {
      debug('Load explorer error', err);
    });
  }));
};

export default loadExplorers;