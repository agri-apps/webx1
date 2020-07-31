// import service worker script
importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const cacheName = 'app-cache-v1';

["/index.html", "/assets/*", "/templates/*", "/*.js"].forEach((q) => {
  workbox.routing.registerRoute(
    new RegExp(q),
    new workbox.strategies.NetworkFirst({ cacheName })
  );
});
