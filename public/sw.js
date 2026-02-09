const CACHE_NAME = "dm-v1";
const STATIC_ASSETS = ["/", "/styles.css"];

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)),
	);
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((names) =>
				Promise.all(
					names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)),
				),
			),
	);
	self.clients.claim();
});

self.addEventListener("fetch", (event) => {
	const { request } = event;
	if (request.method !== "GET") return;

	// Never cache API responses - always go to network
	if (request.url.includes("/api/")) {
		return;
	}

	// Network-first for HTML, cache-first for static assets
	if (request.headers.get("accept")?.includes("text/html")) {
		event.respondWith(fetch(request).catch(() => caches.match(request)));
	} else {
		event.respondWith(
			caches.match(request).then(
				(cached) =>
					cached ||
					fetch(request).then((response) => {
						const clone = response.clone();
						caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
						return response;
					}),
			),
		);
	}
});
