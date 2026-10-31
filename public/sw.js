const CACHE='mejora-shell-v5'
const BASE='/stockpilot/'
const CORE=[BASE,`${BASE}manifest.webmanifest`,`${BASE}mejora-logo.svg`,`${BASE}mejora-auth-bg.webp?v=69`]

async function put(cacheName,request,response){
  if(!response||!response.ok)return response
  const cache=await caches.open(cacheName)
  await cache.put(request,response.clone())
  return response
}

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()))
})

self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))
})

self.addEventListener('fetch',event=>{
  const request=event.request
  if(request.method!=='GET')return
  const url=new URL(request.url)
  if(url.origin!==location.origin)return

  if(request.mode==='navigate'){
    event.respondWith(fetch(request).then(response=>put(CACHE,BASE,response)).catch(()=>caches.match(BASE)))
    return
  }

  if(['script','style','worker','image'].includes(request.destination)){
    event.respondWith(fetch(request).then(response=>put(CACHE,request,response)).catch(()=>caches.match(request)))
    return
  }

  event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>put(CACHE,request,response))))
})
