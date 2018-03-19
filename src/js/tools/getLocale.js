const getLocale = (defaultLocale, locales) => {
  const languages = [];
  const uiLang = chrome.i18n.getUILanguage();
  const m = /([^-]+)/.exec(uiLang);
  if (m) {
    languages.push(m[1]);
  }
  languages.push(defaultLocale);

  let result = null;
  languages.some(language => {
    return result = locales && locales[language];
  });

  return result;
};

export default getLocale;