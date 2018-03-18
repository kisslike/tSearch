// ==UserScript==
// @name Кнопопоиск: в кино
// @connect *://kinopoisk.ru/*
// @version 1.0
// @actions {"type":"update","title":"Update","event":"update"}
// ==/UserScript==

const onPageLoad = function (response) {

};

API_event('getItems', function() {
    return API_request({
        method: 'POST',
        url: '...'
    }).then(onPageLoad);
});

API_event('update', function() {
    return 'ok';
});