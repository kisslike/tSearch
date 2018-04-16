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
        store.explore.sections.forEach(section => {
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
      page: 0,
      minBodyHeight: 0,
      showOptions: false,
    };

    this.handleSetPage = this.handleSetPage.bind(this);
    this.handleCollapse = this.handleCollapse.bind(this);
    this.handleOptionsClick = this.handleOptionsClick.bind(this);
    this.handleItemZoomChange = this.handleItemZoomChange.bind(this);
    this.handleRowCuntChange = this.handleRowCuntChange.bind(this);
    this.handleResetItemZoom = this.handleResetItemZoom.bind(this);
  }
  getDisplayItemCount() {
    const store = /**IndexM*/this.props.store;
    const section = /**ExploreSectionM*/this.props.section;

    const itemCount = Math.ceil((store.page.width - 175) / (120 * section.zoom / 100 + 10 * 2)) - 1;

    return itemCount * section.rowCount;
  }
  handleSetPage(page) {
    const bodyHeight = this.refs.bodyNode.clientHeight;
    if (bodyHeight > this.state.minBodyHeight) {
      this.state.minBodyHeight = bodyHeight;
    }
    this.setState({
      page: page
    });
  }
  handleCollapse(e) {
    if (e.target.classList.contains('section__head') || e.target.classList.contains('section__collapses')) {
      e.preventDefault();
      const section = /**ExploreSectionM*/this.props.section;
      section.toggleCollapse();
    }
  }
  handleOptionsClick(e) {
    e.preventDefault();
    this.setState({
      showOptions: !this.state.showOptions
    });
  }
  handleItemZoomChange(e) {
    this.state.minBodyHeight = 0;
    const zoom = parseInt(this.refs.itemZoom.value, 10);
    const section = /**ExploreSectionM*/this.props.section;
    section.setItemZoom(zoom);
  }
  handleRowCuntChange(e) {
    this.state.minBodyHeight = 0;
    const count = parseInt(this.refs.rowCount.value, 10);
    const section = /**ExploreSectionM*/this.props.section;
    section.setRowCount(count);
  }
  handleResetItemZoom(e) {
    e.preventDefault();
    this.state.minBodyHeight = 0;
    const section = /**ExploreSectionM*/this.props.section;
    this.refs.itemZoom.value = 100;
    section.setItemZoom(100);
  }
  getHead() {
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

    /*if (module.authRequired) {
      actions.unshift(
        <a key={'authRequired'} className="action  action__open" target="_blank" href={module.authRequired.url}
           title={chrome.i18n.getMessage('login')}/>
      );
    }*/

    let options = null;
    if (this.state.showOptions) {
      options = (
        <div className={'section__setup'}>
          <input ref={'itemZoom'} onChange={this.handleItemZoomChange} defaultValue={section.zoom} type="range" className="setup__size_range" min="1" max="150"/>
          <a onClick={this.handleResetItemZoom} className="setup__size_default" href="#" title={chrome.i18n.getMessage('default')}/>
          <select ref={'rowCount'} onChange={this.handleRowCuntChange} defaultValue={section.rowCount} className="setup__lines">
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
          </select>
        </div>
      );
    }

    return (
      <div className="section__head" onClick={this.handleCollapse}>
        <div className="section__move"/>
        <div className="section__title">{module.meta.getName()}</div>
        <div className="section__actions">
          {openSite}
          {actions}
          <a href={"#"} onClick={this.handleOptionsClick} className="action action__setup" title={chrome.i18n.getMessage('setupView')}/>
          {options}
        </div>
        <div className="section__collapses"/>
      </div>
    );
  }
  getBody() {
    const section = /**ExploreSectionM*/this.props.section;
    const module = /**ExploreModuleM*/section.module;

    const displayItemCount = this.getDisplayItemCount();
    const items = module.getItems();

    let page = this.state.page;
    let from = 0;
    let pageItems = null;

    while (!pageItems || (pageItems.length === 0 && page > 0)) {
      if (pageItems) {
        page--;
      }
      from = displayItemCount * page;
      pageItems = items.slice(from, from + displayItemCount);
    }

    const content = pageItems.map((item, i) => {
      return (
        <ExploreSectionItem key={from + i} section={section} item={item}/>
      );
    });

    const pages = (
      <ExploreSectionPages page={page} itemCount={items.length} displayCount={displayItemCount} onSetPage={this.handleSetPage}/>
    );

    return {pages, content};
  }
  render() {
    const section = /**ExploreSectionM*/this.props.section;
    const module = /**ExploreModuleM*/section.module;

    const head = this.getHead();

    const {pages, content} = this.getBody();

    const classList = ['section'];
    if (module.state === 'loading') {
      classList.push('section-loading');
    } else
    if (module.authRequired) {
      classList.push('section-login');
    } else
    if (module.state === 'error') {
      classList.push('section-error');
    }

    if (module.id === 'favorite' && !content.length) {
      classList.push('section-empty');
    }

    if (section.collapsed) {
      classList.push('section-collapsed');
    }

    return (
      <li className={classList.join(' ')}>
        {head}
        {pages}
        <ul ref="bodyNode" className="section__body" style={{
          minHeight: this.state.minBodyHeight
        }}>{content}</ul>
      </li>
    );
  }
}

@observer class ExploreSectionPages extends React.Component {
  constructor() {
    super();

    this.handleMouseEnter = this.handleMouseEnter.bind(this);
  }
  handleMouseEnter(e) {
    const page = parseInt(e.target.dataset.page, 10);
    this.props.onSetPage(page);
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
        <li key={i} className={classList.join(' ')} data-page={i} onMouseEnter={this.handleMouseEnter}>{i + 1}</li>
      );
    }

    let content = null;
    if (pages.length > 1) {
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

    this.state = {
      posterError: false
    };

    this.handlePosterError = this.handlePosterError.bind(this);
  }

  handlePosterError(e) {
    this.setState({
      posterError: true
    });
  }

  render() {
    const section = /**ExploreSectionM*/this.props.section;
    const item = /**ExploreSectionItemM*/this.props.item;

    let posterUrl = null;
    if (this.state.posterError) {
      posterUrl = require('!url-loader!../../../img/no_poster.png');
    } else {
      posterUrl = item.poster;
    }

    const itemStyle = {
      zoom: section.zoom / 100
    };

    const actions = [];
    if (section.id === 'favorite') {
      actions.push(
        <div key={'rmFavorite'} onClick={item.handleRemoveFavorite} className="action__rmFavorite" title={chrome.i18n.getMessage('removeFromFavorite')}/>,
        <div key={'move'} className="action__move" title={chrome.i18n.getMessage('move')}/>,
        <div key={'edit'} onClick={item.handleEditFavorite} className="action__edit" title={chrome.i18n.getMessage('edit')}/>,
      );
    } else {
      actions.push(
        <div key={'favorite'} onClick={item.handleAddFavorite} className="action__favorite" title={chrome.i18n.getMessage('addInFavorite')}/>,
      );
    }

    return (
      <li className="section__poster poster" style={itemStyle}>
        <div className="poster__image">
          {actions}
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