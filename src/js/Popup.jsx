import React from 'react';
import ReactDOM from 'react-dom';
import popupStyle from '../css/popup.less';
import SearchForm from './components/SearchForm';
import searchFrom from "./models/searchForm";


class Popup extends React.Component {
  render() {
    return (
      <div className="search">
        <SearchForm store={{searchForm: searchFrom.create({})}}/>
      </div>
    );
  }
}

ReactDOM.render(<Popup/>, document.getElementById('root'));