// ==UserScript==
// @name Кнопопоиск: в кино
// @connect *://kinopoisk.ru/*
// @version 1.0
// ==/UserScript==

const onPageLoad = function (response) {

};

API_event('getItems', function() {
    return API_request({
        method: 'POST',
        url: '...'
    }).then(onPageLoad);
});