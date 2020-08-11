import { isDomObject } from "./../../utils/dom";

const PLUGIN = "webx1i18nPlugin";

const defaultOptions = {
  fallback: "en",
  languageFilesDir: "/i18n",
};

const getUserLang = (fallback) => {
  var lang = navigator.languages ? navigator.languages[0] : navigator.language;

  return lang ? lang.substr(0, 2) : fallback;
};

const install = async (app, options) => {
  let opts = Object.assign({}, defaultOptions, options);
  let rootEl = document.querySelector(opts.scope) || app.el || document.body;

  const lang = opts.language ? opts.language : getUserLang(opts.fallback);

  const translateText = (str, translations) => {
    return (str || "")
      .split(".")
      .reduce((obj, i) => obj[i], translations || {});
  };

  const translatePage = (root, translations) => {
    console.log("translating page", root, translations);

    api._elements = [].slice.call(root.querySelectorAll("[data-i18n]"));
    api._elements.forEach((el) => {
      let text = translateText(el.dataset.i18n, translations);
      if (text) {
        el.innerHTML = text;
      }
    });
  };

  const api = {
    _elements: [],
    currentLanguage: null,
    translations: {},
    load: async (lang) => {
      try {
        let res = await fetch(`${opts.languageFilesDir}/${lang}.json`);
        let json = await res.json();
        api.translations = json;
        api.currentLanguage = lang;

        return json;
      } catch (err) {
        console.error(
          `[${PLUGIN}] Unable to load "${lang}" translations.`,
          err
        );
      }
    },
    translate: (elemOrText) => {

      if (!api.translations) {
          // race condition
          api.load(api.currentLanguage || opts.lang)
            .then(() => {
                api.translate(elemOrText);
            })
          return;
      }

      if (!elemOrText) {
        return translatePage(rootEl, api.translations);
      }
      if (typeof elemOrText === "string") {
        return translateText(elemOrText, api.translations);
      } else if (isDomObject(elemOrText)) {
        return translatePage(elemOrText, api.translations);
      } else if (Array.isArray(elemOrText)) {
        return elemOrText.reduce((prev, curr) => {
          prev.push(translateText(curr), api.translations);
          return prev;
        }, []);
      }
    },
  };

  app.listen(function (name) {
      if (name === "view-rendered") {
          if (!api.translations || !Object.keys(api.translations).length) {
              api.load(lang)
                .then(() => {
                    api.translate();
                })
          } else {
            api.translate();
          }
      }
  });

  let origBoot = app.boot;

  app.boot = async (...args) => {
      origBoot.apply(app, args);

      try {
        let translations = await api.load(lang);
        app.setState('translations', translations);
        app.setState('language', lang);
      } catch (err) {
        console.error(`[${PLUGIN}] Unable to load "${lang}" translations.`, err);
      }

  }

  return api;
};

export default {
  name: PLUGIN,
  global: "t",
  namespace: "i18n",
  install,
};
