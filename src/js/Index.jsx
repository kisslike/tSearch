const debug = require('debug')('Index');
import React from 'react';
import ReactDOM from 'react-dom';
import indexStyle from '../css/index.css';
import SearchForm from './components/SearchForm';
import indexStore from './models/indexStore';
import {observer} from 'mobx-react';
import ProfileSelect from './components/ProfileSelect';
import ScrollTop from './components/ScrollTop';
import Trackers from './components/Trackers';
import loadTrackers from './tools/loadTrackers';


@observer class Index extends React.Component {
  constructor() {
    super();

    this.state = {
      loading: true,
      store: null
    };

    this.store = null;

    this.load();
  }
  load() {
    new Promise(r => chrome.storage.local.get({
      profile: null,
      profiles: [],
      trackers: [],
    }, r)).then(storage => {
      return Promise.resolve().then(() => {
        if (storage.trackers.length === 0) {
          return loadTrackers().then(trackers => {
            storage.trackers.push(...trackers);
          });
        }
      }).then(() => {
        this.setState({
          loading: false,
          store: indexStore.create(storage)
        });
      });
    });
  }
  render() {
    if (this.state.loading) {
      return (
        'Loading...'
      );
    } else {
      return (
        <Main store={this.state.store}/>
      );
    }
  }
}

@observer class Main extends React.Component {
  render() {
    return ([
      <div key="head" className="body__head">
        <div className="search">
          <IndexSearchForm store={this.props.store}/>
        </div>
        <div className="menu">
          <a href="#main" className="menu__btn menu__btn-main" title={chrome.i18n.getMessage('main')}/>
          <a href="history.html" className="menu__btn menu__btn-history" title={chrome.i18n.getMessage('history')}/>
          <a href="options.html" className="menu__btn menu__btn-options" title={chrome.i18n.getMessage('options')}/>
        </div>
      </div>,
      <div key="body" className="content content-row">
        <div className="parameter_box">
          <div className="parameter_box__left">
            <div className="parameter parameter-profile">
              <div className="profile_box">
                <ProfileSelect store={this.props.store}/>
                <a href="#manageProfiles" title={chrome.i18n.getMessage('manageProfiles')} className="button-manage-profile"/>
              </div>
            </div>
            <div className="parameter parameter-tracker">
              <Trackers store={this.props.store}/>
            </div>
          </div>
          {/*<div className="parameter_box__right">
            <div className="parameter parameter-filter">
              <span className="filter__label">{chrome.i18n.getMessage('wordFilterLabel')}</span>
              <div className="input_box input_box-filter">
                <input type="text" className="input__input input__input-word-filter"/>
                <a href="#clear" title={chrome.i18n.getMessage('clear')} className="input__clear input__clear-word-filter"/>
              </div>
            </div>
            <div className="parameter parameter-filter">
              <span className="filter__label">{chrome.i18n.getMessage('sizeFilterLabel')}</span>
              <div className="input_box input_box-filter">
                <input className="input__input input__input-size-filter input__input-range input__input-range-from" type="text" placeholder={chrome.i18n.getMessage('rangeFromPlaceholder')}/>
                {' — '}
                <input className="input__input input__input-size-filter input__input-range input__input-range-to" type="text" placeholder={chrome.i18n.getMessage('rangeToPlaceholder')}/>
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
                <input className="input__input input__input-time-filter input__input-range input__input-range-from" type="text" placeholder={chrome.i18n.getMessage('rangeFromPlaceholder')}/>
                {' — '}
                <input className="input__input input__input-time-filter input__input-range input__input-range-to" type="text" placeholder={chrome.i18n.getMessage('rangeToPlaceholder')}/>
              </div>
            </div>
            <div className="parameter parameter-filter">
              <span className="filter__label">{chrome.i18n.getMessage('seedFilterLabel')}</span>
              <div className="input_box input_box-filter">
                <input className="input__input input__input-seed-filter input__input-range input__input-range-from" type="text" placeholder={chrome.i18n.getMessage('rangeFromPlaceholder')}/>
                {' — '}
                <input className="input__input input__input-seed-filter input__input-range input__input-range-to" type="text" placeholder={chrome.i18n.getMessage('rangeToPlaceholder')}/>
              </div>
            </div>
            <div className="parameter parameter-filter">
              <span className="filter__label">{chrome.i18n.getMessage('peerFilterLabel')}</span>
              <div className="input_box input_box-filter">
                <input className="input__input input__input-peer-filter input__input-range input__input-range-from" type="text" placeholder={chrome.i18n.getMessage('rangeFromPlaceholder')}/>
                {' — '}
                <input className="input__input input__input-peer-filter input__input-range input__input-range-to" type="text" placeholder={chrome.i18n.getMessage('rangeToPlaceholder')}/>
              </div>
            </div>
          </div>*/}
        </div>
        <div className="main">
          <ul className="explore explore-hide"/>
          <div className="results"/>
        </div>
      </div>,
      <ScrollTop key="scroll_top"/>
    ]);
  }
}

@observer class IndexSearchForm extends SearchForm {
  constructor() {
    super();

    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleSubmit(e) {
    e.preventDefault();
    this.props.store.createSearch(this.props.store.searchForm.query);
  }
}

window.app = ReactDOM.render(<Index/>, document.getElementById('root'));