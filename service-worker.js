const CACHE_NAME = 'memo-app-v1';
const ASSETS = [
    './',
    './index.html',
    './firebase-config.js',
    './manifest.json',
    './icons/icon-192.png',
    './icons/icon-512.png',
    'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js',
    'https://www.gstatic.com/firebasejs/10.12.2/firebase-database-compat.js'
];

// 安装：预缓存静态资源
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

// 激活：清理旧缓存
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// 请求拦截：缓存优先，网络回退；Firebase API 走网络
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Firebase API 请求始终走网络
    if (url.hostname.includes('firebaseio.com') ||
        url.hostname.includes('googleapis.com') && url.pathname.includes('identitytoolkit') ||
        url.hostname.includes('googleapis.com') && url.pathname.includes('securetoken')) {
        event.respondWith(fetch(event.request));
        return;
    }

    // 其他请求：缓存优先，失败再走网络
    event.respondWith(
        caches.match(event.request).then(cached => {
            return cached || fetch(event.request).then(response => {
                // 动态缓存新资源
                if (response.ok && response.type === 'basic') {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                }
                return response;
            });
        }).catch(() => {
            // 离线且无缓存时的回退
            if (event.request.destination === 'document') {
                return caches.match('./index.html');
            }
        })
    );
});
