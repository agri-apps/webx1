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
