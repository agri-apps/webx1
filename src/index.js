import rules from "./utils/rules";

const defaultOptions = {
  global: "$",
  appName: "App",
  routes: {},
};

if (typeof window !== "undefined") {
  window.appRules = rules;
}

export default createApp = async (options) => {
  let opts = Object.assign({}, defaultOptions, options);

  let cache = {
    routes: {
      "/": () => ({
        view: `<div>Webx Rocks!</div>`,
      }),
    },
  };

  // routes
  if (!rules.isEmptyObject(opts.routes)) {
    // prevalidate routes
    let routeErrors = {};
    for (var x in opts.routes) {
      if (opts.routes.hasOwnProperty(x)) {
        if (!opts.routes[x].view) {
          routeErrors[x] = [`A view property is required for route "${x}"`];
        }
      }
    }
    if (Object.keys(routeErrors).length) {
      throw new Error("Invalid route configuration", routeErrors);
    }
    cache.routes = opts.routes;
  }

  const app = {
    el: document.body,
    _currentPath: null,
    _currentRoute: null,
    _state: {},
    _listeners: [],
    routes: { ...cache.routes },
    ok: true,
    getState: () => ({ ...app._state }),
    setState: (key, value) => {
      let oldState = Object.freeze(JSON.parse(JSON.stringify(app._state)));
      app._state[key] = value;
      let newState = Object.freeze(JSON.parse(JSON.stringify(app._state)));
      // change listeners
      app._listeners.forEach((listener) => {
        listener("stateChange", newState, oldState, key, value);
      });
      let evt = new CustomEvent("appStateChanged", {
        detail: {
          type: "stateChange",
          newState,
          oldState,
          key: key,
          value: value,
        },
      });
      app.el.dispatchEvent(evt);
    },
    listen: (handler) => {
      if (rules.isFunc(handler)) {
        app._listeners.push(handler);
      } else {
        console.error("Listen handler must be a function", handler);
      }
    },
    refresh: () => {
      app.navigate(app._currentPath, true);
    },
    renderView: async (view, state, meta) => {
      if (!rules.isFunc(view)) {
        throw new Error("renderView requires a function.");
      }

      if (app.el.renderView && rules.isFunc(app.el.renderView)) {
        if (rules.isAsyncFunc(app.el.renderView)) {
          try {
            await app.el.renderView(view, state, meta);
          } catch (err) {
            console.error("render async view error", err);
          }
        } else {
          app.el.renderView(view, state, meta);
        }

        return;
      }

      console.log("async view", rules.isAsyncFunc(view));

      if (rules.isAsyncFunc(view)) {
        try {
          app.el.innerHTML = await view(state);
        } catch (err) {
          console.error("Render view errror", err);
        }
      } else {
        app.el.innerHTML = view(state);
      }

      if (meta) {
        document.title = meta.title;
      }
    },
    navigate: async (pathName, force) => {
      // don't fire same route unless forced
      if (!force && app._currentPath && app._currentPath === pathName) {
        return false;
      }
      const prevPath = app._currentPath;
      app._currentPath = pathName;
      let query = {};
      let params = {};

      const proxy = {
        setState: app.setState,
        getState: app.getState,
        refresh: app.refresh,
      };

      const setRoute = async (path, xtra = {}) => {       

        console.log("routes", path, routes);
        let route = routes[path];        

        if (!route) {
          route = routes["/notfound"] || {
            view: () => `<div class="page">404 Not Found</div>`,
          };
        }

        app._currentRoute = path;

        query = location.search
          .slice(1)
          .split("&")
          .reduce((prev, curr) => {
            let t = curr.split("=");
            prev[t[0]] = decodeURIComponent(t[1] || "");
            return prev;
          }, {});
        let state = { ...app.getState(), ...xtra, query, path };

        // Render view
        try {
          await app.renderView(route.view, state, route.meta);
          console.log("view rendered", app.el.innerHTML);
        } catch (err) {
          console.error(err);
        }

        // Initialize route
        if (rules.isFunc(route.init)) {
          if (rules.isAsyncFunc(route.init)) {
            await route.init(state, proxy, app.el);
          } else {
            route.init(state, proxy, app.el);
          }
        }

        const { params = {} } = xtra;

        app._listeners.forEach((listener) => {
          listener("pageChange", {
            from: prevPath,
            to: app._currentRoute,
            params,
            query,
          });
        });
      };

      const { routes } = app;

      // Unmount current route, if any
      if (app._currentRoute) {
        let route = app.routes[app._currentRoute];
        if (route && rules.isFunc(route.unmount)) {
          route.unmount(proxy);
        }
      }

      // exact match
      if (routes[pathName]) {
        app._currentRoute = pathName;
        setRoute(pathName);
        return { path: pathName, route: pathName, query, params };
      }

      // param route w/fuzzy match logic
      let tokens = pathName.split("/").slice(1);
      let found = Object.keys(routes).filter((x) => {
        return (
          x.indexOf(`/${tokens[0]}`) !== -1 &&
          x.split("/").slice(1).length === tokens.length
        );
      })[0];

      if (found) {        
        found
          .split("/")
          .slice(2)
          .forEach((n, x) => {
            params[n.slice(1)] = tokens[x + 1];
          });
        setRoute(found, { params });
        return { path: pathName, route: found, query, params };
      }
      // Not found
      app._currentRoute = "notfound";
      setRoute("/notfound");
      return { path: pathName, route: undefined, query, params };
    },
  };

  return {
    mount: async (el) => {
      try {
        if (rules.isString(el)) {
          app.el = document.querySelector(el);
          if (!app.el) {
            throw new Error(
              `Invalid mount target: ${el}. Missing from the DOM.`
            );
          }
        } else {
          if (!rules.isNode(el) || !rules.isElement(el)) {
            throw new Error("Invalid DOM object for mount.");
          }
          app.el = el;
        }

        if (rules.isFunc(opts.init)) {
          opts.debug &&
            console.log(
              "App state from function. Is async: ",
              rules.isAsyncFunc(opts.init) ? "yes" : "no"
            );
          // try to just invoke function;
          app._state = rules.isAsyncFunc(opts.init)
            ? await opts.init()
            : opts.init();
          console.log("func app state", app._state);
        } else {
          app._state = opts.init || {};
        }

        if (opts.debug) {
          console.log("Initial app state", app._state);
        }

        window.onpopstate = async () => {
          await app.navigate(window.location.pathname);
        };

        window[opts.global] = window[opts.global] || {};

        window[opts.global].navigate = async (pathName) => {
          window.history.pushState(
            {},
            pathName,
            window.location.origin + pathName
          );
          await app.navigate(pathName);
        };

        await app.navigate(window.location.pathname);

        return app;
      } catch (e) {
        return { ok: false, error: e };
      }
    },
  };
};
