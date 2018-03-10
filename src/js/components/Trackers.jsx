import React from "react";
import {observer} from "mobx-react/index";


@observer class Trackers extends React.Component {
  render() {
    /**@type {IndexM}*/
    const store = this.props.store;
    const trackers = store.profile.profileTrackers.map(profileTracker => {
      return (
        <ProfileTracker key={profileTracker.id} profileTracker={profileTracker} store={store}/>
      );
    });
    return (
      <div className="tracker__list">
        {trackers}
      </div>
    );
  }
}

@observer class ProfileTracker extends React.Component {
  constructor() {
    super();

    this.handleClick = this.handleClick.bind(this);
  }
  handleClick(e) {
    e.preventDefault();

    /**@type {ProfileTrackerM}*/
    const profileTracker = this.props.profileTracker;
    profileTracker.applySelected(!profileTracker.selected);
  }
  render() {
    /**@type {IndexM}*/
    const store = this.props.store;
    /**@type {ProfileTrackerM}*/
    const profileTracker = this.props.profileTracker;

    const tracker = profileTracker.tracker;
    let icon = null;
    const iconClassList = [];

    const search = profileTracker.search;
    if (search) {
      if (search.readyState === 'loading') {
        iconClassList.push('tracker__icon-loading');
      } else if (search.readyState === 'error') {
        iconClassList.push('tracker__icon-error');
      }
    }

    if (tracker && tracker.meta.trackerURL) {
      const classList = iconClassList.concat(['tracker__icon', profileTracker.getIconClassName(), 'tracker__link']);
      icon = (
        <a className={classList.join(' ')} target="_blank" href={tracker.meta.trackerURL}/>
      );
    } else {
      const classList = iconClassList.concat(['tracker__icon', profileTracker.getIconClassName()]);
      icon = (
        <div className={classList.join(' ')}/>
      );
    }

    let extraInfo = null;
    if (search && search.authRequired) {
      extraInfo = (
        <a className="tracker__login" target="_blank" href={search.authRequired.url}
           title={chrome.i18n.getMessage('login')}/>
      );
    } else {
      const count = store.searchFrag.getTrackerResultCount(profileTracker);
      const visibleCount = store.searchFrag.getTrackerVisibleResultCount(profileTracker);
      if (store)
      extraInfo = (
        <div className="tracker__counter">{visibleCount} / {count}</div>
      )
    }

    const classList = ['tracker'];
    if (profileTracker.selected) {
      classList.push('tracker-selected');
    }
    return (
      <div className={classList.join(' ')}>
        {icon}
        <a className="tracker__name" href={'#' + profileTracker.id}
           onClick={this.handleClick}>{profileTracker.meta.name}</a>
        {extraInfo}
      </div>
    );
  }
}

export default Trackers;