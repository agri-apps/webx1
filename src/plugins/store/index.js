import Store from "./store.js";
const PLUGIN = "webx1StorePlugin";

const defaultOptions = {
  changeEvent: "change",
  stores: [],
};

export default {
  name: PLUGIN,
  global: "$",
  namespace: "store",
  install: async (app, options) => {
    let _stores = [];
    const opts = Object.assign({}, defaultOptions, options);

    const api = {
      registerStore: async (name, config) => {
        if (_stores[name]) {
          throw new Error(
            `[${PLUGIN}] A store named "${name}" is already registered.`
          );
        }

        const { changeEvent = opts.changeEvent, state, ...proto } = config;

        const setStoreState = (name, obj) => {
            if (_stores[name]) {
                _stores[name].replaceState(obj, true);
            }
        }

        let initState = state;
        if (state && typeof state === 'function') {
            initState = await state(setStoreState, app);
        } else if (!state) {
            initState = {}
        }

        const ctx = () =>
          opts.context
            ? typeof opts.context === "function"
              ? opts.context(app)
              : opts.context
            : app.ctx;

        const store = Store(config.state, changeEvent, ctx).extend({
          name,
          state: initState,
          ...proto,
        });
        _stores[name] = store;

        return store;
      },
      getStore: (name) => {
        return _stores[name];
      },
      removeStore: (name) => {
        delete _stores[name];
      },
    };

    if (opts.stores)
      [
        Object.keys(opts.stores).forEach(async (storeKey) => {
          let store = opts.stores[storeKey];
          await api.registerStore(storeKey, store);
        }),
      ];

    return api;
  },
};
