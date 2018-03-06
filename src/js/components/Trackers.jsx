import React from "react";
import {observer} from "mobx-react/index";


@observer class Trackers extends React.Component {
  render() {
    const store = this.props.store;
    const trackers = store.profile.trackers.map(profileTracker => {
      const tracker = profileTracker.getTracker();

      const trackerIcon = tracker || profileTracker;
      let icon = null;
      if (trackerIcon.meta.trackerURL) {
        const classList = ['tracker__icon', trackerIcon.getIconClassName(), 'tracker__link'];
        icon = (
          <a className={classList.join(' ')} target="_blank" href={trackerIcon.meta.trackerURL}/>
        );
      } else {
        const classList = ['tracker__icon', trackerIcon.getIconClassName()];
        icon = (
          <div className={classList.join(' ')}/>
        );
      }

      let count = 0;
      const search = profileTracker.search;
      if (search) {
        count = search.results.length;
      }

      return (
        <div key={profileTracker.id} className="tracker">
          {icon}
          <a className="tracker__name" href={'#' + profileTracker.id}>{trackerIcon.meta.name}</a>
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