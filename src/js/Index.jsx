import React from 'react';
import ReactDOM from 'react-dom';
const indexStyle = require('../css/index.css');
import SearchForm from './components/SearchForm';


class Index extends React.Component {
  render() {
    return ([
      <div key="head" className="body__head">
        <div className="search">
          <SearchForm/>
        </div>
        <div className="menu">
          <a href="#main" className="menu__btn menu__btn-main" title={chrome.i18n.getMessage('main')}/>
          <a href="history.html" className="menu__btn menu__btn-history" title={chrome.i18n.getMessage('history')}/>
          <a href="options.html" className="menu__btn menu__btn-options" title={chrome.i18n.getMessage('options')}/>
        </div>
      </div>,

    ]);
  }
}

ReactDOM.render(<Index/>, document.getElementById('root'));