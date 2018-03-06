const {types} = require('mobx-state-tree');


const lastSearch = types.model('lastSearch', {
  query: types.string,
  readyState: types.string, // loading, success, error
  authRequired: types.optional(types.boolean, false),
  results: types.array(types.string)
}).actions(self => {
  return {

  };
}).views(self => {
  return {

  };
});

export default lastSearch;