import { isNode, isElement } from "./dom";

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
  isNode,
  isElement,
};

export default rules;
