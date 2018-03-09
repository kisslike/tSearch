import {observer} from "mobx-react/index";
import React from "react";
import {typeSortMap} from "../tools/sortResults";
const debug = require('debug')('Table');

@observer class Table extends React.Component {
  constructor() {
    super();

    this.columns = ['date', 'quality', 'title', 'size', 'seed', 'peer'];
    // todo: hide columns
    /*if (storage.hidePeerRow) {
      this.columns.splice(this.columns.indexOf('peer'), 1);
    }
    if (storage.hideSeedRow) {
      this.columns.splice(this.columns.indexOf('seed'), 1);
    }*/
  }
  handleSortBy(by, e) {
    e.preventDefault();
    /**@type {SearchFragTableM}*/
    const table = this.props.table;

    if (e.ctrlKey) {
      table.subSortBy(by);
    } else {
      table.sortBy(by);
    }
  }
  getHeaderColumn(type) {
    /**@type {SearchFragTableM}*/
    const table = this.props.table;
    const name = chrome.i18n.getMessage('row_' + type);
    const nameShort = chrome.i18n.getMessage('row_' + type + '__short') || name;
    const sortBy = table.getSortBy(type);
    const sortReverse = (typeSortMap[type] || {}).reverse;

    const classList = ['cell', 'row__cell', 'cell-' + type];
    if (sortBy) {
      let direction = sortBy.direction;
      if (sortReverse) {
        direction = direction === 0 ? 1 : 0;
      }
      if (direction === 0) {
        classList.push('cell-sort-down');
      } else {
        classList.push('cell-sort-up');
      }
    }
    return (
      <a key={type} className={classList.join(' ')} href={'#cell-' + type} onClick={this.handleSortBy.bind(this, type)}>
        <span className="cell__title" title={name}>{nameShort}</span>
        <i className="cell__sort"/>
      </a>
    );
  }
  getHeaderColumns() {
    return this.columns.map(type => this.getHeaderColumn(type));
  }
  getRow(/**TrackerInfo*/trackerInfo, /**TrackerResultM*/result) {
    return (
      <div key={trackerInfo.id + '_' + result.url} className="row body__row">{this.columns.map(type => {
        switch (type) {
          case 'date': {
            return (
              <div key="date" className={`cell row__cell cell-${type}`}
                   title={result.dateTitle}>{result.dateText}</div>
            );
          }
          case 'quality': {
            const qualityValue = result.quality;
            const percent = result.quality / 500 * 100;
            return (
              <div key="quality" className={`cell row__cell cell-${type}`}>
                <div className="quality_box" title={qualityValue}>
                  <div className="quality_progress" style={{width: percent + '%'}}>
                    <span className="quality_value">{qualityValue}</span>
                  </div>
                </div>
              </div>
            );
          }
          case 'title': {
            let category = null;
            if (result.categoryTitle) {
              if (result.categoryUrl) {
                category = (
                  <a className="category" target="_blank" href={result.categoryUrl}>{result.categoryTitle}</a>
                );
              } else {
                category = (
                  <span className="category">{result.categoryTitle}</span>
                );
              }
            }

            let titleIcon = (
              <div className={`tracker__icon ${trackerInfo.iconClassName}`} title={trackerInfo.name}/>
            );

            if (category) {
              category = (
                <div className="cell__category">
                  {category},
                  {titleIcon}
                </div>
              );
              titleIcon = null;
            }

            return (
              <div key="title" className={`cell row__cell cell-${type}`}>
                <div className="cell__title">
                  <a className="title" target="_blank" href={result.url}>{result.title}</a>
                  {titleIcon}
                </div>
                {category}
              </div>
            );
          }
          case 'size': {
            let downloadLink = null;
            if (result.downloadUrl) {
              downloadLink = (
                <a className="cell__download" target="_blank" href={result.downloadUrl}>{
                  result.sizeText + String.fromCharCode(160) + String.fromCharCode(8595)
                }</a>
              );
            } else {
              downloadLink = result.sizeText;
            }
            return (
              <div key="size" className={`cell row__cell cell-${type}`}>
                {downloadLink}
              </div>
            );
          }
          case 'seed': {
            return (
              <div key="seed" className={`cell row__cell cell-${type}`}>
                {result.seed}
              </div>
            );
          }
          case 'peer': {
            return (
              <div key="peer" className={`cell row__cell cell-${type}`}>
                {result.peer}
              </div>
            );
          }
          default: {
            return null;
          }
        }
      })}</div>
    );
  }
  getRows(results) {
    return results.map(({trackerInfo, result}) => this.getRow(trackerInfo, result));
  }
  render() {
    /**@type {SearchFragTableM}*/
    const table = this.props.table;

    let moreBtn = null;
    if (table.hasMoreBtn()) {
      moreBtn = (
        <a className="loadMore search__submit footer__loadMore" href="#more" onClick={table.handleMoreBtn}>{
          chrome.i18n.getMessage('loadMore')
        }</a>
      );
    }

    return (
      <div className="table table-results">
        <div className="table__head">
          <div className="row head__row">
            {this.getHeaderColumns()}
          </div>
          <div className="body table__body">
            {this.getRows(table.getSortedResults())}
          </div>
          <div className="footer table__footer">
            {moreBtn}
          </div>
        </div>
      </div>
    );
  }
}

export default Table;