import { addClass, createElement } from "../../utils/dom";

const PLUGIN = "webx1ToasterPlugin";

const defaultOptions = {
  toastClassName: "toast",
  closeClassName: "close",
  closableClassName: "closable",
  delay: 0,
  duration: 4000,
  position: "bottom center",
  bottomCenterClassName: "bottom-center",
  bottomLeftClassName: "bottom-left",
  bottomRightClassName: "bottom-right",
  topCenterClassName: "top-center",
  topLeftClassName: "top-left",
  topRightClassName: "top-right",
  template: (msg, options) =>
    `<div class="${options.toastClassName}${
      options.closable ? ` ${options.closableClassName}` : ""
    }">${msg}${
      options.closable
        ? `<span class="${options.closeClassName}">&times;</span>`
        : ""
    }</div>`,
};

const install = (app, options) => {
  let opts = Object.assign({}, defaultOptions, options);
  let rootEl = document.querySelector(opts.container) || document.body;

  const api = {
    show: (message, options) => {
      let localOpts = Object.assign({}, opts, options);
      let toastEl = createElement(opts.template(message, localOpts));
      if (localOpts.theme) {
        addClass(localOpts.theme, toastEl);
      }
      switch (localOpts.position) {
        case "top center":
          addClass(localOpts.topCenterClassName, toastEl);
          break;
        case "top left":
          addClass(localOpts.topLeftClassName, toastEl);
          break;
        case "top right":
          addClass(localOpts.topRightClassName, toastEl);
          break;
        case "bottom left":
          addClass(localOpts.bottomLeftClassName, toastEl);
          break;
        case "bottom right":
          addClass(localOpts.bottomRightClassName, toastEl);
          break;
        default:
          addClass(localOpts.bottomCenterClassName, toastEl);
          break;
      }

      const hide = (delay) => {
        setTimeout(() => {
          toastEl.parentNode.removeChild(toastEl);
        }, delay);
      };

      if (localOpts.closable) {
        let closeEl = toastEl.querySelector(`.${localOpts.closeClassName}`);
        if (closeEl) {
          closeEl.addEventListener("click", (e) => {
            e.preventDefault();
            hide(0);
          });
        } else {
            toastEl.addEventListener('click', (e) => {
                e.preventDefault();
                hide(0);
            });
        }
      }

      setTimeout(() => rootEl.appendChild(toastEl), localOpts.delay);


      if (!localOpts.closable) {
        hide(localOpts.duration || 4000);
      }
    },
  };

  return api;
};

export default {
  name: PLUGIN,
  global: "$",
  namespace: "toast",
  install,
};
