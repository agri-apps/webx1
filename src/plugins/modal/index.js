import { addClass, removeClass } from './../../utils/dom';

const defaultOptions = { 
    modalClassName: "modal", 
    contentClassName: "modal__content",
    modalOpenClassName: "has-modal",
    header: true,
    footer: true,
    container: "body",
    animation: "",
    template: (options) => `
        <div class="${options.modalClassName}" style="display: none;">
            <div class="${options.contentClassName}">
            </div>
        </div>
    `
};

export default {
  name: "webx1ModalPlugin",
  global: "$",
  namespace: "modal",
  install: (app, options = {}) => {

    let opts = Object.assign({}, defaultOptions, options);
    let rootEl = document.querySelector(opts.container) || document.body;

    const api = {
      show: (content, callback, options = {}) => {

        let localOptions = Object.assign({}, opts, options);

        addClass(localOptions.modalOpenClassName, rootEl);

        let modal = document.createElement('div');
        modal.innerHTML = opts.template(localOptions);

        let modalEl = modal.firstElementChild;

        rootEl.appendChild(modalEl);

        modalEl.style.display = 'block';
        let contentEl = modalEl.querySelector(`.${localOptions.contentClassName}`);
        if (contentEl) {
            contentEl.innerHTML = content;
        }

        let modalApi = {
            close: () => {
                modalEl.parentElement.removeChild(modalEl);
                removeClass(localOptions.modalOpenClassName, rootEl);
                modal = null;
            }
        }

        callback && typeof callback === 'function' ? callback(modalEl, modalApi) : null;

      }
    };

    return api;
  },
};
