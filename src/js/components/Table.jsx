import moment from "moment/moment";
import filesize from "filesize";
import {observer} from "mobx-react/index";
import React from "react";
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
  getHeaderColumn(type) {
    const name = chrome.i18n.getMessage('row_' + type);
    const nameShort = chrome.i18n.getMessage('row_' + type + '__short') || name;

    return (
      <a key={type} className={`cell row__cell cell-${type}`} href={'#cell-' + type}>
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
                   title={unixTimeToString(result.date)}>{unixTimeToFromNow(result.date)}</div>
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
            const sizeStr = filesize(result.size);
            let downloadLink = null;
            if (result.downloadUrl) {
              downloadLink = (
                <a className="cell__download" target="_blank" href={result.downloadUrl}>{
                  sizeStr + String.fromCharCode(160) + String.fromCharCode(8595)
                }</a>
              );
            } else {
              downloadLink = sizeStr;
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
    return (
      <div className="table table-results">
        <div className="table__head">
          <div className="row head__row">
            {this.getHeaderColumns()}
          </div>
          <div className="body table__body">
            {this.getRows(this.props.page)}
          </div>
          <div className="footer table__footer"/>
        </div>
      </div>
    );
  }
}

const unixTimeToString = function (unixtime) {
  return unixtime <= 0 ? '∞' : moment(unixtime * 1000).format('lll');
};
const unixTimeToFromNow = function (unixtime) {
  return unixtime <= 0 ? '∞' : moment(unixtime * 1000).fromNow();
};

export default Table;