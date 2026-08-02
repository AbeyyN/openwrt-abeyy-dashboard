const C='abeyy-dashboard-v7',F=['/dashboard/','/dashboard/index.html','/dashboard/style.css','/dashboard/app.js','/dashboard/manifest.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F)));self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x))))));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(u.pathname.startsWith('/cgi-bin/dashboard/'))return e.respondWith(fetch(e.request));e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))});
