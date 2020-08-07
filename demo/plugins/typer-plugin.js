const defaultOptions = { speed: 100 };

let typerPlugin = {
  name: "typer",
  global: "$",
  namespace: "typer",
  install: (app, options = {}) => {
    console.log('installing typer plugin', JSON.stringify(Object.keys(app._plugins)));
    let opts = Object.assign({}, defaultOptions, options);
    let rootEl = opts.scope ? document.querySelector(opts.scope) : app.el;
    let origInitRoute = app.initRoute;

    const run = () => {
        [].slice.call(rootEl.querySelectorAll("[data-typer]")).forEach((el) => {
            let text = el.dataset["typer"] || el.textContent;
            let speed = el.hasAttribute("data-speed")
              ? parseInt(el.dataset["speed"])
              : opts.speed;
            typewriter(text, speed, el.hasAttribute('data-replace'), el.hasAttribute('data-repeat'), el.getAttribute('data-append')).typeIt(el, text);
          });
    }

    app.initRoute = async (route, state) => {
      await origInitRoute.call(app, route, state);
        run();      
    };

    function typewriter(text, speed, replace = false, repeat = false, append = '') {
      let i = 0;
      let txt = text;
      let origText = text;

      if (!speed) {
        speed = 100;
      }

      const api = {
        typeIt: function (el, str) {
          let ts;
          if (str) {
            txt = str;
            i = 0;
          }
          if (el) {
            api.el = el;
          }

          if (i < txt.length) {
            el.textContent = replace ? txt.charAt(i) : (el.textContent + txt.charAt(i));
            if (append) {
                el.textContent = el.textContent + append
            }
            i++;
            ts = setTimeout(api.typeIt.bind(null, el), speed);
          } else {
              if (repeat) {
                  el.textContent = '';
                  ts = setTimeout(api.typeIt.bind(null, el, origText))
              }
          }
          return {
              stop: () => {
                  if (ts) {
                    clearTimeout(ts);
                  }                
              }
          }
        },
      };
      return api;
    }

    return {
      typeIt: (el, text, speed = opts.speed, replace) => {
        return typewriter(text, speed, replace).typeIt(el, text);
      },
      run
    };
  },
};
