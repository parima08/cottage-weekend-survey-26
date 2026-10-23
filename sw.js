/* Offline shell only. Sheet reads and all mutations bypass this worker. */
const CACHE='cw26-shell-v1';
const BASE=new URL('./',self.location.href);
const CORE=["index.html", "config.js", "manifest.webmanifest", "fonts/poppins-400.ttf", "fonts/poppins-500.ttf", "fonts/poppins-600.ttf", "img/sfyg-logo.png", "img/icon-192.png", "img/icon-512.png", "img/apple-touch-icon.png"];
const OPTIONAL=["auburn/img/main-aerial.jpg", "auburn/img/main-dining.jpg", "auburn/img/main-dusk.jpg", "auburn/img/main-firepit.jpg", "auburn/img/main-games.jpg", "auburn/img/main-living.jpg", "auburn/img/main-pool.jpg", "auburn/img/main-porch.jpg", "auburn/img/room-main-1.jpg", "auburn/img/room-main-2.jpg", "auburn/img/room-main-3.jpg", "auburn/img/room-main-4.jpg", "auburn/img/room-main-5.jpg", "auburn/img/room-main-living.jpg", "auburn/img/room-second-1.jpg", "auburn/img/room-second-2.jpg", "auburn/img/room-second-living.jpg", "auburn/img/second-01.jpg", "auburn/img/second-02.jpg", "auburn/img/second-04.jpg", "auburn/img/second-06.jpg", "auburn/img/second-09.jpg", "auburn/img/two-homes-aerial.jpg"];
const absolute=path=>new URL(path,BASE).href;
const ASSETS=new Set([...CORE,...OPTIONAL].map(absolute));
const SHELL=absolute('index.html');
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await cache.addAll(CORE.map(path=>new Request(absolute(path),{cache:'reload'})));
    await Promise.allSettled(OPTIONAL.map(path=>cache.add(new Request(absolute(path),{cache:'reload'}))));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    for(const key of await caches.keys())if(key.startsWith('cw26-shell-')&&key!==CACHE)await caches.delete(key);
    await self.clients.claim();
  })());
});
async function networkFirst(request,key){
  const cache=await caches.open(CACHE),controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),3500);
  try{
    const response=await fetch(request,{signal:controller.signal});
    if(!response.ok||response.redirected)throw new Error('Resource unavailable');
    await cache.put(key,response.clone());return response;
  }catch(error){
    const saved=await cache.match(key);if(saved)return saved;throw error;
  }finally{clearTimeout(timer);}
}
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==BASE.origin)return;
  const navigation=event.request.mode==='navigate'&&(url.pathname===BASE.pathname||url.pathname===new URL(SHELL).pathname);
  if(navigation){event.respondWith(networkFirst(event.request,SHELL));return;}
  url.search='';url.hash='';
  if(!ASSETS.has(url.href))return;
  if(url.pathname===new URL('config.js',BASE).pathname){event.respondWith(networkFirst(event.request,url.href));return;}
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE),saved=await cache.match(url.href);if(saved)return saved;
    const response=await fetch(event.request);if(response.ok)await cache.put(url.href,response.clone());return response;
  })());
});
