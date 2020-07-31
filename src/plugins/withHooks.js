import rules from "./../utils/rules";

export default (app, options = {}) => {
  app.hooks = app.hooks || {};
  app.hooks.preRender = [];
  app.hooks.preRoute = [];
  app.hooks.preState = [];

  Object.keys(app.hooks).forEach(key => {
      let hook = options[key];
      if (hook && rules.isFunc(hook)) {
        app.hooks[key].push(hook);
      }
  })

  const appProxy = {
    setState: app.setState,
    getState: app.getState,
    refresh: app.refresh,
  };

  const applyHook = (name, state) => {
    if (app.debug) {
      console.log('applying hook', hook, state);
    }
    if (!app.hooks[name]) {
      return state;
    }
    let hookState = app.hooks[name].reduce(
      (prev, curr) => {
        prev = curr(prev);
        return prev;
      },
      { ...state }
    );
    return hookState;
  };

  // preState hook
  let appSetState = app.setState;

  app.setState = (key, value) => {
    let preState = applyHook("preState", { key, value });
    return appSetState.call(app, preState.key, preState.value);
  };

  // preRoute hook
  let appNavigate = app.navigate;
  let appRenderView = app.renderView;

  app.navigate = async (pathName, force) => {
    let preRoute = applyHook("preRoute", {
      pathName,
      state: { ...app.getState() },
    });
    // Redirects
    if (preRoute.redirect) {
      return await appNavigate.call(app, preRoute.redirect, true);
    }
    // Custom routes
    if (preRoute.route) {
      if (preRoute.route.init && rules.isFunc(preRoute.route.init)) {
        preRoute.route.init(preRoute.state, app.proxy, app.el);
      }

      return await appRenderView.call(app, preRoute.route.view, preRoute.state);
    }
    return await appNavigate(preRoute.pathName, force);
  };

  // preRender hook
  app.renderView = async (view, state = {}, meta = {}) => {

    let preRender = applyHook("preRender", { view, state: {...state}, meta });

    return await appRenderView.call(app, preRender.view, preRender.state, preRender.meta);
  };

  if (options.install && rules.isFunc(options.install)) {
    options.install();
  }

  return app;
};
