!function(e){"function"==typeof define&&define.amd?define(e):e()}(function(){var e=function(e,t){e&&t&&("string"==typeof e?t.classList.add.apply(t.classList,e.split(" ")):Array.isArray(e)&&t.classList.add.apply(t.classList,e))},t=function(e,t){e.forEach(function(e){t.classList.contains(e)&&t.classList.remove(e)})},n=function(e,n){e&&n&&("string"==typeof e?t(e.split(" "),n):Array.isArray(e)&&t(e,n))},r=function(e){return"object"==typeof HTMLElement?e instanceof HTMLElement:e&&"object"==typeof e&&null!==e&&1===e.nodeType&&"string"==typeof e.nodeName},o=function(e,t){void 0===t&&(t=!1);var n=document.createRange().createContextualFragment(e);return t?n:n.firstElementChild},a={name:"webx1NavPlugin",global:"$",namespace:"nav",install:function(t,r){var o=Object.assign({activeClassName:"active"},r),a=t.initRoute,i=t.unmountRoute,s=t.boot,c=o.scope?document.querySelector(o.scope):t.el;return t.initRoute=function(n,r){try{return Promise.resolve(a(n,r)).then(function(){var n=Object.keys(t.routes).reduce(function(e,n){var r=t.routes[n];return r.name&&(e[r.name]={root:r.root,path:n,activeClass:r.activeClass||o.activeClassName}),e},{});[].slice.call(c.querySelectorAll("a[data-route]")).forEach(function(r){(n[r.dataset.route]||{}).activeClassName&&(r.dataset.activeClass=activeClass),r.addEventListener("click",function(r){r.preventDefault();var a=n[r.target.dataset.route]||{},i=a.activeClass,s=a.root;if(a.path){var l=r.target.href,u=l.replace(window.location.origin,"");window.history.pushState({},u,l),t.navigate(r.target.pathname);var f=s?c.querySelector('[data-route="'+s+'"]'):r.target;f&&(i&&(f.dataset.activeClass=i),e(i||o.activeClassName,f))}})})})}catch(e){return Promise.reject(e)}},t.unmountRoute=function(e,r){i.call(t,e,r),[].slice.call(c.querySelectorAll("a[data-route]")).forEach(function(e){n(e.dataset.activeClass||o.activeClassName,e)})},t.boot=function(){try{return Promise.resolve(s.call(t)).then(function(){var n=window.location.pathname,r=function(){if(n)return Promise.resolve(t.getRoute(n)).then(function(t){if(t&&t.name){var n=c.querySelector('[data-route="'+(t.root?t.root:t.name)+'"]');if(n){var r=t.activeClass||o.activeClassName;e(r,n),n.dataset.activeClass=r}}})}();if(r&&r.then)return r.then(function(){})})}catch(e){return Promise.reject(e)}},{getRouteElements:function(){return[].slice.call(c.querySelectorAll("[data-route]"))}}}};void 0!==typeof window&&(window.webx1NavPlugin=a);var i={speed:100};void 0!==typeof window&&(window.webx1TyperPlugin={name:"webx1TyperPlugin",global:"$",namespace:"typer",install:function(e,t){void 0===t&&(t={});var n=Object.assign({},i,t),r=n.scope?document.querySelector(n.scope):e.el,o=e.initRoute,a=function(){[].slice.call(r.querySelectorAll("[data-typer]")).forEach(function(e){var t=e.dataset.typer||e.textContent;s(t,e.hasAttribute("data-speed")?parseInt(e.dataset.speed):n.speed,e.hasAttribute("data-replace"),e.hasAttribute("data-repeat"),e.getAttribute("data-append")).typeIt(e,t)})};function s(e,t,n,r,o){void 0===n&&(n=!1),void 0===r&&(r=!1),void 0===o&&(o="");var a=0,i=e,s=e;t||(t=100);var c={typeIt:function(e,l){var u;return l&&(i=l,a=0),e&&(c.el=e),a<i.length?(e.textContent=n?i.charAt(a):e.textContent+i.charAt(a),o&&(e.textContent=e.textContent+o),a++,u=setTimeout(c.typeIt.bind(null,e),t)):r&&(e.textContent="",u=setTimeout(c.typeIt.bind(null,e,s))),{stop:function(){u&&clearTimeout(u)}}}};return c}return e.initRoute=function(t,n){try{return Promise.resolve(o.call(e,t,n)).then(function(){a()})}catch(e){return Promise.reject(e)}},{typeIt:function(e,t,r,o){return void 0===r&&(r=n.speed),s(t,r,o).typeIt(e,t)},run:a}}});var s={clobber:!0};void 0!==typeof window&&(window.webx1TemplaterPlugin={name:"webx1TemplaterPlugin",global:"$",namespace:"template",install:function(e,t){void 0===t&&(t={});var n={},r={},o=Object.assign({},s,t),a=o.scope?document.querySelector(o.scope):e.el;function i(e){return new Function("page","var output="+JSON.stringify(e).replace(/<%=(.+?)%>/g,'"+($1)+"').replace(/<%(.+?)%>/g,'";$1\noutput+="')+";return output;")}return{init:function(){[].slice.call(a.querySelectorAll('script[type="text/template"]')).forEach(function(e){var t=e.getAttribute("id");t&&e.textContent&&(n[t]=i(e.textContent))})},register:function(e,t){if(n[e]&&!o.clobber)throw new Error('A template named "'+e+'" is already registered!');n[e]=i(t),r[e]&&r[e].forEach(function(t){t(n[e])})},registerFromUrl:function(t,a,s){try{if(n[t]&&!o.clobber)return s&&s('A template with the name "'+t+'" is already registered!'),Promise.resolve();var c=function(e,o){try{var s=Promise.resolve(fetch(a)).then(function(e){return Promise.resolve(e.text()).then(function(e){n[t]=i(e),r[t]&&r[t].forEach(function(e){e(n[t])})})})}catch(e){return o(e)}return s&&s.then?s.then(void 0,o):s}(0,function(t){e.debug&&console.error("[webx1TemplaterPlugin] Failed to fetch remote template",t),s&&s(t)});return Promise.resolve(c&&c.then?c.then(function(){}):void 0)}catch(e){return Promise.reject(e)}},ready:function(e,t){r[e]||(r[e]=[]),r[e].push(t),n[e]&&t(n[e])},render:function(e,t){if(!n[e])throw new Error('Unknown template "'+e+'". Did you register it first?');return n[e](t)},renderTo:function(e,t,r,o){var a=r;if(!r)throw new Error("An element is required to bind!");"string"==typeof r&&(a=document.querySelector(r)),n[e]?(a.innerHTML=n[e](t),o&&"function"==typeof o&&o(r,e,t)):console.warn('[webx1TemplaterPlugin] Missing template "'+e+'" on bind! Is it registered?')}}}});var c={modalClassName:"modal",contentClassName:"modal__content",modalOpenClassName:"has-modal",header:!0,footer:!0,container:"body",animation:"",template:function(e){return'\n        <div class="'+e.modalClassName+'" style="display: none;">\n            <div class="'+e.contentClassName+'">\n            </div>\n        </div>\n    '}};void 0!==typeof window&&(window.webx1ModalPlugin={name:"webx1ModalPlugin",global:"$",namespace:"modal",install:function(t,r){void 0===r&&(r={});var o=Object.assign({},c,r),a=document.querySelector(o.container)||document.body;return{show:function(t,r,i){void 0===i&&(i={});var s=Object.assign({},o,i);e(s.modalOpenClassName,a);var c=document.createElement("div");c.innerHTML=o.template(s);var l=c.firstElementChild;a.appendChild(l),l.style.display="block";var u=l.querySelector("."+s.contentClassName);u&&(u.innerHTML=t);var f={close:function(){l.parentElement.removeChild(l),n(s.modalOpenClassName,a),c=null}};r&&"function"==typeof r&&r(l,f)}}}});var l="webx1FormPlugin",u={forms:[]},f=function(e){var t=r(e)?e:cache.forms[e];if(!t&&!(t=document.querySelector(e)))throw new Error("["+l+'] Unknown form with name or selector "'+e+'"');for(var n=0,o={},a=[];n<t.elements.length;n++){var i=t.elements[n];if(i.name&&!i.disabled&&"file"!==i.type&&"reset"!==i.type&&"submit"!==i.type&&"button"!==i.type)if("select-multiple"===i.type)for(var s=0;s<i.options.length;s++)i.options[s].selected&&(o[i.name]||(o[i.name]=[]),o[i.name].push(i.options[s].value),a.push(encodeURIComponent(i.name)+"="+encodeURIComponent(i.options[s].value)));else("checkbox"!==i.type&&"radio"!==i.type||i.checked)&&(o[i.name]=i.value,a.push(encodeURIComponent(i.name)+"="+encodeURIComponent(i.value)))}return{json:o,serialized:a}};void 0!==typeof window&&(window.webx1FormPlugin={name:l,global:"$",namespace:"form",install:function(e,t){void 0===t&&(t={});try{var n={forms:{}},a=Object.assign({},u,t),i=document.querySelector(a.container)||document.body,s=function(e,t,n,r){var o=new Proxy(e,{get:function(t,o){return"target"===o?t:"serialize"===o?function(){return f(t)}:"validate"===o?function(){if(!r||"function"!=typeof r)return!0;var o=f(t),a=r(e.name,o);return a||n&&n(e.name,a,o),a}:"appendTo"===o?function(e){e.appendChild(t)}:"remove"===o?function(){t.parentNode.removeChild(t)}:t[o]},set:function(e,t,n){e[t]=n}});return o.target.addEventListener("submit",function(e){e.preventDefault();var a=o.serialize();if(r){var i=r(a.json);!i||i[0]?t&&t(name,a,i[1]):n&&n(name,a,i[1])}else t&&t(name,a,result[1])}),o},c={register:function(e,t,o){if(n.forms[e])throw new Error("["+l+'] A form named "'+e+'" is already registered.');var a=r(t)?t.innerHTML:t;n.forms[e]=[a,o||!1]},generate:function(e,t,r,a){var i=n.forms[e];if(!i)throw new Error("["+l+'] Unknown form named "'+e+'". Did you register it?');var c=i[1],u=o(i[0]);return u.name=e,u.dataset.registered=!0,t&&Object.keys(t).forEach(function(e){[].slice.call(u.querySelectorAll('[name="'+e+'"]')).forEach(function(n){n&&function(e,t){if(e)if("checkbox"===e.type||"radio"===e.type)e.checked=e.value==t;else if("select"===e.type){var n=e.options.filter(function(e){return e.value==t})[0];n&&(e.selectedIndex=e.options.indexOf(n))}else e.value=t}(n,t[e])})}),s(u,r,a,c)},serialize:f,getAll:function(){return[].slice.call(i.querySelectorAll("form[data-registered]")).map(function(e){return s(e)})},get:function(e){var t=i.querySelector('form[name="'+e+'"]');return t?s(t):null}};return a.forms&&a.forms.forEach(function(e){try{var t=function(){try{c.register(n,a,o)}catch(e){console.error("["+l+'] Unable to register form "'+n+'"',e)}},n=e[0],r=e[1],o=e[2],a=r,i=function(){if("function"==typeof r)return Promise.resolve(r()).then(function(e){a=e})}();return Promise.resolve(i&&i.then?i.then(t):t())}catch(e){return Promise.reject(e)}}),Promise.resolve(c)}catch(e){return Promise.reject(e)}}});var m={toastClassName:"toast",closeClassName:"close",closableClassName:"closable",delay:0,duration:4e3,position:"bottom center",bottomCenterClassName:"bottom-center",bottomLeftClassName:"bottom-left",bottomRightClassName:"bottom-right",topCenterClassName:"top-center",topLeftClassName:"top-left",topRightClassName:"top-right",template:function(e,t){return'<div class="'+t.toastClassName+(t.closable?" "+t.closableClassName:"")+'">'+e+(t.closable?'<span class="'+t.closeClassName+'">&times;</span>':"")+"</div>"}};function d(e,t){try{var n=e()}catch(e){return t(e)}return n&&n.then?n.then(void 0,t):n}void 0!==typeof window&&(window.webx1ToasterPlugin={name:"webx1ToasterPlugin",global:"$",namespace:"toast",install:function(t,n){var r=Object.assign({},m,n),a=document.querySelector(r.container)||document.body;return{show:function(t,n){var i=Object.assign({},r,n),s=o(r.template(t,i));switch(i.theme&&e(i.theme,s),i.position){case"top center":e(i.topCenterClassName,s);break;case"top left":e(i.topLeftClassName,s);break;case"top right":e(i.topRightClassName,s);break;case"bottom left":e(i.bottomLeftClassName,s);break;case"bottom right":e(i.bottomRightClassName,s);break;default:e(i.bottomCenterClassName,s)}var c=function(e){setTimeout(function(){s.parentNode.removeChild(s)},e)};if(i.closable){var l=s.querySelector("."+i.closeClassName);l?l.addEventListener("click",function(e){e.preventDefault(),c(0)}):s.addEventListener("click",function(e){e.preventDefault(),c(0)})}setTimeout(function(){return a.appendChild(s)},i.delay),i.closable||c(i.duration||4e3)}}}});var v="webx1i18nPlugin",p={fallback:"en",languageFilesDir:"/i18n"};void 0!==typeof window&&(window.webx1i18nPlugin={name:v,global:"t",namespace:"i18n",install:function(e,t){try{var n=Object.assign({},p,t),o=document.querySelector(n.scope)||e.el||document.body,a=n.language?n.language:function(e){var t=navigator.languages?navigator.languages[0]:navigator.language;return t?t.substr(0,2):e}(n.fallback),i=function(e,t){return(e||"").split(".").reduce(function(e,t){return e[t]},t||{})},s=function(e,t){c._elements=[].slice.call(e.querySelectorAll("[data-i18n]")),c._elements.forEach(function(e){var n=i(e.dataset.i18n,t);n&&(e.innerHTML=n)})},c={_elements:[],currentLanguage:null,translations:{},load:function(e){try{return Promise.resolve(d(function(){return Promise.resolve(fetch(n.languageFilesDir+"/"+e+".json")).then(function(t){return Promise.resolve(t.json()).then(function(t){return c.translations=t,c.currentLanguage=e,t})})},function(t){console.error("["+v+'] Unable to load "'+e+'" translations.',t)}))}catch(e){return Promise.reject(e)}},translate:function(e){if(c.translations)return e?"string"==typeof e?i(e,c.translations):function(e){return"object"==typeof Node?e instanceof Node:e&&"object"==typeof e&&"number"==typeof e.nodeType&&"string"==typeof e.nodeName}(t=e)||r(t)?s(e,c.translations):Array.isArray(e)?e.reduce(function(e,t){return e.push(i(t),c.translations),e},[]):void 0:s(o,c.translations);var t;c.load(c.currentLanguage||n.lang).then(function(){c.translate(e)})}};e.listen(function(e){"view-rendered"===e&&(c.translations&&Object.keys(c.translations).length?c.translate():c.load(a).then(function(){c.translate()}))});var l=e.boot;return e.boot=function(){try{var t=arguments;l.apply(e,[].slice.call(t));var n=d(function(){return Promise.resolve(c.load(a)).then(function(t){e.setState("translations",t),e.setState("language",a)})},function(e){console.error("["+v+'] Unable to load "'+a+'" translations.',e)});return Promise.resolve(n&&n.then?n.then(function(){}):void 0)}catch(e){return Promise.reject(e)}},Promise.resolve(c)}catch(e){return Promise.reject(e)}}});var h="webx1LocalStoragePlugin",g={prefix:""};function y(){return(y=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e}).apply(this,arguments)}function b(e,t){if(null==e)return{};var n,r,o={},a=Object.keys(e);for(r=0;r<a.length;r++)t.indexOf(n=a[r])>=0||(o[n]=e[n]);return o}void 0!==typeof window&&(window.webx1LocalStoragePlugin={name:h,global:"$",namespace:"storage",install:function(e,t){var n=Object.assign({},g,t),r=function(e){return n.prefix?""+n.prefix+e:e},o={local:{getItem:function(e,t){return void 0===t&&(t=!0),t?JSON.parse(localStorage.getItem(r(e))):localStorage.getItem(r(e))},setItem:function(e,t,n){void 0===n&&(n=!0),n?localStorage.setItem(r(e),JSON.stringify(t)):localStorage.setItem(r(e),t)},removeItem:function(e){localStorage.removeItem(e)},keyval:function(e,t){void 0===t&&(t=[]);var r=n.prefix?""+n.prefix+e+"__set":e+"__set",a=function(){return o.local.getItem(r)||{_meta:{}}},i=function(e){var n={};return t.forEach(function(t){if(!t.id)throw new Error("["+h+".local] A reducer must have an id property.");if(!t.reduce||"function"!=typeof t.reduce)throw new Error("["+h+".local] A reducer must declare a reduce method.");n[t.id]=t.reduce(e)}),n},s=function(){return Object.keys(a()).filter(function(e){return"_"!==e.slice(0,1)})};return{keys:s,values:function(){var e=a();return s().map(function(t){return e[t]})},getAll:function(){return a()},getItem:function(e){return a()[e]},setItem:function(e,t){var n=a()||{};n[e]=t,n._meta=i(n),o.local.setItem(r,n)},removeItem:function(e){var t=a()||{};delete t[e],t._meta=i(t),o.local.setItem(r,t)},each:function(e){var t=a()||{};Object.keys(a()).forEach(function(n,r){e(t[n],n,r)})}}}}};return o}});var w=function(e,t){void 0===t&&(t={});var n=y({},e),r=Object.keys(t).reduce(function(e,r){return e[r]=t[r](n),e},{});return y({},n,r)},C={changeEvent:"change",stores:[]};void 0!==typeof window&&(window.webx1StorePlugin={name:"webx1StorePlugin",global:"$",namespace:"store",install:function(e,t){var n=[],r=Object.assign({},C,t),o={registerStore:function(t,o){if(n[t])throw new Error('[webx1StorePlugin] A store named "'+t+'" is already registered.');var a=o.changeEvent,i=void 0===a?r.changeEvent:a,s=o.state,c=void 0===s?{}:s,l=b(o,["changeEvent","state"]),u=function e(t,n,r){return void 0===t&&(t={}),void 0===n&&(n="change"),(o={_changeEvent:n,_useCachedState:!0,_replaying:!1,_events:{},_state:y({},t),_cache:{state:y({},t),events:[]},mutations:{},getters:{},state:function(e){var t=this._useCachedState?this._cache.state:w(this._state,this.getters);return this._cache.state=y({},t),this._useCachedState=!0,e?t[e]:t},replay:function(e){var t=this;void 0===e&&(e=[]),this._state={},this._cache.events=[],this._replaying=!0,e.forEach(function(e){t.commit(e.type,e.payload)}),this._replaying=!1,this._useCachedState=!1},commit:function(e,t){try{var n=this;if(-1===Object.keys(n.mutations).indexOf(e))throw new Error('Unknown action type "'+e+'"?');var o=n.mutations[e],a=o,i=void 0,s=void 0;Array.isArray(o)&&(a=o[0],o.length>1&&(i=o[1]),o.length>2&&(s=o[2]));var c=r?"function"==typeof r?r():r:{};return Promise.resolve(a(n.state(),t,c)).then(function(r){if(r&&"object"==typeof r&&(n._state=y({},n._state,r),n._useCachedState=!1,!n._replaying&&(n.emitChange(),i&&"string"==typeof i))){var o=s?s(t,r,c):r;n.emit(i,o,n.state())}n._cache.events.push({type:e,payload:t,replayed:n._replaying})})}catch(e){return Promise.reject(e)}},listen:function(e){e&&"function"==typeof e&&this.on(this._changeEvent,e)},emitChange:function(){return this.emit(this._changeEvent,this.state()),this},extend:function(t){void 0===t&&(t={});var n=t.changeEvent,r=t.state,o=void 0===r?{}:r,a=b(t,["changeEvent","state"]),i=w(o,t.getters),s=Object.assign({},e(i||e._state,n||e._changeEvent),a);return delete s.extend,s},uncommittedEvents:function(){return(this._cache.events||[]).filter(function(e){return!e.replayed})[0]}})._events=o._events||{},o.on=function(e,t){"object"!=typeof o._events[e]&&(o._events[e]=[]),o._events[e].push(t)},o.removeListener=function(e,t){var n;"object"==typeof o._events[e]&&(n=o._events[e].indexOf(t))>-1&&o._events[e].splice(n,1)},o.emit=function(e){var t,n,r,a=[].slice.call(arguments,1);if("object"==typeof o._events[e])for(r=(n=[].slice.call(o._events[e])).length,t=0;t<r;t++)n[t].apply(o,a)},o.once=function(e,t){o.on(e,function n(){o.removeListener(e,n),t.apply(o,arguments)})},o;var o}(o.state,i,function(){return r.context?"function"==typeof r.context?r.context(e):r.context:e.ctx}).extend(y({name:t,state:c},l));return n[t]=u,u},getStore:function(e){return n[e]},removeStore:function(e){delete n[e]}};return r.stores&&Object.keys(r.stores).forEach(function(e){o.registerStore(e,r.stores[e])}),o}})});
//# sourceMappingURL=plugins.js.map
