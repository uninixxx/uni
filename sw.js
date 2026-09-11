self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
// Deliberately no fetch/cache handler: accounts and live tickets always use the network.
self.addEventListener('push',event=>{
 let data={};try{data=event.data?.json()||{}}catch{}
 const view=['floor','cast','timer'].includes(data.tab)?data.tab:'floor';
 let url=new URL('?view='+view,self.registration.scope).href;
 try{const candidate=new URL(data.url);if(candidate.origin===self.location.origin&&candidate.href.startsWith(self.registration.scope))url=candidate.href}catch{}
 event.waitUntil(self.registration.showNotification(String(data.title||'Hanabiのお知らせ').slice(0,80),{
  body:String(data.body||'アプリを開いて内容をご確認ください。').slice(0,240),
  icon:new URL('icon-192.png',self.registration.scope).href,
  badge:new URL('icon-192.png',self.registration.scope).href,
  tag:String(data.id||'hanabi-notice').slice(0,200),data:{url,view}
 }));
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
