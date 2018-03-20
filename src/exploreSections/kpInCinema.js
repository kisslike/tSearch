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

const spaceReplace = text => {
  return text.replace(/[\s\xA0]/g, ' ');
};

const parseInfo = text => {
  const m = /^(?:(.*)\s+|)\((\d{4})\)\s+\d+\s+.{3}\.$/.exec(text);
  if (m) {
    return {
      title: m[1],
      year: parseInt(m[2], 10)
    };
  }
};

const validateItem = item => {
  Object.keys(item).forEach(key => {
    if (!item[key]) {
      throw new Error(`Item ${key} is empty!`);
    }
  });
};

const onPageLoad = response => {
  const content = response.body;
  const doc = API_getDoc(content, response.url);

  const results = [];
  Array.from(doc.querySelectorAll('div.filmsListNew > div.item')).forEach(function (item) {
    try {
      let poster = null;
      const posterNode = item.querySelector('.poster img[src]');
      if (posterNode) {
        poster = kpGetImgFileName(posterNode.src);
      }

      let title = null;
      let url = null;
      const linkNode = item.querySelector('.info .name a');
      if (linkNode) {
        title = spaceReplace(linkNode.textContent.trim());
        url = linkNode.href;
      }

      let year = null;
      let titleEn = null;
      const infoNode = item.querySelector('.info .name span');
      if (infoNode) {
        const info = parseInfo(spaceReplace(infoNode.textContent).trim());
        if (info) {
          titleEn = info.title;
          year = info.year;
        }
      }

      const result = {
        img: poster,
        title: title,
        extra: {
          year: year
        },
        url: url
      };

      if (titleEn) {
        result.extra.titleEn = titleEn;
      }

      validateItem(result);

      results.push(result);
    } catch (err) {
      console.error('Parse item error', err);
    }
  });
  return results;
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