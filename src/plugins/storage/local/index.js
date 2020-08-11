const PLUGIN = "webx1LocalStoragePlugin";

const defaultOptions = { prefix: "" };

const install = (app, options) => {
  var opts = Object.assign({}, defaultOptions, options);

  const k = (key) => (opts.prefix ? `${opts.prefix}${key}` : key);

  const api = {
    local: {
      getItem: (key, parse = true) => {
        return parse
          ? JSON.parse(localStorage.getItem(k(key)))
          : localStorage.getItem(k(key));
      },
      setItem: (key, obj, json = true) => {
        json
          ? localStorage.setItem(k(key), JSON.stringify(obj))
          : localStorage.setItem(k(key), obj);
      },
      removeItem: (key) => {
        localStorage.removeItem(key);
      },
      keyval: (name, reducers = []) => {
        let storeKey = opts.prefix
          ? `${opts.prefix}${name}__set`
          : `${name}__set`;

        const getStore = () => {
          return api.local.getItem(storeKey) || { _meta: {} };
        };

        const reduce = (values) => {
          let meta = {};

          reducers.forEach((r) => {
            if (!r.id) {
              throw new Error(
                `[${PLUGIN}.local] A reducer must have an id property.`
              );            
            }
            if (!r.reduce || typeof r.reduce !== 'function') {
                throw new Error(
                    `[${PLUGIN}.local] A reducer must declare a reduce method.`
                  );  
            }
            meta[r.id] = r.reduce(values);
          });

          return meta;
        };

        const getKeys = () => Object.keys(getStore()).filter((x) => x.slice(0, 1) !== "_");

        const keyvalApi = {
          keys: getKeys,
          values: () => {
            let store = getStore();
            return getKeys().map((key) => {
              return store[key];
            });
          },
          getAll: () => {
            return getStore();
          },
          getItem: (key) => {
            return getStore()[key];
          },
          setItem: (key, val) => {
            let store = getStore() || {};
            store[key] = val;
            store._meta = reduce(store);
            api.local.setItem(storeKey, store);
          },
          removeItem: (key) => {
            let store = getStore() || {};
            delete store[key];
            store._meta = reduce(store);
            api.local.setItem(storeKey, store);
          },
          each: (handler) => {
            let store = getStore() || {};
            Object.keys(getStore()).forEach((key, idx) => {
              handler(store[key], key, idx);
            });
          },
        };

        return keyvalApi;
      },
    },
  };

  return api;
};

export default {
  name: PLUGIN,
  global: "$",
  namespace: "storage",
  install,
};
