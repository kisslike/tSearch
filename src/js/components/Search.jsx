const debug = require('debug')('Search');
import {observer} from 'mobx-react';
import React from 'react';
const qs = require('querystring');

@observer class Search extends React.Component {
  componentWillMount() {
    const params = qs.parse(this.props.location.search.substr(1));
    this.search(params.query);
  }
  componentWillUnmount() {
    this.clearSearch();
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.location !== nextProps.location) {
      if (nextProps.location) {
        const params = qs.parse(nextProps.location.search.substr(1));
        this.search(params.query);
      }
    }
  }
  clearSearch() {
    /**@type {IndexM}*/
    const store = this.props.store;
    store.profile.clearSearch();
  }
  search(query) {
    /**@type {IndexM}*/
    const store = this.props.store;
    store.profile.search(query);
  }
  render() {
    return (
      'Search...'
    );
  }
}

export default Search;