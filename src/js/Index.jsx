import React from 'react';
import ReactDOM from 'react-dom';
import indexStyle from '../css/index.css';
import SearchForm from './components/SearchForm';


class Index extends React.Component {
  render() {
    return (
      <div className="search">
        <SearchForm/>
      </div>
    );
  }
}

ReactDOM.render(<Index/>, document.getElementById('root'));