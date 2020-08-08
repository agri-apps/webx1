!function(e){"function"==typeof define&&define.amd?define(e):e()}(function(){var e=function(e,t){e&&t&&("string"==typeof e?t.classList.add.apply(t.classList,e.split(" ")):Array.isArray(e)&&t.classList.add.apply(t.classList,e))},t=function(e,t){e.forEach(function(e){t.classList.contains(e)&&t.classList.remove(e)})},n=function(e,n){e&&n&&("string"==typeof e?t(e.split(" "),n):Array.isArray(e)&&t(e,n))},a={name:"webx1NavPlugin",global:"$",namespace:"nav",install:function(t,a){var r=Object.assign({activeClassName:"active"},a),o=t.initRoute,i=t.unmountRoute,l=t.boot,s=r.scope?document.querySelector(r.scope):t.el;return t.initRoute=function(n,a){try{return Promise.resolve(o(n,a)).then(function(){var n=Object.keys(t.routes).reduce(function(e,n){var a=t.routes[n];return a.name&&(e[a.name]={root:a.root,path:n,activeClass:a.activeClass||r.activeClassName}),e},{});[].slice.call(s.querySelectorAll("a[data-route]")).forEach(function(a){(n[a.dataset.route]||{}).activeClassName&&(a.dataset.activeClass=activeClass),a.addEventListener("click",function(a){a.preventDefault();var o=n[a.target.dataset.route]||{},i=o.activeClass,l=o.root;if(o.path){var c=a.target.href,u=c.replace(window.location.origin,"");window.history.pushState({},u,c),t.navigate(a.target.pathname);var d=l?s.querySelector('[data-route="'+l+'"]'):a.target;d&&(i&&(d.dataset.activeClass=i),e(i||r.activeClassName,d))}})})})}catch(e){return Promise.reject(e)}},t.unmountRoute=function(e,a){i.call(t,e,a),[].slice.call(s.querySelectorAll("a[data-route]")).forEach(function(e){n(e.dataset.activeClass||r.activeClassName,e)})},t.boot=function(){try{return Promise.resolve(l.call(t)).then(function(){var n=window.location.pathname,a=function(){if(n)return Promise.resolve(t.getRoute(n)).then(function(t){if(t&&t.name){var n=s.querySelector('[data-route="'+(t.root?t.root:t.name)+'"]');if(n){var a=t.activeClass||r.activeClassName;e(a,n),n.dataset.activeClass=a}}})}();if(a&&a.then)return a.then(function(){})})}catch(e){return Promise.reject(e)}},{getRouteElements:function(){return[].slice.call(s.querySelectorAll("[data-route]"))}}}};void 0!==typeof window&&(window.webx1NavPlugin=a);var r={speed:100};void 0!==typeof window&&(window.webx1TyperPlugin={name:"webx1TyperPlugin",global:"$",namespace:"typer",install:function(e,t){void 0===t&&(t={});var n=Object.assign({},r,t),a=n.scope?document.querySelector(n.scope):e.el,o=e.initRoute,i=function(){[].slice.call(a.querySelectorAll("[data-typer]")).forEach(function(e){var t=e.dataset.typer||e.textContent;l(t,e.hasAttribute("data-speed")?parseInt(e.dataset.speed):n.speed,e.hasAttribute("data-replace"),e.hasAttribute("data-repeat"),e.getAttribute("data-append")).typeIt(e,t)})};function l(e,t,n,a,r){void 0===n&&(n=!1),void 0===a&&(a=!1),void 0===r&&(r="");var o=0,i=e,l=e;t||(t=100);var s={typeIt:function(e,c){var u;return c&&(i=c,o=0),e&&(s.el=e),o<i.length?(e.textContent=n?i.charAt(o):e.textContent+i.charAt(o),r&&(e.textContent=e.textContent+r),o++,u=setTimeout(s.typeIt.bind(null,e),t)):a&&(e.textContent="",u=setTimeout(s.typeIt.bind(null,e,l))),{stop:function(){u&&clearTimeout(u)}}}};return s}return e.initRoute=function(t,n){try{return Promise.resolve(o.call(e,t,n)).then(function(){i()})}catch(e){return Promise.reject(e)}},{typeIt:function(e,t,a,r){return void 0===a&&(a=n.speed),l(t,a,r).typeIt(e,t)},run:i}}});var o={clobber:!0};void 0!==typeof window&&(window.webx1TemplaterPlugin={name:"webx1TemplaterPlugin",global:"$",namespace:"template",install:function(e,t){void 0===t&&(t={});var n={},a={},r=Object.assign({},o,t),i=r.scope?document.querySelector(r.scope):e.el;function l(e){return new Function("page","var output="+JSON.stringify(e).replace(/<%=(.+?)%>/g,'"+($1)+"').replace(/<%(.+?)%>/g,'";$1\noutput+="')+";return output;")}return{init:function(){[].slice.call(i.querySelectorAll('script[type="text/template"]')).forEach(function(e){var t=e.getAttribute("id");t&&e.textContent&&(n[t]=l(e.textContent))})},register:function(e,t){if(n[e]&&!r.clobber)throw new Error('A template named "'+e+'" is already registered!');n[e]=l(t),a[e]&&a[e].forEach(function(t){t(n[e])})},registerFromUrl:function(t,o,i){try{if(n[t]&&!r.clobber)return i&&i('A template with the name "'+t+'" is already registered!'),Promise.resolve();var s=function(e,r){try{var i=Promise.resolve(fetch(o)).then(function(e){return Promise.resolve(e.text()).then(function(e){n[t]=l(e),a[t]&&a[t].forEach(function(e){e(n[t])})})})}catch(e){return r(e)}return i&&i.then?i.then(void 0,r):i}(0,function(t){e.debug&&console.error("[webx1TemplaterPlugin] Failed to fetch remote template",t),i&&i(t)});return Promise.resolve(s&&s.then?s.then(function(){}):void 0)}catch(e){return Promise.reject(e)}},ready:function(e,t){a[e]||(a[e]=[]),a[e].push(t),n[e]&&t(n[e])},render:function(e,t){if(!n[e])throw new Error('Unknown template "'+e+'". Did you register it first?');return n[e](t)},renderTo:function(e,t,a,r){var o=a;if(!a)throw new Error("An element is required to bind!");"string"==typeof a&&(o=document.querySelector(a)),n[e]?(o.innerHTML=n[e](t),r&&"function"==typeof r&&r(a,e,t)):console.warn('[webx1TemplaterPlugin] Missing template "'+e+'" on bind! Is it registered?')}}}});var i={modalClassName:"modal",contentClassName:"modal__content",modalOpenClassName:"has-modal",header:!0,footer:!0,container:"body",animation:"",template:function(e){return'\n        <div class="'+e.modalClassName+'" style="display: none;">\n            <div class="'+e.contentClassName+'">\n            </div>\n        </div>\n    '}};void 0!==typeof window&&(window.webx1ModalPlugin={name:"webx1ModalPlugin",global:"$",namespace:"modal",install:function(t,a){void 0===a&&(a={});var r=Object.assign({},i,a),o=document.querySelector(r.container)||document.body;return{show:function(t,a,i){void 0===i&&(i={});var l=Object.assign({},r,i);e(l.modalOpenClassName,o);var s=document.createElement("div");s.innerHTML=r.template(l),console.log("template",s.innerHTML,s);var c=s.firstElementChild;console.log("modalEl",c,s.firstChild,s.firstElementChild),o.appendChild(c),c.style.display="block";var u=c.querySelector("."+l.contentClassName);console.log("contentEl",u),u&&(u.innerHTML=t);var d={close:function(){c.parentElement.removeChild(c),n(l.modalOpenClassName,o),s=null}};a&&"function"==typeof a&&a(c,d)}}}})});
//# sourceMappingURL=plugins.js.map
