import React from 'react';
const debug = require('debug')('Explorer');

import exploreStyle from '../../../css/explore.css';

class Explorer extends React.Component {
  render() {
    /**@type {IndexM}*/
    const store = this.props.store;

    const sections = store.explorer.getSections().map(section => {
      return (
        <ExplorerSection key={section.id} section={section}/>
      );
    });

    return (
      <ul className="explore">
        {sections}
      </ul>
    );
  }
}

class ExplorerSection extends React.Component {
  constructor() {
    super();
  }
  render() {
    /**@type {SectionM}*/
    const section = this.props.section;

    return (
      <li className="section">
        <div className="section__head">
          <div className="section__move"/>
          <div className="section__title">{chrome.i18n.getMessage(section.id)}</div>
          <div className="section__actions">
            <a className="action__open" target="_blank" title={chrome.i18n.getMessage('goToTheWebsite')}/>
            <div className="action__update" title={chrome.i18n.getMessage('update')}/>
            <div className="action__setup" title={chrome.i18n.getMessage('setupView')}/>
          </div>
          <div className="section__collapses"/>
        </div>
        <ul className="section__pages"/>
        <ul className="section__body"/>
      </li>
    );
  }
}

export default Explorer;