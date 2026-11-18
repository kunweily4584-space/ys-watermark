// 永昇驗屋水印：離線快取。更新 App 時把 CACHE 版本號 +1
const CACHE='ys-wm-v3';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
function refresh(){return fetch('./index.html',{cache:'no-store'}).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put('./index.html',cp))}return res})}
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  // 主頁：立刻用手機裡的版本打開（沒訊號、訊號很弱都不用等），同時在背景抓新版，下次開啟生效
  if(r.mode==='navigate'){
    e.respondWith(caches.match('./index.html').then(hit=>{const net=refresh().catch(()=>null);if(hit){e.waitUntil(net);return hit}return net.then(res=>res||new Response('離線中，請先在有網路時開啟一次',{headers:{'Content-Type':'text/plain;charset=utf-8'}}))}));
    return;
  }
  // 其他（圖示、字型、壓縮工具）：先用快取，沒有再抓網路並存起來
  e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{if(res.ok||res.type==='opaque'){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res}).catch(()=>new Response('',{status:504}))));
});
