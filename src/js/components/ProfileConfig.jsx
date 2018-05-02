import React from 'react';
import ReactDOM from 'react-dom';
import blankSvg from '../../img/blank.svg';
import {observer} from "mobx-react/index";

const debug = require('debug')('profileConfig');
const Sortable = require('sortablejs');

@observer class ProfileConfig extends React.Component {
  constructor() {
    super();

    this.state = {
      page: 'profiles', // profiles, edit
      profile: null
    };

    this.handleClose = this.handleClose.bind(this);
    this.handleBodyClick = this.handleBodyClick.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
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
  handleEdit(profile) {
    this.setState({
      page: 'edit',
      profile: profile
    });
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
          <ProfileChooser ref={'page'} {...this.props} profiles={this.props.store.profiles}
                          onClose={this.handleClose}
                          onEdit={this.handleEdit}/>
        );
        break;
      }
      case 'edit': {
        body = (
          <ProfileEditor ref={'page'} {...this.props} profile={this.state.profile}
                         onClose={this.handleClose}/>
        );
        break;
      }
    }
    return ReactDOM.createPortal(body, document.body);
  }
}

@observer class ProfileChooser extends React.Component {
  constructor() {
    super();

    this.refProfiles = this.refProfiles.bind(this);

    this.sortable = null;
  }
  refProfiles(node) {
    if (!node) {
      if (this.sortable) {
        this.sortable.destroy();
        this.sortable = null;
        // debug('destroy');
      }
    } else
    if (this.sortable) {
      // debug('update');
    } else {
      // debug('create');
      const self = this;
      this.sortable = new Sortable(node, {
        group: 'profiles',
        handle: '.item__move',
        draggable: '.item',
        animation: 150,
        onStart() {
          node.classList.add('sorting');
        },
        onEnd(e) {
          node.classList.remove('sorting');

          const itemNode = e.item;
          const prevNode = itemNode.previousElementSibling;
          const nextNode = itemNode.nextElementSibling;
          const index = parseInt(itemNode.dataset.index, 10);
          const prev = prevNode && parseInt(prevNode.dataset.index, 10);
          const next = nextNode && parseInt(nextNode.dataset.index, 10);

          const store = /**IndexM*/self.props.store;
          store.moveProfile(index, prev, next);
        }
      });
    }
  }
  render() {
    const profiles = this.props.profiles.map((/**ProfileM*/profile, index) => (
      <ProfileItem key={index} index={index} profile={profile} store={this.props.store} onEdit={this.props.onEdit}/>
    ));

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
          <div ref={this.refProfiles} className="manager__profiles">
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

@observer class ProfileItem extends React.Component {
  constructor() {
    super();

    this.handleRemove = this.handleRemove.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
  }
  handleEdit(e) {
    e.preventDefault();
    this.props.onEdit(this.props.profile);
  }
  handleRemove(e) {
    e.preventDefault();
    const /**@type IndexM*/store = this.props.store;
    const /**@type ProfileM*/profile = this.props.profile;
    store.removeProfile(profile.name);
  }
  render() {
    const /**@type ProfileM*/profile = this.props.profile;

    return (
      <div key={profile.name} data-index={this.props.index} className="item">
        <div className="item__move"/>
        <div className="item__name">{profile.name}</div>
        <a className="item__cell item__button button-edit"
           onClick={this.handleEdit}
           href="#edit" title={chrome.i18n.getMessage('edit')}/>
        <a className="item__cell item__button button-remove"
           onClick={this.handleRemove}
           href="#remove" title={chrome.i18n.getMessage('remove')}/>
      </div>
    );
  }
}

@observer class ProfileEditor extends React.Component {
  render() {
    const store = /**@type IndexM*/this.props.store;
    const profile = /**@type ProfileTemplateM*/this.props.profile;

    const filterItems = ['all', 'withoutList', 'selected'].map(type => {
      const classList = ['filter__item'];
      if (type === 'selected') {
        classList.push('item__selected');
      }
      return (
        <a key={type} className={classList.join(' ')} href={'#' + type}>
          {chrome.i18n.getMessage('filter_' + type)}
          {' '}
          <span className="item__count">0</span>
        </a>
      );
    });

    const trackers = profile.trackers.map(profileTracker => {
      const /**TrackerM*/module = store.getTrackerModel(profileTracker.id);
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
        <div key={profileTracker.id} className={classList.join(' ')}>
          <div className="item__move"/>
          <div className="item__checkbox">
            <input type="checkbox" defaultChecked={true}/>
          </div>
          <img className="item__icon" src={module && module.getIconUrl() || blankSvg}/>
          <div className="item__name">{module && module.meta.name || profileTracker.meta.name}</div>
          <div className="item__cell item__version">{module && module.meta.version || ''}</div>
          {updateBtn}
          {supportBtn}
          {homepageBtn}
          {author}
          <a className="item__cell item__button button-edit" href="#edit" title={chrome.i18n.getMessage('edit')}/>
          <a className="item__cell item__button button-remove" href="#remove" title={chrome.i18n.getMessage('remove')}/>
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
              <input className="input__input" type="text" defaultValue={profile.name}/>
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