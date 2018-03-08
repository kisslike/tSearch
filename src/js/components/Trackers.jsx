import React from "react";
import {observer} from "mobx-react/index";


@observer class Trackers extends React.Component {
  render() {
    /**@type {IndexM}*/
    const store = this.props.store;
    const trackers = store.profile.profileTrackers.map(profileTracker => {
      const tracker = profileTracker.tracker;
      let icon = null;
      const iconClassList = [];

      const search = profileTracker.search;
      if (search) {
        if (search.readyState === 'loading') {
          iconClassList.push('tracker__icon-loading');
        } else
        if (search.readyState === 'error') {
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
          <a className="tracker__login" target="_blank" href={search.authRequired.url} title={chrome.i18n.getMessage('login')}/>
        );
      } else {
        let count = 0;
        if (search) {
          count = search.getResultCount();
        }
        extraInfo = (
          <div className="tracker__counter">{count}</div>
        )
      }

      return (
        <div key={profileTracker.id} className="tracker">
          {icon}
          <a className="tracker__name" href={'#' + profileTracker.id}>{profileTracker.meta.name}</a>
          {extraInfo}
        </div>
      );
    });
    return (
      <div className="tracker__list">
        {trackers}
      </div>
    );
  }
}

export default Trackers;