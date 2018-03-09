const debug = require('debug')('SearchFrag');
import {observer} from 'mobx-react';
import React from 'react';
import Table from './Table';
const qs = require('querystring');

@observer class SearchFrag extends React.Component {
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
    store.searchFrag.clearSearch();
  }
  search(query) {
    /**@type {IndexM}*/
    const store = this.props.store;
    store.searchFrag.search(query);
  }
  render() {
    /**@type {IndexM}*/
    const store = this.props.store;

    return (
      store.searchFrag.tables.map(table => {
        return (
          <Table key={table.index} table={table}/>
        );
      })
    );
  }
}

export default SearchFrag;