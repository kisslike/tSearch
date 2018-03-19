import React from 'react';
import {observer} from 'mobx-react';
const debug = require('debug')('Explore');

import exploreStyle from '../../../css/explore.less';

@observer class Explore extends React.Component {
  render() {
    /**@type {IndexM}*/
    const store = this.props.store;

    const sections = store.explore.getSections().map(section => {
      return (
        <ExploreSection key={section.id} section={section}/>
      );
    });

    return (
      <ul className="explore">
        {sections}
      </ul>
    );
  }
}

@observer class ExploreSection extends React.Component {
  render() {
    /**@type {ExploreSectionM}*/
    const section = this.props.section;

    let openSite = null;
    if (section.meta.siteURL) {
      openSite = (
        <a className="action action__open" target="_blank" href={section.meta.siteURL} title={chrome.i18n.getMessage('goToTheWebsite')}/>
      );
    }

    const actions = section.meta.getActions().map((action, i) => {
      const classList = ['action'];
      if (action.isLoading) {
        classList.push('loading');
      }
      switch (action.icon) {
        case 'update': {
          classList.push('action__update');
          return <a key={i} href={"#"} onClick={action.handleClick} className={classList.join(' ')} title={action.title}/>;
        }
        default: {
          return <a key={i} href={"#"} onClick={action.handleClick} className={classList.join(' ')} title={action.title}>{action.title}</a>;
        }
      }
    });

    const items = section.getCache().data;
    debug('items', items);

    return (
      <li className="section">
        <div className="section__head">
          <div className="section__move"/>
          <div className="section__title">{section.meta.getName()}</div>
          <div className="section__actions">
            {openSite}
            {actions}
            <a href={"#"} className="action action__setup" title={chrome.i18n.getMessage('setupView')}/>
          </div>
          <div className="section__collapses"/>
        </div>
        <ul className="section__pages"/>
        <ul className="section__body"/>
      </li>
    );
  }
}

export default Explore;