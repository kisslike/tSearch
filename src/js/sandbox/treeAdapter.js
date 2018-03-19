const debug = require('debug')('treeAdapter');
const DomTreeAdapter = require('dom-treeadapter');

class _Adapter {}
Object.assign(_Adapter.prototype, DomTreeAdapter(document));

class Adapter extends _Adapter {
  createElement(tagName, nameSpaceUri, attrs) {
    attrs.forEach(pair => {
      if (/^on/.test(pair.name)) {
        pair.name = 'deny-' + pair.name;
      }
    });
    const tagNameU = tagName.toUpperCase();
    if (tagNameU === 'SCRIPT') {
      tagName = 'DENY_SCRIPT';
    } else
    if (tagNameU === 'IFRAME') {
      tagName = 'DENY_IFRAME';
    }
    return super.createElement(tagName, nameSpaceUri, attrs);
  }
}

export default Adapter;