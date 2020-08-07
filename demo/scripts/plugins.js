!function(e){"function"==typeof define&&define.amd?define(e):e()}(function(){var e=function(e,t){e&&t&&("string"==typeof e?t.classList.add.apply(t.classList,e.split(" ")):Array.isArray(e)&&t.classList.add.apply(t.classList,e))},t=function(e,t){e.forEach(function(e){t.classList.contains(e)&&t.classList.remove(e)})},n={name:"webx1NavPlugin",global:"$",namespace:"nav",install:function(n,r){var a=Object.assign({activeClassName:"active "},r),o=n.initRoute,i=n.unmountRoute,c=n.boot,s=a.scope?document.querySelector(a.scope):n.el;return n.initRoute=function(t,r){try{return Promise.resolve(o(t,r)).then(function(){var t=Object.keys(n.routes).reduce(function(e,t){var r=n.routes[t];return r.name&&(e[r.name]={root:r.root,path:t,activeClass:r.activeClass||a.activeClassName}),e},{});[].slice.call(s.querySelectorAll("a[data-route]")).forEach(function(r){(t[r.dataset.route]||{}).activeClassName&&(r.dataset.activeClass=activeClass),r.addEventListener("click",function(r){r.preventDefault();var o=t[r.target.dataset.route]||{},i=o.activeClass,c=o.root;if(o.path){var u=r.target.href,l=u.replace(window.location.origin,"");window.history.pushState({},l,u),n.navigate(r.target.pathname);var f=c?s.querySelector('[data-route="'+c+'"]'):r.target;f&&(i&&(f.dataset.activeClass=i),e(i||a.activeClassName,f))}})})})}catch(e){return Promise.reject(e)}},n.unmountRoute=function(e,r){i.call(n,e,r),[].slice.call(s.querySelectorAll("a[data-route]")).forEach(function(e){var n,r;r=e,(n=e.dataset.activeClass||a.activeClassName)&&r&&("string"==typeof n?t(n.split(" "),r):Array.isArray(n)&&t(n,r))})},n.boot=function(){try{return Promise.resolve(c.call(n)).then(function(){var t=window.location.pathname,r=function(){if(t)return Promise.resolve(n.getRoute(t)).then(function(t){if(t&&t.name){var n=s.querySelector('[data-route="'+(t.root?t.root:t.name)+'"]');if(n){var r=t.activeClass||a.activeClassName;e(r,n),n.dataset.activeClass=r}}})}();if(r&&r.then)return r.then(function(){})})}catch(e){return Promise.reject(e)}},{getRouteElements:function(){return[].slice.call(s.querySelectorAll("[data-route]"))}}}};void 0!==typeof window&&(window.webx1NavPlugin=n);var r={speed:100};void 0!==typeof window&&(window.webx1TyperPlugin={name:"webx1TyperPlugin",global:"$",namespace:"typer",install:function(e,t){void 0===t&&(t={});var n=Object.assign({},r,t),a=n.scope?document.querySelector(n.scope):e.el,o=e.initRoute,i=function(){[].slice.call(a.querySelectorAll("[data-typer]")).forEach(function(e){var t=e.dataset.typer||e.textContent;c(t,e.hasAttribute("data-speed")?parseInt(e.dataset.speed):n.speed,e.hasAttribute("data-replace"),e.hasAttribute("data-repeat"),e.getAttribute("data-append")).typeIt(e,t)})};function c(e,t,n,r,a){void 0===n&&(n=!1),void 0===r&&(r=!1),void 0===a&&(a="");var o=0,i=e,c=e;t||(t=100);var s={typeIt:function(e,u){var l;return u&&(i=u,o=0),e&&(s.el=e),o<i.length?(e.textContent=n?i.charAt(o):e.textContent+i.charAt(o),a&&(e.textContent=e.textContent+a),o++,l=setTimeout(s.typeIt.bind(null,e),t)):r&&(e.textContent="",l=setTimeout(s.typeIt.bind(null,e,c))),{stop:function(){l&&clearTimeout(l)}}}};return s}return e.initRoute=function(t,n){try{return Promise.resolve(o.call(e,t,n)).then(function(){i()})}catch(e){return Promise.reject(e)}},{typeIt:function(e,t,r,a){return void 0===r&&(r=n.speed),c(t,r,a).typeIt(e,t)},run:i}}});var a={clobber:!0};void 0!==typeof window&&(window.webx1TemplaterPlugin={name:"webx1TemplaterPlugin",global:"$",namespace:"template",install:function(e,t){void 0===t&&(t={});var n={},r={},o=Object.assign({},a,t),i=o.scope?document.querySelector(o.scope):e.el;function c(e){return new Function("page","var output="+JSON.stringify(e).replace(/<%=(.+?)%>/g,'"+($1)+"').replace(/<%(.+?)%>/g,'";$1\noutput+="')+";return output;")}return{init:function(){[].slice.call(i.querySelectorAll('script[type="text/template"]')).forEach(function(e){var t=e.getAttribute("id");t&&e.textContent&&(n[t]=c(e.textContent))})},register:function(e,t){if(n[e]&&!o.clobber)throw new Error('A template named "'+e+'" is already registered!');n[e]=c(t),r[e]&&r[e].forEach(function(t){t(n[e])})},registerFromUrl:function(t,a,i){try{if(n[t]&&!o.clobber)return i&&i('A template with the name "'+t+'" is already registered!'),Promise.resolve();var s=function(e,o){try{var i=Promise.resolve(fetch(a)).then(function(e){return Promise.resolve(e.text()).then(function(e){n[t]=c(e),r[t]&&r[t].forEach(function(e){e(n[t])})})})}catch(e){return o(e)}return i&&i.then?i.then(void 0,o):i}(0,function(t){e.debug&&console.error("[webx1TemplaterPlugin] Failed to fetch remote template",t),i&&i(t)});return Promise.resolve(s&&s.then?s.then(function(){}):void 0)}catch(e){return Promise.reject(e)}},ready:function(e,t){r[e]||(r[e]=[]),r[e].push(t),n[e]&&t(n[e])},render:function(e,t){if(!n[e])throw new Error('Unknown template "'+e+'". Did you register it first?');return n[e](t)},renderTo:function(e,t,r,a){var o=r;if(!r)throw new Error("An element is required to bind!");"string"==typeof r&&(o=document.querySelector(r)),n[e]?(o.innerHTML=n[e](t),a&&"function"==typeof a&&a(r,e,t)):console.warn('[webx1TemplaterPlugin] Missing template "'+e+'" on bind! Is it registered?')}}}})});
//# sourceMappingURL=plugins.js.map
