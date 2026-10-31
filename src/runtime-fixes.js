let queued=false

const DASHBOARD_COPY={
  'Retail Store':'Track shelf stock, barcodes and fast-moving items.',
  'Motorcycle Parts':'Organize parts by number, brand and vehicle compatibility.',
  'Food Business':'Watch ingredients, batches and expiry-sensitive stock.',
  'Online Seller':'Manage SKUs, variants, orders and stock reserved for customers.',
  'Small Warehouse':'Track where every item is stored and how it moves.',
  'Hardware Store':'Handle pieces, boxes, meters and kilogram-based materials.',
  'Clothing Store':'Track each style across sizes, colors and collections.',
  'Electronics Store':'Track models, individual serial numbers and warranties.',
  'Other':'A flexible inventory workspace you can configure later.'
}

function currentPage(){return document.querySelector('.content-wrap .hero-row h1')?.textContent?.trim()||''}
function currentBusinessType(){return document.querySelector('.workspace-copy span')?.textContent?.trim()||'Other'}
function closeNotifications(){document.querySelector('[data-close-notifications]')?.click()}

function fixPageCopy(){
  const page=currentPage(),hero=document.querySelector('.content-wrap .hero-row')
  if(page!=='Dashboard'||!hero)return
  const p=hero.querySelector(':scope > div > p')
  if(p)p.textContent=DASHBOARD_COPY[currentBusinessType()]||DASHBOARD_COPY.Other
}

function polishNotifications(){
  const panel=document.querySelector('.mejora-notification-panel')
  if(!panel)return
  if(panel.parentElement!==document.body)document.body.appendChild(panel)
  panel.setAttribute('aria-label','Notifications')
  const unread=panel.querySelectorAll('.notification-item.unread').length
  const total=panel.querySelectorAll('.notification-item').length
  const title=panel.querySelector('.notification-head h3')
  if(title)title.textContent=unread?`Updates · ${unread} new`:total?'Updates':'Updates'
}

function scan(){queued=false;fixPageCopy();polishNotifications()}
function queue(){if(queued)return;queued=true;requestAnimationFrame(scan)}

export function initRuntimeFixes(){
  document.addEventListener('click',event=>{
    if(event.target.closest('.nav-list .nav-item,.sidebar-bottom .nav-item'))closeNotifications()
  },true)
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closeNotifications()})
  new MutationObserver(queue).observe(document.body,{childList:true,subtree:true,characterData:true})
  queue()
}
