export const addClass = (cls, el) => {
  if (!cls || !el) {
    return;
  }
  if (typeof cls === "string") {
    el.classList.add.apply(el.classList, cls.split(" "));
  } else if (Array.isArray(cls)) {
    el.classList.add.apply(el.classList, cls);
  }
};

const _removeClassArr = (arr, el) => {
  arr.forEach((cls) => {
    if (el.classList.contains(cls)) {
      el.classList.remove(cls);
    }
  });
};

export const removeClass = (cls, el) => {
  if (!cls || !el) {
    return;
  }
  if (typeof cls === "string") {
    _removeClassArr(cls.split(" "), el);
  } else if (Array.isArray(cls)) {
    _removeClassArr(cls, el);
  }
};

export const isNode = (o) => {
    return typeof Node === "object"
      ? o instanceof Node
      : o &&
          typeof o === "object" &&
          typeof o.nodeType === "number" &&
          typeof o.nodeName === "string";
  }

export const isElement = (o) => {
    return typeof HTMLElement === "object"
      ? o instanceof HTMLElement //DOM2
      : o &&
          typeof o === "object" &&
          o !== null &&
          o.nodeType === 1 &&
          typeof o.nodeName === "string";
  }

export const isDomObject = (o) => isNode(o) || isElement(o);

export const sanitizeHtml = (html) => {
    var el = document.createElement('div');
    el.innerText = html;
    return el.innerHTML;
}

export const createElement = (str, multi = false) => {
    var frag = document.createRange().createContextualFragment(str);
    let el = frag.firstElementChild;
    return multi ? frag : el;
}

export const setFormValue = (el, val) => {
    if (!el) return;
    if (el.type === 'checkbox' || el.type === 'radio') {
        el.checked = el.value == val;
    } else if (el.type === 'select') {
        let opt = el.options.filter(o => o.value == val)[0];
        if (opt) {
            el.selectedIndex = el.options.indexOf(opt);
        }
    } else {
        el.value = val;
    }    
}