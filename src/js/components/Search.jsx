const debug = require('debug')('Search');
import {observer} from 'mobx-react';
import React from 'react';
import moment from 'moment';
import Table from './Table';
const qs = require('querystring');

moment.locale(chrome.i18n.getUILanguage());

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
    /**@type {IndexM}*/
    const store = this.props.store;
    return (
      store.profile.getSearchResults().map((page, i) => {
        return (
          <Table key={i} page={page}/>
        );
      })
    );
  }
}

export default Search;