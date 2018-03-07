import React from 'react';
import Autosuggest from 'react-autosuggest';
import {observer} from 'mobx-react';
const debug = require('debug')('SearchFrom');
const qs = require('querystring');

import searchFormStyle from '../../css/searchForm.less';

@observer class SearchForm extends React.Component {
  constructor(props) {
    super();

    this.handleChange = this.handleChange.bind(this);
    this.renderSuggestion = this.renderSuggestion.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleChange(e, {newValue}) {
    this.props.store.searchForm.setQuery(newValue);
  }
  renderSuggestion(suggestion) {
    return (
      <span>{suggestion}</span>
    );
  }
  handleSubmit(e) {
    e.preventDefault();
    let url = 'index.html';
    if (this.props.store.searchForm.query) {
      url += '#' + qs.stringify({
        query: this.props.store.searchForm.query
      });
    }
    chrome.tabs.create({url: url});
  }
  render() {
    return (
      <div className="search-from">
        <form onSubmit={this.handleSubmit}>
          <Autosuggest
            theme={{
              input: 'input',
              suggestionsContainer: 'suggestions-container',
              suggestionsList: 'suggestions-list',
              suggestion: 'suggestion',
              suggestionHighlighted: 'suggestion--highlighted'
            }}
            suggestions={this.props.store.searchForm.getSuggestions()}
            onSuggestionsFetchRequested={this.props.store.searchForm.handleFetchSuggestions}
            onSuggestionsClearRequested={this.props.store.searchForm.handleClearSuggestions}
            shouldRenderSuggestions={() => true}
            getSuggestionValue={suggestion => suggestion}
            renderSuggestion={this.renderSuggestion}
            inputProps={{
              type: 'search',
              placeholder: chrome.i18n.getMessage('searchPlaceholder'),
              value: this.props.store.searchForm.query,
              onChange: this.handleChange,
              autoFocus: true
            }}
          />
          <button type="submit" className="submit">{chrome.i18n.getMessage('search')}</button>
        </form>
      </div>
    );
  }
}

export default SearchForm;