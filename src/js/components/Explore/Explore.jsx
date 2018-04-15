import React from 'react';
import {observer} from 'mobx-react';
import exploreStyle from '../../../css/explore.less';

const debug = require('debug')('Explore');


@observer class Explore extends React.Component {
  render() {
    const store = /**IndexM*/this.props.store;

    switch (store.explore.state) {
      case 'loading': {
        return 'Explore loading...';
      }
      case 'ready': {
        const sections = [];
        store.explore.getSections().forEach(section => {
          if (section.module) {
            sections.push(
              <ExploreSection key={section.id} section={section} store={store}/>
            );
          }
        });

        return (
          <ul className="explore">
            {sections}
          </ul>
        );
      }
      case 'error': {
        return 'Explore error';
      }
      default: {
        return null;
      }
    }
  }
}

@observer class ExploreSection extends React.Component {
  constructor() {
    super();

    this.state = {
      page: 0
    };

    this.handleSetPage = this.handleSetPage.bind(this);
  }
  getDisplayItemCount() {
    const store = /**IndexM*/this.props.store;
    const section = /**ExploreSectionM*/this.props.section;

    const itemCount = Math.ceil((store.page.width - 175) / (section.width + 10 * 2)) - 1;

    return itemCount * section.lines;
  }
  handleSetPage(page) {
    this.setState({
      page: page
    });
  }
  render() {
    const section = /**ExploreSectionM*/this.props.section;
    const module = /**ExploreModuleM*/section.module;

    let openSite = null;
    if (module.meta.siteURL) {
      openSite = (
        <a className="action action__open" target="_blank" href={module.meta.siteURL} title={chrome.i18n.getMessage('goToTheWebsite')}/>
      );
    }

    const actions = module.meta.actions.map((action, i) => {
      const classList = ['action'];
      if (action.isLoading) {
        classList.push('loading');
      }
      switch (action.icon) {
        case 'update': {
          classList.push('action__update');
          return <a key={i} href={"#"} onClick={action.handleClick} className={classList.join(' ')} title={action.getTitle()}/>;
        }
        default: {
          return <a key={i} href={"#"} onClick={action.handleClick} className={classList.join(' ')} title={action.getTitle()}>{action.getTitle()}</a>;
        }
      }
    });

    let pages = null;
    const content = [];
    const cache = module.getCache();
    if (cache.state === 'ready') {
      const displayItemCount = this.getDisplayItemCount();
      const from = displayItemCount * this.state.page;

      pages = (
        <ExploreSectionPages page={this.state.page} itemCount={cache.data.length} displayCount={displayItemCount} onSetPage={this.handleSetPage}/>
      );

      const items = cache.data.slice(from, from + displayItemCount);

      items.forEach((item, i) => {
        return content.push(
          <ExploreSectionItem key={i} section={section} item={item}/>
        );
      });
    }

    return (
      <li className="section">
        <div className="section__head">
          <div className="section__move"/>
          <div className="section__title">{module.meta.getName()}</div>
          <div className="section__actions">
            {openSite}
            {actions}
            <a href={"#"} className="action action__setup" title={chrome.i18n.getMessage('setupView')}/>
          </div>
          <div className="section__collapses"/>
        </div>
        {pages}
        <ul className="section__body">{content}</ul>
      </li>
    );
  }
}

@observer class ExploreSectionPages extends React.Component {
  constructor() {
    super();

    this.handleMouseEnter = this.handleMouseEnter.bind(this);
  }
  handleMouseEnter(index, e) {
    this.props.onSetPage(index);
  }
  render() {
    const page = this.props.page;
    const coefficient = this.props.itemCount / this.props.displayCount;
    let pageCount = Math.floor(coefficient);
    if (coefficient % 1 === 0) {
      pageCount--;
    }
    if (pageCount === Infinity) {
      pageCount = 0;
    }

    const pages = [];
    for (let i = 0; i <= pageCount; i++) {
      const isActive = page === i;
      const classList = ['pages__item'];
      if (isActive) {
        classList.push('item-active');
      }
      pages.push(
        <li key={i} className={classList.join(' ')} onMouseEnter={this.handleMouseEnter.bind(this, i)}>{i + 1}</li>
      );
    }

    let content = null;
    if (pages.length) {
      content = (
        <ul className="section__pages">{pages}</ul>
      )
    }

    return (
      content
    );
  }
}

@observer class ExploreSectionItem extends React.Component {
  constructor() {
    super();

    this.handlePosterError = this.handlePosterError.bind(this);
  }

  handlePosterError(e) {
    const item = /**ExploreSectionItemM*/this.props.item;

    item.setPosterError(true);
  }

  render() {
    const section = /**ExploreSectionM*/this.props.section;
    const item = /**ExploreSectionItemM*/this.props.item;

    let posterUrl = null;
    if (item.posterError) {
      posterUrl = require('!url-loader!../../../img/no_poster.png');
    } else {
      posterUrl = item.poster;
    }

    const itemStyle = {
      width: section.width
    };

    return (
      <li className="section__poster poster" style={itemStyle}>
        <div className="poster__image">
          <div className="action__quick_search" title={chrome.i18n.getMessage('quickSearch')}>{'?'}</div>
          <a className="image__more_link" href={item.url} target="_blank" title={chrome.i18n.getMessage('readMore')}/>
          <a className="image__search_link" href={"#"} title={item.title}>
            <img className="image__image" src={posterUrl} onError={this.handlePosterError}/>
          </a>
        </div>
        <div className="poster__title">
          <span>
            <a className="poster__search_link" href={"#"} title={item.title}>{item.title}</a>
          </span>
        </div>
      </li>
    );
  }
}

export default Explore;