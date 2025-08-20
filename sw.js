const CACHE_NAME = "scrapestack-cache-v1";
const STATIC_ASSETS = [
	"./",
	"./manifest.webmanifest",
	"./sw.js",
	"https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.3/css/bootstrap.min.css",
	"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css",
	"https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700&display=swap",
];

self.addEventListener("install", (e) => {
	e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(STATIC_ASSETS)));
	self.skipWaiting();
});
self.addEventListener("activate", (e) => {
	e.waitUntil(caches.keys().then((keys) => Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))));
	self.clients.claim();
});
self.addEventListener("fetch", (event) => {
	const url = new URL(event.request.url);
	// only handle same-origin on GH Pages
	if (url.origin !== self.location.origin) return;
	event.respondWith(caches.match(event.request).then((r) => r || fetch(event.request)));
});
