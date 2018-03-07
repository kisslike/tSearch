import React from "react";
import {observer} from "mobx-react/index";


@observer class Trackers extends React.Component {
  render() {
    const store = this.props.store;
    const trackers = store.profile.profileTrackers.map(profileTracker => {
      const tracker = profileTracker.tracker;
      let icon = null;
      if (tracker && tracker.meta.trackerURL) {
        const classList = ['tracker__icon', profileTracker.getIconClassName(), 'tracker__link'];
        icon = (
          <a className={classList.join(' ')} target="_blank" href={tracker.meta.trackerURL}/>
        );
      } else {
        const classList = ['tracker__icon', profileTracker.getIconClassName()];
        icon = (
          <div className={classList.join(' ')}/>
        );
      }

      let count = 0;
      if (store.search) {
        const trackerSearch = store.search.getTrackerSearch(profileTracker.id);
        if (trackerSearch) {
          count = trackerSearch.getResultCount();
        }
      }

      return (
        <div key={profileTracker.id} className="tracker">
          {icon}
          <a className="tracker__name" href={'#' + profileTracker.id}>{profileTracker.meta.name}</a>
          <div className="tracker__counter">{count}</div>
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