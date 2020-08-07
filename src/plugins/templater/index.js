const defaultOptions = { clobber: true };

export default {
  name: "webx1TemplaterPlugin",
  global: "$",
  namespace: "template",
  install: (app, options = {}) => {
    const templateCache = {};
    const listeners = {};

    let opts = Object.assign({}, defaultOptions, options);
    let rootEl = opts.scope ? document.querySelector(opts.scope) : app.el;

    function Templater(templateText) {
      return new Function(
        "page",
        "var output=" +
          JSON.stringify(templateText)
            .replace(/<%=(.+?)%>/g, '"+($1)+"')
            .replace(/<%(.+?)%>/g, '";$1\noutput+="') +
          ";return output;"
      );
    }

    const api = {
      init: () => {
        let templates = [].slice.call(
          rootEl.querySelectorAll('script[type="text/template"]')
        );
        templates.forEach((template) => {
          let id = template.getAttribute("id");
          if (id && template.textContent) {
            templateCache[id] = Templater(template.textContent);
          }
        });
      },
      register: (name, templateText) => {
        if (templateCache[name]) {
            if (!opts.clobber) {
                throw new Error(`A template named "${name}" is already registered!`);
            }
        }
        templateCache[name] = Templater(templateText);
        if (listeners[name]) {
            listeners[name].forEach(handler => {
                handler(templateCache[name]);
            });
        }
      },
      registerFromUrl: async (name, url, onError) => {
        if (templateCache[name] && !opts.clobber) {
          onError
            ? onError(
                `A template with the name "${name}" is already registered!`
              )
            : null;
          return;
        }

        try {
            let res = await fetch(url);
            let templateText = await res.text();
            templateCache[name] = Templater(templateText);
            if (listeners[name]) {
                listeners[name].forEach(handler => {
                    handler(templateCache[name]);
                });
            }
        } catch (err) {
            if (app.debug) {
                console.error(`[webx1TemplaterPlugin] Failed to fetch remote template`, err);
            }
            onError && onError(err);
        }
      },
      ready: (name, callback) => {
        if (!listeners[name]) {
            listeners[name] = [];
        }
        listeners[name].push(callback);

        if (templateCache[name]) {
            callback(templateCache[name]);
        }
      },
      render: (name, obj) => {
        if (!templateCache[name]) {
          throw new Error(
            `Unknown template "${name}". Did you register it first?`
          );
        }
        return templateCache[name](obj);
      },
      renderTo(name, obj, el, callback) {
        let elem = el;
        if (!el) {
          throw new Error("An element is required to bind!");
        }
        if (typeof el === "string") {
          elem = document.querySelector(el);
        }

        if (!templateCache[name]) {
          console.warn(
            `[webx1TemplaterPlugin] Missing template "${name}" on bind! Is it registered?`
          );
          return;
        }
        elem.innerHTML = templateCache[name](obj);
        if (callback && typeof callback === "function") {
          callback(el, name, obj);
        }
      },
    };

    return api;
  },
};
