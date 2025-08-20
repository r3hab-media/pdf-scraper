const CACHE_NAME = "scrapestack-cache-v1";
const STATIC_ASSETS = [
	"./",
	"./manifest.webmanifest",
	"./sw.js",
	"https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.3/css/bootstrap.min.css",
	"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css",
	"https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700&display=swap",
];

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(STATIC_ASSETS);
		})
	);
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames.map((cache) => {
					if (cache !== CACHE_NAME) {
						return caches.delete(cache);
					}
				})
			);
		})
	);
	self.clients.claim();
});

self.addEventListener("fetch", (event) => {
	event.respondWith(
		caches.match(event.request).then((cachedResponse) => {
			return cachedResponse || fetch(event.request);
		})
	);
});
