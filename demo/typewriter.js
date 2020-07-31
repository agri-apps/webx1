function typewriter(text, speed) {
    var i = 0;
    var txt = text;

    if (!speed) { speed = 100; }

    const api = {
        typeIt: function (el, str) {
            if (str) {
                txt = str;
                i = 0;
            }
            if (el) {
                api.el = el;
            }

            if (i < txt.length) {
                el.textContent += txt.charAt(i);
                i++;
                setTimeout(api.typeIt.bind(null, el), speed);
            }
        }
    }   
    return api;
}