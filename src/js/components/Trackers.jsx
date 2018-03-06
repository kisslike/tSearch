import React from "react";
import {observer} from "mobx-react/index";


@observer class Trackers extends React.Component {
  render() {
    const store = this.props.store;
    const trackers = store.profile.trackers.map(profileTracker => {
      const tracker = profileTracker.getTracker();

      let icon = null;
      if (tracker.meta.trackerURL) {
        const classList = ['tracker__icon', tracker.getIconClassName(), 'tracker__link'];
        icon = (
          <a className={classList.join(' ')} target="_blank" href={tracker.meta.trackerURL}/>
        );
      } else {
        const classList = ['tracker__icon', tracker.getIconClassName()];
        icon = (
          <div className={classList.join(' ')}/>
        );
      }

      let count = 0;
      const lastSearch = profileTracker.lastSearch;
      if (lastSearch) {
        count = lastSearch.results.length;
      }

      return (
        <div key={tracker.id} className="tracker">
          {icon}
          <a className="tracker__name" href={'#' + tracker.id}>{tracker.meta.name}</a>
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