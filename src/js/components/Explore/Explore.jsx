import React from 'react';
import {observer} from 'mobx-react';
import exploreStyle from '../../../css/explore.less';

const debug = require('debug')('Explore');
const Sortable = require('sortablejs');


@observer class Explore extends React.Component {
  constructor() {
    super();

    this.refSections = this.refSections.bind(this);

    this.sortable = null;
  }
  refSections(node) {
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
        group: 'sections',
        handle: '.section__move',
        draggable: '.section',
        animation: 150,
        onStart() {
          node.classList.add('explore-sort');
        },
        onEnd(e) {
          node.classList.remove('explore-sort');

          const itemNode = e.item;
          const prevNode = itemNode.previousElementSibling;
          const nextNode = itemNode.nextElementSibling;
          const index = parseInt(itemNode.dataset.index, 10);
          const prev = prevNode && parseInt(prevNode.dataset.index, 10);
          const next = nextNode && parseInt(nextNode.dataset.index, 10);

          const store = /**IndexM*/self.props.store;
          store.explore.moveSection(index, prev, next);
        }
      });
    }
  }
  render() {
    const store = /**IndexM*/this.props.store;

    switch (store.explore.state) {
      case 'loading': {
        return 'Explore loading...';
      }
      case 'ready': {
        const sections = [];
        store.explore.sections.forEach((section, index) => {
          if (section.module) {
            sections.push(
              <ExploreSection key={section.id} data-index={index} section={section} store={store}/>
            );
          }
        });

        return (
          <ul ref={this.refSections} className="explore">
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
    this.refBody = this.refBody.bind(this);

    this.bodyNode = null;
    this.sortable = null;
  }
  getDisplayItemCount() {
    const store = /**IndexM*/this.props.store;
    const section = /**ExploreSectionM*/this.props.section;

    const itemCount = Math.ceil((store.page.width - 175) / (120 * section.zoom / 100 + 10 * 2)) - 1;

    return itemCount * section.rowCount;
  }
  handleSetPage(page) {
    const bodyHeight = this.bodyNode.clientHeight;
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
    let actions = null;
    let options = null;
    if (!section.collapsed) {
      if (module.meta.siteURL) {
        openSite = (
          <a className="action action__open" target="_blank" href={module.meta.siteURL}
             title={chrome.i18n.getMessage('goToTheWebsite')}/>
        );
      }

      actions = module.meta.actions.map((action, i) => {
        const classList = ['action'];
        if (action.isLoading) {
          classList.push('loading');
        }
        switch (action.icon) {
          case 'update': {
            classList.push('action__update');
            return <a key={i} href={"#"} onClick={action.handleClick} className={classList.join(' ')}
                      title={action.getTitle()}/>;
          }
          default: {
            return <a key={i} href={"#"} onClick={action.handleClick} className={classList.join(' ')}
                      title={action.getTitle()}>{action.getTitle()}</a>;
          }
        }
      });

      /*if (module.authRequired) {
        actions.unshift(
          <a key={'authRequired'} className="action  action__open" target="_blank" href={module.authRequired.url}
             title={chrome.i18n.getMessage('login')}/>
        );
      }*/

      if (this.state.showOptions) {
        options = (
          <div className={'section__setup'}>
            <input ref={'itemZoom'} onChange={this.handleItemZoomChange} defaultValue={section.zoom} type="range"
                   className="setup__size_range" min="1" max="150"/>
            <a onClick={this.handleResetItemZoom} className="setup__size_default" href="#"
               title={chrome.i18n.getMessage('default')}/>
            <select ref={'rowCount'} onChange={this.handleRowCuntChange} defaultValue={section.rowCount}
                    className="setup__lines">
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

    let pages = null;
    let content = null;

    if (!section.collapsed) {
      let pageNumber = this.state.page;
      let from = 0;
      let pageItems = null;

      while (!pageItems || (pageItems.length === 0 && pageNumber > 0)) {
        if (pageItems) {
          pageNumber--;
        }
        from = displayItemCount * pageNumber;
        pageItems = items.slice(from, from + displayItemCount);
      }

      const contentItems = pageItems.map((item, i) => {
        return (
          <ExploreSectionItem key={[from + i, item.url].join(':')} data-index={from + i} section={section} item={item}/>
        );
      });


      pages = (
        <ExploreSectionPages page={pageNumber} itemCount={items.length} displayCount={displayItemCount}
                             onSetPage={this.handleSetPage}/>
      );

      content = (
        <ul ref={this.refBody} className="section__body" style={{
          minHeight: this.state.minBodyHeight
        }}>{contentItems}</ul>
      );
    }

    return {pages, content, contentLength: items.length};
  }
  refBody(node) {
    this.bodyNode = node;

    const section = /**ExploreSectionM*/this.props.section;
    if (section.id === 'favorite') {
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
        this.sortable = new Sortable(node, {
          group: 'favorite',
          handle: '.action__move',
          draggable: '.section__poster',
          animation: 150,
          onEnd(e) {
            const itemNode = e.item;
            const prevNode = itemNode.previousElementSibling;
            const nextNode = itemNode.nextElementSibling;
            const index = parseInt(itemNode.dataset.index, 10);
            const prev = prevNode && parseInt(prevNode.dataset.index, 10);
            const next = nextNode && parseInt(nextNode.dataset.index, 10);

            const module = /**ExploreModuleM*/section.module;
            module.moveItem(index, prev, next);
          }
        });
      }
    }
  }
  render() {
    const section = /**ExploreSectionM*/this.props.section;
    const module = /**ExploreModuleM*/section.module;

    const head = this.getHead();

    const {pages, content, contentLength} = this.getBody();

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

    if (module.id === 'favorite' && !contentLength) {
      classList.push('section-empty');
    }

    if (section.collapsed) {
      classList.push('section-collapsed');
    }

    return (
      <li data-index={this.props['data-index']} className={classList.join(' ')}>
        {head}
        {pages}
        {content}
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
      <li className="section__poster poster" style={itemStyle} data-index={this.props['data-index']}>
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