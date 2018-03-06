import escapeRegexp from 'lodash.escaperegexp';


const urlPatternToStrRe = function (value) {
  const m = /^(\*|http|https):\/\/([^\/]+)(?:\/(.*))?$/.exec(value);
  if (!m) {
    throw new Error("Invalid url-pattern");
  }

  let scheme = m[1];
  if (scheme === '*') {
    scheme = 'https?';
  }

  let host = m[2];
  host = escapeRegexp(host);
  host = host.replace(/^\\\*\\\./, '(?:[^\/]+\\.)?');

  const pattern = ['^', scheme, ':\\/\\/', host];

  let path = m[3];
  if (!path) {
    pattern.push('$');
  } else if (path === '*') {
    path = '(?:|\/.*)';
    pattern.push(path, '$');
  } else if (path) {
    path = '\/' + path;
    path = escapeRegexp(path);
    path = path.replace(/\\\*/g, '.*');
    pattern.push(path, '$');
  }

  return pattern.join('');
};

export default urlPatternToStrRe;