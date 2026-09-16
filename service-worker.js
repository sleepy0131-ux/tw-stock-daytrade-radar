// 極簡 Service Worker:快取這個 App 本身的靜態檔案,讓離線/弱網時還能打開介面
// (行情資料本身還是需要網路才能更新,這裡只確保「殼」能離線開啟)
const CACHE_NAME = "tw-radar-cache-v1";
const ASSETS = [
  "./tw_stock_snr_kline.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  // 只快取自己的靜態檔案,行情 API 一律直接打網路,不要快取到舊報價
  if(ASSETS.some((a) => url.pathname.endsWith(a.replace("./","")))){
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
});
