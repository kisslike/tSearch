// ==UserScript==
// @name __MSG_name__
// @connect *://*.kinopoisk.ru/*
// @version 1.0
// @action {"icon":"update","title":"__MSG_update__","command":"update"}
// @locale ru {"name": "Кнопоиск: в кино", "update": "Обновить"}
// @locale en {"name": "Kinopoisk: in cinema", "update": "Update"}
// @defaultLocale en
// ==/UserScript==

const kpGetImgFileName = url => {
  return url.replace(/sm_film/, 'film');
};

const kpRmRuntime = text => {
  return text.replace(/\s+\d+\s+.{3}\.$/, '').trim();
};

const kpGetYear = text => {
  const m = /\s+\([^)]*([1-2]\d{3})[^)]*\)$/.exec(text);
  return m && parseInt(m[1]);
};

const kpRmYear = text => {
  return text.replace(/\s+\([^)]*([1-2]\d{3})[^)]*\)$/, '').trim();
};

const spaceReplace = text => {
  return text.replace(/[\s\xA0]/g, ' ');
};

const checkResult = obj => {
  for (let key in obj) {
    obj[key] = obj[key] && spaceReplace(obj[key]).trim();
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

const onPageLoad = response => {
  const content = response.body;
  const doc = API_getDoc(content, response.url);

  const threeD = doc.querySelectorAll('div.filmsListNew > div.item div.threeD');
  for (let i = 0, el; el = threeD[i]; i++) {
    const parent = el.parentNode;
    parent && parent.removeChild(el);
  }

  const nodes = doc.querySelectorAll('div.filmsListNew > div.item');
  const arr = [];
  [].slice.call(nodes).forEach(function (el) {
    let img = el.querySelector('div > a > img');
    img = img && img.src;
    img = img && kpGetImgFileName(img);

    let title = el.querySelector('div > div.name > a');
    title = title && title.textContent.trim();

    let titleEn = el.querySelector('div > div.name > span');
    titleEn = titleEn && titleEn.textContent.trim();
    titleEn = titleEn && kpRmRuntime(titleEn);
    if (/^\([^)]+\)$/.test(titleEn)) {
      titleEn = '';
    }

    let url = el.querySelector('div > div.name > a');
    url = url && url.href;

    const obj = {
      img: img,
      title: title,
      title_en: titleEn,
      url: url
    };

    if (obj.title_en) {
      const year = kpGetYear(obj.title_en);
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

API_event('getItems', () => {
  const items = [];
  let promise = Promise.resolve();
  ['0', '1', '2'].forEach(page => {
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
  });
  return promise.then(() => items);
});

API_event('command', command => {
  switch (command) {
    case 'update': {
      return 'ok';
    }
  }
});