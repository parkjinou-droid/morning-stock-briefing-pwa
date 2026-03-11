// Service Worker - 아침 주식 브리핑 PWA
const CACHE_NAME = 'morning-briefing-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/js/main.js',
  '/manifest.json'
];

// 설치 시 정적 자원 캐시
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 활성화 시 이전 캐시 정리
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// 페치 전략: Network First (API), Cache First (정적)
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // API 요청은 네트워크 우선
  if (url.hostname.includes('vercel.app')) {
    event.respondWith(
      fetch(event.request)
        .then(res => res)
        .catch(() => new Response(JSON.stringify({ error: '오프라인 상태입니다' }), {
          headers: { 'Content-Type': 'application/json' }
        }))
    );
    return;
  }

  // 정적 자원은 캐시 우선
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return res;
      });
    })
  );
});
