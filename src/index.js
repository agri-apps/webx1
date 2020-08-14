import rules from "./utils/rules";

const defaultOptions = {
  debug: false,
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
    views: {},
    _routes: {},
    _computed: {},
    _waiting: { plugins: [] },
    routes: {
      "/": () => ({
        view: `<div>Webx Rocks!</div>`,
      }),
      ["/notfound"]: () => ({
        view: `<div>404 Not Found!</div>`,
      }),
      ["/error"]: () => ({
        view: "<div>An error has occurred!</div>",
      }),
    },
  };

  // routes
  // if (!rules.isEmptyObject(opts.routes)) {
  //   // prevalidate routes
  //   let routeErrors = {};
  //   for (var x in opts.routes) {
  //     if (opts.routes.hasOwnProperty(x)) {
  //       let route = opts.routes[x];
  //       if (rules.isFunc(route)) {
  //         route = await route() || { view: () => `<div>???</div>`, name: 'missing' }
  //         // default export check
  //         if (!route.view) {
  //           if (route.default) {
  //             route = route.default;
  //           }
  //         }
  //       }
  //       if (!route.view) {
  //         routeErrors[x] = [`A view property is required for route "${x}"`];
  //       }
  //     }
  //   }
  //   if (Object.keys(routeErrors).length) {
  //     if (opts.debug) {
  //       Object.values(routeErrors).forEach(val => console.error(val));
  //     }
  //     throw new Error("Invalid route configuration", routeErrors);
  //   }
  //}
  cache.routes = Object.assign({}, cache.routes, opts.routes);

  const getRoute = async (route) => {
    if (opts.debug) {
      console.log(`[debug] Resolving route`, route, rules.isString(route));
    }
    let rt = route;
    if (rules.isString(route)) {
      if (cache._routes[route]) {
        opts.debug
          ? console.log(`[debug] ${route} resolved from cache.`)
          : null;
        return cache._routes[route];
      }

      rt = cache.routes[route];
    }

    if (!rules.isFunc(rt)) {
      cache._routes[route] = rt;
      return rt;
    }

    let current = await rt();

    if (!current) {
      return null;
    }

    if (current.default) {
      cache._routes;
    }

    cache._routes[route] = current.default ? current.default : current;
    return cache._routes[route];
  };

  const getProxy = (app) => {
    let builtins = {
      setState: app.setState,
      getState: app.getState,
      dispatch: app.dispatch,
      listen: app.listen,
      refresh: app.refresh,
      computed: (name) => {
        let prop = app._computed[name];
        if (!prop) {
          return null;
        }
        return prop[0](app.getState());
      },
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
    debug: opts.debug,
    el: document.body,
    _currentPath: null,
    _currentRoute: null,
    _state: {},
    _listeners: [],
    _plugins: {},
    _computed: {},
    routes: { ...cache.routes },
    route: null,
    ok: true,
    plugin: async (plugin, options = {}) => {
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
        let api = await plugin.install(app, options);
        opts.debug
          ? console.log(`[debug] Plugin "${plugin.name}" installed.`)
          : null;
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
          await options.installed(plugin.name, api);
        }
      } catch (err) {
        console.error(`Plugin "${plugin.name}" failed to install.`, err);
        if (options.onError && rules.isFunc(options.onError)) {
          options.onError(err);
        }
        delete app._plugins[plugin.name];
      }
    },
    waitForPlugin: (name, handler) => {
      if (app.ctx && app.ctx[name]) {
        handler(app.ctx[name], app);
        return;
      }
      if (!cache._waiting.hasOwnProperty(name)) {
        cache._waiting[name] = [];
      }
      cache._waiting[name].push(handler);
    },
    getRoute,
    getState: (...args) => {
      let computedState = Object.keys(app._computed).reduce((prev, next) => {
        const [stateFn, changeFn] = app._computed[next];

        let run = !changeFn || !changeFn({ ...app._state, ...prev }, app.route);

        if (!run && !cache._computed[next]) {
          // not cached
          run = true;
        }

        if (run) {
          prev[next] = stateFn({ ...app._state, ...prev }, app.route);
          // only cache if a changeFn in supplied
          if (changeFn) {
            cache._computed[next] = JSON.parse(JSON.stringify(prev[next]));
          }
        }

        return prev;
      }, {});

      let appState = { ...app._state, ...computedState };

      if (args.length) {
        return appState[args[0]];
      }
      return appState;
    },
    setState: (key, value) => {
      let oldState = Object.freeze(JSON.parse(JSON.stringify(app.getState())));
      app._state[key] = value;
      // change listeners
      app._listeners.forEach((listener) => {
        listener("stateChange", app.getState(), oldState, key, value);
      });
    },
    replaceState: (newState) => {
      let oldState = Object.freeze(JSON.parse(JSON.stringify(app.getState())));
      app._state = newState;
      app._listeners.forEach((listener) => {
        listener("stateChange", app.getState(), oldState, "*", newState);
      });
    },
    computed: (propName, fn, changeFn) => {
      if (app._computed[propName]) {
        throw new Error(
          `A computed property named "${propName}" already exits!`
        );
      }
      if (!rules.isFunc(fn)) {
        throw new Error(`A computed property expects a function.`);
      }
      app._computed[propName] = [fn, changeFn];
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
      app
        .navigate(app._currentPath, true, true)
        .then(() => app.dispatch("refreshed", app._currentPath));
    },
    renderView: async (view, state, meta) => {
      let customRender = app.el.renderView && rules.isFunc(app.el.renderView);

      // Non function views
      if (!rules.isFunc(view)) {
        if (customRender) {
          app.el.renderView(view, state, meta);
        } else {
          app.el.innerHTML = `${view}`;
        }
        app.dispatch("view-rendered", { detail: { view, meta } });
        return;
      }

      if (!rules.isFunc(view)) {
        throw new Error("renderView requires a function.");
      }

      if (customRender) {
        try {
          await app.el.renderView(view, state, meta);
          app.dispatch("view-rendered", { detail: { view, meta } });
        } catch (err) {
          console.error("render async view error", err);
          app.dispatch("view-render-failed", { detail: view, error: err });
        }
        return;
      }

      try {
        app.el.innerHTML = await view(state);
      } catch (err) {
        console.error("Render view errror", err);
        app.dispatch("view-render-failed", { detail: view, error: err });
      }

      if (meta) {
        document.title = `${opts.metaTitlePrepend}${meta.title}`;
      }

      app.dispatch("view-rendered", { detail: { view, meta } });
    },
    initRoute: async (route, state) => {
      const proxy = getProxy(app);
      let rt = await getRoute(route);

      if (rules.isFunc(rt.init)) {
        await rt.init(state, proxy, app.el);
      }
    },
    unmountRoute: async (route) => {
      let rt = await getRoute(route);
      if (rt && rules.isFunc(rt.unmount)) {
        rt.unmount(getProxy(app));
      }
    },
    routeInit: async (route, state) => {
      let rt = await getRoute(route);
      let routeState = {};
      let proxy = getProxy(app);
      if (opts.routeInit && rules.isFunc(opts.routeInit)) {
        routeState = await opts.routeInit(rt, state, proxy) || {};
      }
      if (route.viewState && rules.isFunc(route.viewState)) {
        routeState = {...routeState, ...(await route.viewState(state, proxy))}
      }
      return routeState;
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
        let route = await getRoute(path);

        if (route === null) {
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
            if (t[0]) {
              prev[t[0]] = decodeURIComponent(t[1] || "");
            }
            return prev;
          }, {});

        app.route = {
          name: route.name,
          match: path,
          path: pathName,
          meta: route.meta,
          query,
          params: xtra.params || {},
        };

        let state = { ...app.getState(), ...xtra, query, path };

        // Pre-render hook
        if (!refreshOnly) {
          try {
            let routeState = await app.routeInit(route, state);
            if (routeState && !rules.isEmptyObject(routeState)) {
              state = { ...state, ...routeState };
            }
          } catch (err) {
            console.error("Pre-render failed:", err);
          }
        } else {
          // view state
          if (route.viewState && rules.isFunc(route.viewState)) {
            state = {...state, ...(await route.viewState(state, getProxy(app)))}
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

      //const { routes } = app;

      // Unmount current route, if any
      if (!refreshOnly) {
        if (app._currentRoute) {
          app.unmountRoute(await getRoute(app._currentRoute));
        }
      }

      // exact match
      if (await getRoute(pathName)) {
        app._currentRoute = pathName;
        await setRoute(pathName);
        return { path: pathName, route: pathName, query, params };
      }

      // param route w/fuzzy match logic
      let tokens = pathName.split("/").slice(1);
      let found = Object.keys(cache.routes).filter((x) => {
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
        await setRoute(found, { params });
        return { path: pathName, route: found, query, params };
      }
      // Not found
      app._currentRoute = opts.notFoundRouteName;
      await setRoute(opts.notFoundUrl);
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
        console.log("[debug] Initial app state", app.getState());
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

      await app.boot(getProxy(app));

      await app.navigate(window.location.pathname);

      return app;
    } catch (e) {
      return { ok: false, error: e };
    }
  };

  // computed
  // Expected format 'name': [stateFunc, runFunc]
  if (opts.computed) {
    Object.keys(opts.computed).forEach((compKey) => {
      opts.debug
        ? console.log(`[debug] Adding computed property "${compKey}".`)
        : null;
      app.computed(
        compKey,
        opts.computed[compKey][0],
        opts.computed[compKey][1]
      );
    });
  }

  app.el = opts.node || document.body;

  // Expects plugins in array format plugins: [[plugin1, options1], [plugin2, options2]]
  if (opts.plugins && rules.isArray(opts.plugins)) {
    opts.plugins.forEach(async (plugin) => {
      await app.plugin(plugin[0], plugin.length > 1 ? plugin[1] : {});
    });
  }

  // set the app context
  app.ctx = getProxy(app);

  // waiting for plugins
  Object.keys(cache._waiting).forEach(key => {
    let waiting = cache._waiting[key];
    let plugin = app.ctx ? app.ctx[key] : null;
    if (!plugin) {
      console.warn(`Waiting for "${key}", but does not exist as a plugin?`);
      return;
    }
    waiting.forEach(item => {
      item(plugin, app.ctx);
    });
  });
  cache._waiting = {};  

  if (opts.node && (rules.isElement(opts.node) || rules.isNode(opts.node))) {
    return mount(opts.node);
  }

  return mount(document.body);
};
