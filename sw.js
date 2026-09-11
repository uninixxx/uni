self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
// Deliberately no fetch/cache handler: accounts and live tickets always use the network.
self.addEventListener('push',event=>{
 let data={};try{data=event.data?.json()||{}}catch{}
 const view=['floor','cast','timer'].includes(data.tab)?data.tab:'floor';
 let url=new URL('?view='+view,self.registration.scope).href;
 try{const candidate=new URL(data.url);if(candidate.origin===self.location.origin&&candidate.href.startsWith(self.registration.scope))url=candidate.href}catch{}
 event.waitUntil((async()=>{await self.registration.showNotification(String(data.title||data.notification?.title||'Hanabiのお知らせ').slice(0,80),{
  body:String(data.body||'アプリを開いて内容をご確認ください。').slice(0,240),
  icon:new URL('icon-192.png',self.registration.scope).href,
  badge:new URL('icon-192.png',self.registration.scope).href,
  tag:String(data.id||'hanabi-notice').slice(0,200),silent:false,data:{url,view}
 });
 const receipt=data.receipt;
 if(receipt&&/^[a-f0-9]{64}$/.test(receipt.objectId)&&/^[a-f0-9]{64}$/.test(receipt.token))try{
  await fetch('https://hanabi-table-book.zzjp5h5ydx.chatgpt.site/api/push',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'omit',body:JSON.stringify({type:'receipt',objectId:receipt.objectId,token:receipt.token}),signal:AbortSignal.timeout(8000)});
 }catch{}
 })());
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 event.waitUntil((async()=>{
  const data=event.notification.data||{},candidate=new URL(data.url||self.registration.scope);
  const url=candidate.origin===self.location.origin&&candidate.href.startsWith(self.registration.scope)?candidate.href:self.registration.scope;
  const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  const client=windows.find(c=>c.url.startsWith(self.registration.scope)&&new URL(c.url).pathname===new URL(url).pathname);
  if(client){await client.focus();client.postMessage({type:'hanabi-notification-open',view:data.view})}else await self.clients.openWindow(url);
 })());
});
