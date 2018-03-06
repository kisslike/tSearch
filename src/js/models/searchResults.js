const {types} = require('mobx-state-tree');


const search = types.model('search', {
  query: types.string,
  readyState: types.string, // loading, success, error
  authRequired: types.optional(types.boolean, false),
  results: types.array(types.string)
}).actions(self => {
  return {

  };
}).views(self => {
  return {
    getResultCount() {
      return self.results.length;
    }
  };
});

export default search;