import getCodeMeta from "./getCodeMeta";

const fieldType = {
  name: '*string',
  version: '*string!version',
  author: 'string',
  description: 'string',
  homepageURL: 'string',
  icon: 'string',
  icon64: 'string',
  siteURL: 'string',
  updateURL: 'string',
  downloadURL: 'string',
  supportURL: 'string',
  require: 'array',
  connect: '*array!connect',
  action: 'array!action',
  locale: 'object!locale',
  defaultLocale: 'string',
};

const getExploreSectionCodeMeta = function (code) {
  const result = getCodeMeta(code, fieldType);

  result.actions = result.action;
  delete result.action;

  result.locales = result.locale;
  delete result.locale;

  return result;
};

export default getExploreSectionCodeMeta;