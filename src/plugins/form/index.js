import { isElement, createElement, setFormValue } from "./../../utils/dom";

const PLUGIN = "webx1FormPlugin";

const defaultOptions = {
  forms: [],
};

const serializeForm = (name) => {
  let form = isElement(name) ? name : cache.forms[name];

  if (!form) {
    form = document.querySelector(name);
    if (!form) {
      throw new Error(
        `[${PLUGIN}] Unknown form with name or selector "${name}"`
      );
    }
  }
  let i = 0,
    json = {},
    serialized = [];
  for (i; i < form.elements.length; i++) {
    var field = form.elements[i];
    // Don't serialize fields without a name, submits, buttons, file and reset inputs, and disabled fields
    if (
      !field.name ||
      field.disabled ||
      field.type === "file" ||
      field.type === "reset" ||
      field.type === "submit" ||
      field.type === "button"
    )
      continue;

    // If a multi-select, get all selections
    if (field.type === "select-multiple") {
      for (var n = 0; n < field.options.length; n++) {
        if (!field.options[n].selected) continue;
        if (!json[field.name]) {
          json[field.name] = [];
        }
        json[field.name].push(field.options[n].value);

        serialized.push(
          encodeURIComponent(field.name) +
            "=" +
            encodeURIComponent(field.options[n].value)
        );
      }
    }

    // Convert field data to a query string
    else if (
      (field.type !== "checkbox" && field.type !== "radio") ||
      field.checked
    ) {
      json[field.name] = field.value;
      serialized.push(
        encodeURIComponent(field.name) + "=" + encodeURIComponent(field.value)
      );
    }
  }

  return { json, serialized };
};

export default {
  name: PLUGIN,
  global: "$",
  namespace: "form",
  install: (app, options = {}) => {
    let cache = { forms: {} };

    let opts = Object.assign({}, defaultOptions, options);
    let rootEl = document.querySelector(opts.container) || document.body;

    const createFormProxy = (form, successFn, errorFn, validateFn) => {
      let formHandler = {
        get: (target, prop) => {
          if (prop === "target") {
            return target;
          } else if (prop === "serialize") {
            return function () {
              let serialized = serializeForm(target);
              return serialized;
            };
          } else if (prop === "validate") {
            return function () {
              if (!validateFn || typeof validateFn !== "function") {
                return true;
              }
              let values = serializeForm(target);
              let result = validateFn(form.name, values);

              if (!result) {
                errorFn ? errorFn(form.name, result, values) : null;
              }

              return result;
            };
          } else if (prop === "appendTo") {
            return function (parentNode) {
              parentNode.appendChild(target);
            };
          } else if (prop === "remove") {
            return function () {
              target.parentNode.removeChild(target);
            };
          }

          return target[prop];
        },
        set: (target, prop, value) => {
          target[prop] = value;
        },
      };

      let formProxy = new Proxy(form, formHandler);

      formProxy.target.addEventListener("submit", (e) => {
        e.preventDefault();
        let values = formProxy.serialize();

        if (validateFn) {
          let result = validateFn(values.json);
          if (!result || result[0]) {
            successFn ? successFn(name, values, result[1]) : null;
          } else {
            errorFn ? errorFn(name, values, result[1]) : null;
          }
        } else {
          successFn ? successFn(name, values, result[1]) : null;
        }
      });

      return formProxy;
    };

    const api = {
      register: (name, elemOrHtml, validateFn) => {
        if (cache.forms[name]) {
          throw new Error(
            `[${PLUGIN}] A form named "${name}" is already registered.`
          );
        }
        if (validateFn) {
          if (!typeof validateFn === "function") {
            throw new Error(
              `[${PLUGIN}] The validate property must be a function.`
            );
          }
        }
        let html = isElement(elemOrHtml) ? elemOrHtml.innerHTML : elemOrHtml;

        cache.forms[name] = [html, validateFn || false];
      },

      generate: (name, obj, successFn, errorFn) => {
        let form = cache.forms[name];
        if (!form) {
          throw new Error(
            `[${PLUGIN}] Unknown form named "${name}". Did you register it?`
          );
        }
        const [html, validateFn] = form;

        let formEl = createElement(html);
        formEl.name = name;
        formEl.dataset["registered"] = true;

        if (obj) {
          Object.keys(obj).forEach((key) => {
            let inps = [].slice.call(
              formEl.querySelectorAll(`[name="${key}"]`)
            );
            inps.forEach((inp) => {
              inp ? setFormValue(inp, obj[key]) : null;
            });
          });
        }

        return createFormProxy(formEl, successFn, errorFn, validateFn);
      },

      serialize: serializeForm,
      getAll: () => {
        return [].slice
          .call(rootEl.querySelectorAll("form[data-registered]"))
          .map((form) => createFormProxy(form));
      },
      get: (name) => {
        let form = rootEl.querySelector(`form[name="${name}"]`);
        return form ? createFormProxy(form) : null;
      },
    };

    if (opts.forms) {
      opts.forms.forEach((frm) => {
        const [name, html, validate] = frm;
        try {
          api.register(name, html, validate);
        } catch (err) {
          console.error(`[${PLUGIN}] Unable to register form "${name}"`, err);
        }
      });
    }

    return api;
  },
};
