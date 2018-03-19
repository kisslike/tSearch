// ==UserScript==
// @name __MSG_name__
// @connect *://kinopoisk.ru/*
// @version 1.0
// @action {"icon":"update","title":"__MSG_update__","command":"update"}
// @locale ru {"name": "Кнопоиск: в кино", "update": "Обновить"}
// @locale en {"name": "Kinopoisk: in cinema", "update": "Update"}
// @defaultLocale en
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