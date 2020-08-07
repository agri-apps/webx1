!function(e){"function"==typeof define&&define.amd?define(e):e()}(function(){var e={name:"webx1NavPlugin",global:"$",namespace:"nav",install:function(e,t){var n=Object.assign({activeClassName:"active "},t),r=e.initRoute,a=e.unmountRoute,o=e.boot,i=n.scope?document.querySelector(n.scope):e.el;return e.initRoute=function(t,a){try{return Promise.resolve(r(t,a)).then(function(){var t=Object.keys(e.routes).reduce(function(t,r){var a=e.routes[r];return a.name&&(t[a.name]={root:a.root,path:r,activeClass:a.activeClass||n.activeClassName}),t},{});[].slice.call(i.querySelectorAll("a[data-route]")).forEach(function(r){(t[r.dataset.route]||{}).activeClassName&&(r.dataset.activeClass=activeClass),r.addEventListener("click",function(r){r.preventDefault();var a=t[r.target.dataset.route]||{},o=a.activeClass,c=a.root;if(a.path){var u=r.target.href,l=u.replace(window.location.origin,"");window.history.pushState({},l,u),e.navigate(r.target.pathname);var s=c?i.querySelector('[data-route="'+c+'"]'):r.target;s&&(o&&(s.dataset.activeClass=o),s.classList.add(o||n.activeClassName))}})})})}catch(e){return Promise.reject(e)}},e.unmountRoute=function(t,r){a.call(e,t,r),[].slice.call(i.querySelectorAll("a[data-route]")).forEach(function(e){e.classList.remove(e.dataset.activeClass||n.activeClassName)})},e.boot=function(){try{return Promise.resolve(o.call(e)).then(function(){var t=window.location.pathname,r=function(){if(t)return Promise.resolve(e.getRoute(t)).then(function(e){if(e&&e.name){var t=i.querySelector('[data-route="'+(e.root?e.root:e.name)+'"]');if(t){var r=e.activeClass||n.activeClassName;t.classList.add(r),t.dataset.activeClass=r}}})}();if(r&&r.then)return r.then(function(){})})}catch(e){return Promise.reject(e)}},{getRouteElements:function(){return[].slice.call(i.querySelectorAll("[data-route]"))}}}};void 0!==typeof window&&(window.webx1NavPlugin=e);var t={speed:100};void 0!==typeof window&&(window.webx1TyperPlugin={name:"webx1TyperPlugin",global:"$",namespace:"typer",install:function(e,n){void 0===n&&(n={});var r=Object.assign({},t,n),a=r.scope?document.querySelector(r.scope):e.el,o=e.initRoute,i=function(){[].slice.call(a.querySelectorAll("[data-typer]")).forEach(function(e){var t=e.dataset.typer||e.textContent;c(t,e.hasAttribute("data-speed")?parseInt(e.dataset.speed):r.speed,e.hasAttribute("data-replace"),e.hasAttribute("data-repeat"),e.getAttribute("data-append")).typeIt(e,t)})};function c(e,t,n,r,a){void 0===n&&(n=!1),void 0===r&&(r=!1),void 0===a&&(a="");var o=0,i=e,c=e;t||(t=100);var u={typeIt:function(e,l){var s;return l&&(i=l,o=0),e&&(u.el=e),o<i.length?(e.textContent=n?i.charAt(o):e.textContent+i.charAt(o),a&&(e.textContent=e.textContent+a),o++,s=setTimeout(u.typeIt.bind(null,e),t)):r&&(e.textContent="",s=setTimeout(u.typeIt.bind(null,e,c))),{stop:function(){s&&clearTimeout(s)}}}};return u}return e.initRoute=function(t,n){try{return Promise.resolve(o.call(e,t,n)).then(function(){i()})}catch(e){return Promise.reject(e)}},{typeIt:function(e,t,n,a){return void 0===n&&(n=r.speed),c(t,n,a).typeIt(e,t)},run:i}}});var n={clobber:!0};void 0!==typeof window&&(window.webx1TemplaterPlugin={name:"webx1TemplaterPlugin",global:"$",namespace:"template",install:function(e,t){void 0===t&&(t={});var r={},a={},o=Object.assign({},n,t),i=o.scope?document.querySelector(o.scope):e.el;function c(e){return new Function("page","var output="+JSON.stringify(e).replace(/<%=(.+?)%>/g,'"+($1)+"').replace(/<%(.+?)%>/g,'";$1\noutput+="')+";return output;")}return{init:function(){[].slice.call(i.querySelectorAll('script[type="text/template"]')).forEach(function(e){var t=e.getAttribute("id");t&&e.textContent&&(r[t]=c(e.textContent))})},register:function(e,t){if(r[e]&&!o.clobber)throw new Error('A template named "'+e+'" is already registered!');r[e]=c(t),a[e]&&a[e].forEach(function(t){t(r[e])})},registerFromUrl:function(t,n,i){try{if(r[t]&&!o.clobber)return i&&i('A template with the name "'+t+'" is already registered!'),Promise.resolve();var u=function(e,o){try{var i=Promise.resolve(fetch(n)).then(function(e){return Promise.resolve(e.text()).then(function(e){r[t]=c(e),a[t]&&a[t].forEach(function(e){e(r[t])})})})}catch(e){return o(e)}return i&&i.then?i.then(void 0,o):i}(0,function(t){e.debug&&console.error("[webx1TemplaterPlugin] Failed to fetch remote template",t),i&&i(t)});return Promise.resolve(u&&u.then?u.then(function(){}):void 0)}catch(e){return Promise.reject(e)}},ready:function(e,t){a[e]||(a[e]=[]),a[e].push(t),r[e]&&t(r[e])},render:function(e,t){if(!r[e])throw new Error('Unknown template "'+e+'". Did you register it first?');return r[e](t)},renderTo:function(e,t,n,a){var o=n;if(!n)throw new Error("An element is required to bind!");"string"==typeof n&&(o=document.querySelector(n)),r[e]?(o.innerHTML=r[e](t),a&&"function"==typeof a&&a(n,e,t)):console.warn('[webx1TemplaterPlugin] Missing template "'+e+'" on bind! Is it registered?')}}}})});
//# sourceMappingURL=plugins.js.map