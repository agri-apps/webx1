import rules from "./utils/rules";

const defaultOptions = {
  global: "$",
  appName: "App",
  metaTitlePrepend: "",
  routes: {},
  notFoundRouteName: "notfound",
  notFoundUrl: "/notfound",
};

export default async (options) => {
  let opts = Object.assign({}, defaultOptions, options);

  let cache = {
    routes: {
      "/": () => ({
        view: `<div>Webx Rocks!</div>`,
      }),
      notfound: () => ({
        view: `<div>404 Not Found!</div>`,
      }),
      error: () => ({
        view: "<div>An error has occurred!</div>",
      }),
    },
  };

  // routes  
  if (!rules.isEmptyObject(opts.routes)) {
    // prevalidate routes
    let routeErrors = {};
    for (var x in opts.routes) {
      if (opts.routes.hasOwnProperty(x)) {
        let route = opts.routes[x];        
        if (rules.isFunc(route)) {
          route = await route();
        }
        if (!route.view) {
          routeErrors[x] = [`A view property is required for route "${x}"`];
        }
      }
    }
    if (Object.keys(routeErrors).length) {
      throw new Error("Invalid route configuration", routeErrors);
    }
    cache.routes = opts.routes;
  }

  const getProxy = (app) => {
    let builtins = {
      setState: app.setState,
      getState: app.getState,
      dispatch: app.dispatch,
      listen: app.listen,
      refresh: app.refresh,
    };

    // Add plugin api's to proxy
    return Object.keys(app._plugins).reduce((prev, next) => {
      let plugin = app._plugins[next];
      if (plugin.api) {
        let ref = plugin.namespace ? plugin.namespace : plugin.name;
        if (!prev[ref]) {
          prev[ref] = plugin.api;
        } else {
          prev[ref] = Object.assign(prev[ref], plugin.api);
        }
      }
      return prev;
    }, builtins);
  };

  const app = {
    el: document.body,
    _currentPath: null,
    _currentRoute: null,
    _state: {},
    _listeners: [],
    _plugins: {},
    routes: { ...cache.routes },
    ok: true,
    plugin: (plugin, options = {}) => {
      if (!plugin.name) {
        throw new Error("A plugin must have a name property.");
      }
      if (!plugin.install || !rules.isFunc(plugin.install)) {
        throw new Error("A plugin must define an install method.");
      }
      if (app._plugins[plugin.name]) {
        throw new Error(
          `A plugin with the name: "${plugin.name} is already registered."`
        );
      }
      app._plugins[plugin.name] = plugin;
      try {
        let api = plugin.install(app, options);
        if (api) {
          app._plugins[plugin.name].api = api;
          // Add to window global
          if (plugin.global) {
            if (!window[plugin.global]) {
              window[plugin.global] = api;
            } else {
              window[plugin.global] = Object.assign(window[plugin.global], api);
            }
          }
          // Update app context
          app.ctx = getProxy(app);
        }
        if (options.installed && rules.isFunc(options.installed)) {
          options.installed();
        }
      } catch (err) {
        console.error(`Plugin "${plugin.name}" failed to install.`, err);
        if (options.onError && rules.isFunc(options.onError)) {
          options.onError(err);
        }
        delete app._plugins[plugin.name];
      }
    },
    getState: (...args) => {
      if (args.length) {
        return app._state[args[0]];
      }
      return { ...app._state };
    },
    setState: (key, value) => {
      let oldState = Object.freeze(JSON.parse(JSON.stringify(app._state)));
      app._state[key] = value;
      let newState = Object.freeze(JSON.parse(JSON.stringify(app._state)));
      // change listeners
      app._listeners.forEach((listener) => {
        listener("stateChange", newState, oldState, key, value);
      });
    },
    replaceState: (newState) => {
      let oldState = Object.freeze(JSON.parse(JSON.stringify(app._state)));
      app._state = newState;
      app._listeners.forEach((listener) => {
        listener("stateChange", newState, oldState, "*", newState);
      });
    },
    dispatch: (type, ...args) => {
      app._listeners.forEach((listener) => {
        listener.apply(null, [type, ...args]);
      });
    },
    listen: (handler) => {
      if (rules.isFunc(handler)) {
        app._listeners.push(handler);
        return () => {
          let idx = app._listeners.indexOf(handler);
          if (idx !== -1) {
            app._listeners.splice(idx, 1);
          }
        };
      } else {
        console.error("Listen handler must be a function", handler);
      }
    },
    refresh: () => {
      app.navigate(app._currentPath, true, true)
        .then(() => app.dispatch('refreshed', app._currentPath))      
    },
    renderView: async (view, state, meta) => {
      if (!rules.isFunc(view)) {
        throw new Error("renderView requires a function.");
      }

      if (app.el.renderView && rules.isFunc(app.el.renderView)) {
        try {
          await app.el.renderView(view, state, meta);
        } catch (err) {
          console.error("render async view error", err);
        }

        return;
      }

      try {
        app.el.innerHTML = await view(state);
      } catch (err) {
        console.error("Render view errror", err);
      }

      if (meta) {
        document.title = `${opts.metaTitlePrepend}${meta.title}`;
      }

      app.dispatch('view-rendered', { detail: view });
    },
    initRoute: async (route, state) => {
      const proxy = getProxy(app);

      if (rules.isFunc(route.init)) {
        await route.init(state, proxy, app.el);
      }
    },
    unmountRoute: (route) => {
      if (route && rules.isFunc(route.unmount)) {
        route.unmount(getProxy(app));
      }
    },
    routeInit: async (route, state) => {
      if (opts.routeInit && rules.isFunc(opts.routeInit)) {
        await opts.routeInit(route, state);
      }
    },
    navigate: async (pathName, force, refreshOnly) => {
      // don't fire same route unless forced
      if (!force && app._currentPath && app._currentPath === pathName) {
        return false;
      }
      const prevPath = app._currentPath;
      app._currentPath = pathName;
      let query = {};
      let params = {};

      const setRoute = async (path, xtra = {}) => {
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

        // Pre-render hook
        if (!refreshOnly) {
          try {
            let routeState = await app.routeInit(route, state);
            if (routeState && !rules.isEmptyObject(routeState)) {
              state = {...state, routeState};
            }
          } catch (err) {
            console.error("Pre-render failed:", err);
          }
        }

        // Render view
        try {
          await app.renderView(route.view, state, route.meta);
        } catch (err) {
          console.error("Render view failed", err);
        }

        // Initialize route
        try {
          await app.initRoute(route, state);
        } catch (err) {
          console.error(
            `Init route for "${route.name ? route.name : path}" failed`,
            err
          );
        }

        const { params = {} } = xtra;

        if (!refreshOnly) {
          app._listeners.forEach((listener) => {
            listener("pageChange", {
              from: prevPath,
              to: app._currentRoute,
              params,
              query,
            });
          });
        }
      };

      const { routes } = app;

      // Unmount current route, if any
      if (!refreshOnly) {
        if (app._currentRoute) {
          app.unmountRoute(app.routes[app._currentRoute]);
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
      app._currentRoute = opts.notFoundRouteName;
      setRoute(opts.notFoundUrl);
      return { path: pathName, route: undefined, query, params };
    },
    boot: async () => {
      // Runs on startup. Intended to be monkey patched in plugins.
    },
  };

  const mount = async (el) => {
    try {
      if (rules.isString(el)) {
        app.el = document.querySelector(el);
        if (!app.el) {
          throw new Error(`Invalid mount target: ${el}. Missing from the DOM.`);
        }
      } else {
        if (!rules.isNode(el) || !rules.isElement(el)) {
          throw new Error("Invalid DOM object for mount.");
        }
        app.el = el;
      }

      if (rules.isFunc(opts.init)) {
        // try to just invoke function;
        app._state = await opts.init();
      } else {
        app._state = opts.init || {};
      }

      if (opts.debug) {
        console.log("Initial app state", app._state);
      }

      window.onpopstate = async () => {
        await app.navigate(window.location.pathname);
      };

      app.global = opts.global;
      window[opts.global] = window[opts.global] || {};

      window[opts.global].navigate = async (pathName) => {
        window.history.pushState(
          {},
          pathName,
          window.location.origin + pathName
        );
        await app.navigate(pathName);
      };

      window[opts.global].dispatch = app.dispatch.bind(app);

      await app.boot();

      await app.navigate(window.location.pathname);

      return app;
    } catch (e) {
      return { ok: false, error: e };
    }
  };

  app.el = opts.node || document.body;

  // Expects plugins in array format plugins: [[plugin1, options1], [plugin2, options2]]
  if (opts.plugins && rules.isArray(opts.plugins)) {
    opts.plugins.forEach((plugin) => {
      app.plugin(plugin[0], plugin.length > 1 ? plugin[1] : {});
    });
  }

  // set the app context
  app.ctx = getProxy(app);

  if (opts.node && (rules.isElement(opts.node) || rules.isNode(opts.node))) {
    return mount(opts.node);
  }

  return mount(document.body);
};
