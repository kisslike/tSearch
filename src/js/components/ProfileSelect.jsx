import React from "react";
import {observer} from "mobx-react/index";


@observer class ProfileSelect extends React.Component {
  constructor() {
    super();

    this.handleSelect = this.handleSelect.bind(this);
  }

  handleSelect() {
    const store = this.props.store;
    const value = this.refs.select.value;
    store.changeProfile(value);
  }

  render() {
    const store = this.props.store;
    const options = [];
    store.profiles.forEach(profile => {
      options.push(
        <option key={profile.name} value={profile.name}>{profile.name}</option>
      );
    });

    return (
      <select ref="select" className="profile__select" defaultValue={store.profile.name} onChange={this.handleSelect}>
        {options}
      </select>
    );
  }
}

export default ProfileSelect;