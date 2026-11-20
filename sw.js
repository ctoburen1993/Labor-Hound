/* Labor Hound service worker — build 11182026-21
   Keeps the app's own files (this folder on GitHub Pages) so Labor Hound opens with no signal.
   index.html: network first (a new upload shows up right away), cached copy when offline.
   Icons / manifest / get page: cache first. Anything from another site (weather, fonts) is left alone.
   It never touches job data: that lives in the phone's localStorage / IndexedDB, which a service worker can't change here. */
const VERSION='lh-11182026-21';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./favicon.png','./favicon.ico','./get.html'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(SHELL)));});   // waits until the PM taps "update"
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('lh-')&&k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('message',e=>{if(e.data==='skipWaiting')self.skipWaiting();});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin)return;
  const scope=new URL(self.registration.scope);if(!u.pathname.startsWith(scope.pathname))return;
  const isApp=r.mode==='navigate'||u.pathname===scope.pathname||u.pathname.endsWith('/index.html');
  if(isApp){e.respondWith(fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(VERSION).then(c=>c.put(u.pathname.endsWith('get.html')?r:'./index.html',cp));}return res;})
      .catch(()=>caches.match(u.pathname.endsWith('get.html')?r:'./index.html',{ignoreSearch:true}).then(m=>m||caches.match('./',{ignoreSearch:true}))));return;}
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(m=>m||fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(VERSION).then(c=>c.put(r,cp));}return res;})));});
