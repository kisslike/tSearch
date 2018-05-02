import React from 'react';
import ReactDOM from 'react-dom';
import blankSvg from '../../img/blank.svg';

const debug = require('debug')('profileConfig');

class ProfileConfig extends React.Component {
  constructor() {
    super();

    this.state = {
      page: 'profiles', // profile
      profile: null
    };

    this.handleClose = this.handleClose.bind(this);
    this.handleBodyClick = this.handleBodyClick.bind(this);
  }
  componentWillMount() {
    document.body.addEventListener('click', this.handleBodyClick);
  }
  componentWillUnmount() {
    document.body.removeEventListener('click', this.handleBodyClick);
  }
  handleBodyClick(e) {
    if (!this.refs.page.refs.body.contains(e.target)) {
      this.props.onClose();
    }
  }
  handleClose(e) {
    e.preventDefault();
    this.props.onClose();
  }
  render() {
    let body = null;
    switch (this.state.page) {
      case 'profiles': {
        body = (
          <ProfilesChooser ref={'page'} {...this.props} profiles={this.props.store.profiles} onClose={this.handleClose}/>
        );
        break;
      }
      case 'profile': {
        body = (
          <ProfileEditor ref={'page'} {...this.props} profile={this.state.profile} onClose={this.handleClose}/>
        );
        break;
      }
    }
    return ReactDOM.createPortal(body, document.body);
  }
}

class ProfilesChooser extends React.Component {
  render() {
    const profiles = this.props.profiles.map(/**ProfileM*/profile => {
      return (
        <div key={profile.name} className="item">
          <div className="item__move"/>
          <div className="item__name">{profile.name}</div>
          <a className="item__cell item__button button-edit" href="#edit" title={chrome.i18n.getMessage('edit')}/>
          <a className="item__cell item__button button-remove" href="#remove" title={chrome.i18n.getMessage('remove')}/>
        </div>
      );
    });

    return (
      <div ref={'body'} className="manager">
        <div className="manager__header">
          <div className="header__title">{chrome.i18n.getMessage('manageProfiles')}</div>
          <a href="#close" className="header__close" onClick={this.props.onClose}>{chrome.i18n.getMessage('close')}</a>
        </div>
        <div className="manager__body">
          <div className="manager__sub_header manager__sub_header-profiles">
            <a className="manager__new_profile" href="#new_profile">{chrome.i18n.getMessage('newProfile')}</a>
          </div>
          <div className="manager__profiles">
            {profiles}
          </div>
        </div>
        <div className="manager__footer">
          <a className="button manager__footer__btn">{chrome.i18n.getMessage('save')}</a>
        </div>
      </div>
    );
  }
}

class ProfileEditor extends React.Component {
  render() {
    const profile = this.props.profile;

    const filterItems = ['all', 'withoutList', 'selected'].map(type => {
      const classList = ['filter__item'];
      if (type === 'selected') {
        classList.push('item__selected');
      }
      return (
        <a className={classList.join(' ')} href={'#' + type}>
          {chrome.i18n.getMessage('filter_' + type)}
          {' '}
          <span className="item__count">0</span>
        </a>
      );
    });

    const trackers = profile.trackes.map(/**ProfileTrackerM*/profileTracker => {
      const /**TrackerM*/module = profileTracker.trackerModule;
      const classList = ['item'];
      if (0) {
        classList.push('item__selected');
      }

      let updateBtn = null;
      if (
        (module && (module.meta.updateURL || module.meta.downloadURL)) ||
        profileTracker.meta.downloadURL
      ) {
        updateBtn = (
          <a className="item__cell item__button button-update" href="#update" title={chrome.i18n.getMessage('update')}/>
        );
      }

      let supportBtn = null;
      if (module && module.meta.supportURL) {
        supportBtn = (
          <a className="item__cell item__button button-support" target="_blank" href={module.meta.supportURL}/>
        );
      }

      let homepageBtn = null;
      if (module && module.meta.homepageURL) {
        homepageBtn = (
          <a className="item__cell item__button button-home" target="_blank" href={module.meta.homepageURL}/>
        );
      }

      let author = null;
      if (module && module.meta.author) {
        author = (
          <div className="item__cell item__author">{module.meta.author}</div>
        );
      }

      return (
        <div className={classList.join(' ')}>
          <div className="item__move"/>
          <div className="item__checkbox">
            <input type="checkbox" checked={true}/>
          </div>
          <img className="item__icon" src={module && module.getIconUrl() || blankSvg}/>
          <div className="item__name">{module && module.meta.name || profileTracker.meta.name}</div>
          <div className="item__cell item__version">{module && module.meta.version || ''}</div>
          {updateBtn}
          {supportBtn}
          {homepageBtn}
          {author}
          <a className="item__cell item__button button-edit" href="#edit">{chrome.i18n.getMessage('edit')}</a>
          <a className="item__cell item__button button-remove" href="#remove">{chrome.i18n.getMessage('remove')}</a>
        </div>
      );
    });

    return (
      <div ref={'body'} className="manager">
        <div className="manager__header">
          <div className="header__title">{chrome.i18n.getMessage('manageProfile')}</div>
          <a href="#close" className="header__close" onClick={this.props.onClose}>{chrome.i18n.getMessage('close')}</a>
        </div>
        <div className="manager__body">
          <div className="manager__sub_header sub_header__profile">
            <div className="profile__input">
              <input className="input__input" type="text" value={profile.name}/>
            </div>
          </div>
          <div className="manager__sub_header sub_header__filter">
            <div className="filter__box">{filterItems}</div>
            <div className="filter__search">
              <input className="input__input filter__input" type="text"
                     placeholder={chrome.i18n.getMessage('quickSearch')}
              />
            </div>
          </div>
          <div className="manager__trackers">
            {trackers}
          </div>
        </div>
        <div className="manager__footer">
          <a href="#save" className="button manager__footer__btn">{chrome.i18n.getMessage('save')}</a>
          <a href="#add" className="button manager__footer__btn">{chrome.i18n.getMessage('add')}</a>
          <a href="#createCode" className="button manager__footer__btn">{chrome.i18n.getMessage('createCode')}</a>
        </div>
      </div>
    );
  }
}

export default ProfileConfig;