// ==UserScript==
// @name __MSG_name__
// @connect *://*.kinopoisk.ru/*
// @version 1.0
// @action {"icon":"update","title":"__MSG_update__","command":"update"}
// @locale ru {"name": "Кнопоиск: в кино", "update": "Обновить"}
// @locale en {"name": "Kinopoisk: in cinema", "update": "Update"}
// @defaultLocale en
// ==/UserScript==

var kpGetImgFileName = function (url) {
  var bigImgUrl = url.replace(/sm_film/, 'film');
  return bigImgUrl;
};

var kpRmRuntime = function (text) {
  return text.replace(/\s+\d+\s+.{3}\.$/, '').trim();
};

var kpGetYear = function (text) {
  var m = /\s+\([^)]*([1-2]\d{3})[^)]*\)$/.exec(text);
  return m && parseInt(m[1]);
};

var kpRmYear = function (text) {
  return text.replace(/\s+\([^)]*([1-2]\d{3})[^)]*\)$/, '').trim();
};

var spaceReplace = function (text) {
  return text.replace(/[\s\xA0]/g, ' ');
};

var checkResult = function (obj) {
  for (var key in obj) {
    obj[key] = obj[key] && spaceReplace(API_deSanitizeHtml(obj[key])).trim();
    if (typeof obj[key] !== 'string' || !obj[key]) {
      if (key === 'title_en') {
        // console.debug('Original title is not found!', obj);
        obj[key] = undefined;
        continue;
      }
      return false;
    }
  }
  return true;
};

const onPageLoad = function (response) {
  const content = response.body;
  const doc = API_getDoc(content, response.url);

  var threeD = doc.querySelectorAll('div.filmsListNew > div.item div.threeD');
  for (var i = 0, el; el = threeD[i]; i++) {
    var parent = el.parentNode;
    parent && parent.removeChild(el);
  }

  var nodes = doc.querySelectorAll('div.filmsListNew > div.item');
  var arr = [];
  [].slice.call(nodes).forEach(function (el) {
    var img = el.querySelector('div > a > img');
    img = img && img.src;
    img = img && kpGetImgFileName(img);

    var title = el.querySelector('div > div.name > a');
    title = title && title.textContent.trim();

    var titleEn = el.querySelector('div > div.name > span');
    titleEn = titleEn && titleEn.textContent.trim();
    titleEn = titleEn && kpRmRuntime(titleEn);
    if (/^\([^)]+\)$/.test(titleEn)) {
      titleEn = '';
    }

    var url = el.querySelector('div > div.name > a');
    url = url && url.href;

    var obj = {
      img: img,
      title: title,
      title_en: titleEn,
      url: url
    };

    if (obj.title_en) {
      var year = kpGetYear(obj.title_en);
      if (year) {
        obj.title_en = kpRmYear(obj.title_en);
        obj.title_en += ' ' + year;
        obj.title += ' ' + year;
      }
    }

    if (checkResult(obj)) {
      arr.push(obj);
    } else {
      console.debug("Explorer kp_in_cinema have problem!");
    }
  });
  return arr;
};

API_event('getItems', function () {
  const items = [];
  let promise = Promise.resolve();
  /*['0', '1', '2'].forEach(page => {
    promise = promise.then(() => {
      return API_request({
        method: 'GET',
        url: `https://www.kinopoisk.ru/afisha/new/page/${page}/`
      }).then(response => {
        return onPageLoad(response);
      }).then(_items => {
        items.push(..._items);
      }, err => {
        console.error('Page load error', err);
      });
    });
  });*/
  return promise.then(() => items);
});

API_event('command', function (command) {
  switch (command) {
    case 'update': {
      return 'ok';
    }
  }
});