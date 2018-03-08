const debug = require('debug')('loadTrackers');
const popsicle = require('popsicle');
import {StatusCodeError} from "./errors";
import getTrackerCodeMeta from "./getTrackerCodeMeta";


const loadTrackers = () => {
  return Promise.all([
    'bitsnoop', 'booktracker', 'brodim', 'extratorrent',
    'filebase', 'freeTorrents', 'hdclub', 'inmac',
    'kinozal', 'megashara', 'mininova', 'nnmclub',
    'opentorrent', 'piratebit', 'rgfootball', 'rutor',
    'rutracker', 'tapochek', 'tfile', 'thepiratebay'
  ].map(id => {
    return popsicle.get('./trackers/' + id + '.js').then(response => {
      if (!/^2/.test('' + response.status)) {
        throw new StatusCodeError(response.status, response.body, null, response);
      }

      return {
        id: id,
        meta: getTrackerCodeMeta(response.body),
        info: {
          lastUpdate: 0,
          disableAutoUpdate: false,
        },
        code: response.body,
      }
    }).catch(function (err) {
      debug('Load tracker error', err);
    });
  }));
};

export default loadTrackers;