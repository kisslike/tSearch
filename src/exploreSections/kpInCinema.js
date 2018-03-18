// ==UserScript==
// @name Кнопопоиск: в кино
// @connect *://kinopoisk.ru/*
// @version 1.0
// @actions {"icon":"update","title":"Update","command":"update"}
// ==/UserScript==

const onPageLoad = function (response) {

};

API_event('getItems', function () {
  return API_request({
    method: 'POST',
    url: '...'
  }).then(onPageLoad);
});

API_event('command', function (command) {
  switch (command) {
    case 'update': {
      return 'ok';
    }
  }
});