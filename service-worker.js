const CACHE_NAME = 'memo-app-v4';
const CORE_ASSETS = [
    './',
    './index.html',
    './firebase-config.js',
    './manifest.json',
    './icons/icon-192.png',
    './icons/icon-512.png'
];
const CDN_ASSETS = [
    'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js',
    'https://www.gstatic.com/firebasejs/10.12.2/firebase-database-compat.js'
];

// 安装：预缓存静态资源。单个资源失败不阻断安装
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache =>
            Promise.all(
                [...CORE_ASSETS, ...CDN_ASSETS].map(url =>
                    cache.add(url).catch(() => null)
                )
            )
        ).then(() => self.skipWaiting())
    );
});

// 激活：清理旧缓存并立即接管
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// 请求拦截
self.addEventListener('fetch', event => {
    const request = event.request;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);

    // Firebase 接口始终走网络
    if (url.hostname.includes('firebaseio.com') ||
        url.hostname.includes('firebaseapp.com') ||
        (url.hostname.includes('googleapis.com') &&
            (url.pathname.includes('identitytoolkit') || url.pathname.includes('securetoken')))) {
        return;
    }

    // 页面导航：网络优先，保证更新能及时生效；离线时回退缓存
    if (request.mode === 'navigate' || request.destination === 'document') {
        event.respondWith(
            fetch(request).then(response => {
                const copy = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy)).catch(() => {});
                return response;
            }).catch(() =>
                caches.match(request).then(cached => cached || caches.match('./index.html'))
            )
        );
        return;
    }

    // 静态资源：缓存优先，同时后台更新
    event.respondWith(
        caches.match(request).then(cached => {
            const network = fetch(request).then(response => {
                if (response && (response.ok || response.type === 'opaque')) {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, copy)).catch(() => {});
                }
                return response;
            }).catch(() => cached);
            return cached || network;
        })
    );
});
