import React from "react";
import {observer} from "mobx-react/index";


@observer class Filters extends React.Component {
  constructor() {
    super();
  }

  render() {
    /**@type {IndexM}*/
    const store = this.props.store;

    return (
      <div className="parameter_box__right">
        <WordFilter filter={this.props.store.filter}/>
        <div className="parameter parameter-filter">
          <span className="filter__label">{chrome.i18n.getMessage('sizeFilterLabel')}</span>
          <div className="input_box input_box-filter">
            <input className="input__input input__input-size-filter input__input-range input__input-range-from"
                   type="text" placeholder={chrome.i18n.getMessage('rangeFromPlaceholder')}/>
            {' — '}
            <input className="input__input input__input-size-filter input__input-range input__input-range-to"
                   type="text" placeholder={chrome.i18n.getMessage('rangeToPlaceholder')}/>
          </div>
        </div>
        <div className="parameter parameter-filter">
          <span className="filter__label">{chrome.i18n.getMessage('timeFilterLabel')}</span>
          <div className="select">
            <select className="select__select select__select-time-filter">
              <option value="0" selected>{chrome.i18n.getMessage('timeFilterAll')}</option>
              <option value="3600">{chrome.i18n.getMessage('timeFilter1h')}</option>
              <option value="86400">{chrome.i18n.getMessage('timeFilter24h')}</option>
              <option value="259200">{chrome.i18n.getMessage('timeFilter72h')}</option>
              <option value="604800">{chrome.i18n.getMessage('timeFilter1w')}</option>
              <option value="2592000">{chrome.i18n.getMessage('timeFilter1m')}</option>
              <option value="31536000">{chrome.i18n.getMessage('timeFilter1y')}</option>
              <option value="-1">{chrome.i18n.getMessage('timeFilterRange')}</option>
            </select>
          </div>
          <div className="input_box input_box-filter input_box-time-filter">
            <input className="input__input input__input-time-filter input__input-range input__input-range-from"
                   type="text" placeholder={chrome.i18n.getMessage('rangeFromPlaceholder')}/>
            {' — '}
            <input className="input__input input__input-time-filter input__input-range input__input-range-to"
                   type="text" placeholder={chrome.i18n.getMessage('rangeToPlaceholder')}/>
          </div>
        </div>
        <div className="parameter parameter-filter">
          <span className="filter__label">{chrome.i18n.getMessage('seedFilterLabel')}</span>
          <div className="input_box input_box-filter">
            <input className="input__input input__input-seed-filter input__input-range input__input-range-from"
                   type="text" placeholder={chrome.i18n.getMessage('rangeFromPlaceholder')}/>
            {' — '}
            <input className="input__input input__input-seed-filter input__input-range input__input-range-to"
                   type="text" placeholder={chrome.i18n.getMessage('rangeToPlaceholder')}/>
          </div>
        </div>
        <div className="parameter parameter-filter">
          <span className="filter__label">{chrome.i18n.getMessage('peerFilterLabel')}</span>
          <div className="input_box input_box-filter">
            <input className="input__input input__input-peer-filter input__input-range input__input-range-from"
                   type="text" placeholder={chrome.i18n.getMessage('rangeFromPlaceholder')}/>
            {' — '}
            <input className="input__input input__input-peer-filter input__input-range input__input-range-to"
                   type="text" placeholder={chrome.i18n.getMessage('rangeToPlaceholder')}/>
          </div>
        </div>
      </div>
    );
  }
}

@observer class WordFilter extends React.Component {
  constructor() {
    super();

    this.handleSubmit = this.handleSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
  }
  onChange() {
    /**@type {FilterM}*/
    const filter = this.props.filter;

    filter.setText(this.refs.input.value);
  }
  handleSubmit(e) {
    e.preventDefault();

    this.onChange();
  }
  render() {
    return (
      <div className="parameter parameter-filter">
        <span className="filter__label">{chrome.i18n.getMessage('wordFilterLabel')}</span>
        <form onSubmit={this.handleSubmit} className="input_box input_box-filter">
          <input ref={'input'} onChange={this.onChange} type="search" name="textFilter" className="input__input input__input-word-filter"/>
        </form>
      </div>
    );
  }
}

export default Filters;