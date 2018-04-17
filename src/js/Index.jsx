import Filters from "./components/Filters";
import React from 'react';
import ReactDOM from 'react-dom';
import indexStyle from '../css/index.less';
import dialogStyle from '../css/dialog.less';
import SearchForm from './components/SearchForm';
import indexModel from './models/index';
import {observer} from 'mobx-react';
import ProfileSelect from './components/ProfileSelect';
import ScrollTop from './components/ScrollTop';
import Trackers from './components/Trackers';
import {HashRouter, Route, Link} from 'react-router-dom';
import SearchFrag from './components/SearchFrag';
import Explore from "./components/Explore";

const debug = require('debug')('Index');
const qs = require('querystring');


@observer class Index extends React.Component {
  constructor() {
    super();

    this.store = indexModel.create({});
  }
  render() {
    if (this.store.state === 'loading') {
      return ('Loading...');
    } else
    if (this.store.state === 'error') {
      return ('Error');
    } else
    if (this.store.state === 'ready') {
      if (this.store.profile.state === 'loading') {
        return ('Loading profile...');
      } else
      if (this.store.profile.state === 'done') {
        return (
          <Main store={this.store}/>
        );
      }
    }
  }
}

@observer class Main extends React.Component {
  render() {
    return (
      <HashRouter>
        <div>
          <div key="head" className="body__head">
            <div className="search">
              <IndexSearchForm store={this.props.store}/>
            </div>
            <div className="menu">
              <Link to="/" className="menu__btn menu__btn-main" title={chrome.i18n.getMessage('main')}/>
              <a href="history.html" className="menu__btn menu__btn-history" title={chrome.i18n.getMessage('history')}/>
              <a href="options.html" className="menu__btn menu__btn-options" title={chrome.i18n.getMessage('options')}/>
            </div>
          </div>
          <div key="body" className="content content-row">
            <div className="parameter_box">
              <div className="parameter_box__left">
                <div className="parameter parameter-profile">
                  <div className="profile_box">
                    <ProfileSelect store={this.props.store}/>
                    <a href="#manageProfiles" title={chrome.i18n.getMessage('manageProfiles')}
                       className="button-manage-profile"/>
                  </div>
                </div>
                <div className="parameter parameter-tracker">
                  <Trackers store={this.props.store}/>
                </div>
              </div>
              <Filters store={this.props.store}/>
            </div>
            <div className="main">
              <Route exact path="/" component={props => {
                return (
                  <Explore store={this.props.store} {...props}/>
                );
              }}/>
              <Route path="/search" component={props => {
                return (
                  <SearchFrag store={this.props.store} {...props}/>
                );
              }}/>
            </div>
          </div>
          <ScrollTop key="scroll_top"/>
        </div>
      </HashRouter>
    );
  }
}

@observer class IndexSearchForm extends SearchForm {
  constructor() {
    super();

    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleSubmit(e) {
    e.preventDefault();
    location.hash = '#/search?' + qs.stringify({
      query: this.props.store.searchForm.query
    });
  }
}

window.app = ReactDOM.render(<Index/>, document.getElementById('root'));