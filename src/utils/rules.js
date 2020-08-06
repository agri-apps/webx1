const rules = {
    isArray: (o) => {
        return Array.isArray(o);
    },
    isString: (o) => {
      return o !== null && typeof o === "string";
    },
    isEmptyObject: (o) => {
      var name;
      for (name in o) {
        if (o.hasOwnProperty(name)) return false;
      }
      return true;
    },
    isFunc: (o) => {
      return typeof o === "function";
    },
    isAsyncFunc: (fn) => {
      return rules.isFunc(fn) && fn.constructor.name === "AsyncFunction";
    },
    isNode: (o) => {
      return typeof Node === "object"
        ? o instanceof Node
        : o &&
            typeof o === "object" &&
            typeof o.nodeType === "number" &&
            typeof o.nodeName === "string";
    },
    isElement: (o) => {
      return typeof HTMLElement === "object"
        ? o instanceof HTMLElement //DOM2
        : o &&
            typeof o === "object" &&
            o !== null &&
            o.nodeType === 1 &&
            typeof o.nodeName === "string";
    },
  };

  export default rules;