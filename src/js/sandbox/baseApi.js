/**
 * @returns {DocumentFragment}
 */
window.API_getDom = function (html) {
  return (new DOMParser()).parseFromString(html, 'text/html');
};

/**
 * @returns {string}
 */
window.API_sanitizeHtml = a => a;

/**
 * @returns {string}
 */
window.API_deSanitizeHtml = a => a;

(function () {
  class LinkNormalizer {
    constructor(location) {
      this.doc = document.implementation.createHTMLDocument('');

      const base = this.doc.createElement('base');
      base.href = location;
      this.doc.head.appendChild(base);

      this.link = document.createElement('a');
      this.doc.body.appendChild(this.link);
    }
    getUrl(href) {
      this.link.setAttribute('href', href);
      return this.link.href;
    }
  }
  const linkNormalizerCache = {};
  /**
   * @returns {string}
   */
  window.API_normalizeUrl = function (location, value) {
    if (/(^https?|^magnet):/.test(value)) {
      return value;
    }

    let linkNormalizer = linkNormalizerCache[location];
    if (!linkNormalizer) {
      linkNormalizer = linkNormalizerCache[location] = new LinkNormalizer(location);
    }

    return linkNormalizer.getUrl(value);
  };
})();

window.API_getDoc = (html, location) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const base = doc.head.querySelector('base');
  if (!base) {
    const base = doc.createElement('base');
    base.href = location;
    doc.head.appendChild(base);
  }

  return doc;
};

export default null;