import { watch } from 'vue'

const SESSION_KEY='mejora.preview.state.v1'
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

function load(){try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{return null}}
function save(snapshot){try{localStorage.setItem(SESSION_KEY,JSON.stringify(snapshot))}catch{}}
function clear(){localStorage.removeItem(SESSION_KEY)}
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
  panel.setAttribute('aria-label','Notifications')
  const count=panel.querySelectorAll('.notification-item').length
  const title=panel.querySelector('.notification-head h3')
  if(title)title.textContent=count?`Updates · ${count}`:'Updates'
}

function scan(){queued=false;fixPageCopy();polishNotifications()}
function queue(){if(queued)return;queued=true;requestAnimationFrame(scan)}

export function initRuntimeFixes(app){
  const state=app?._instance?.setupState
  if(state){
    const stored=load()
    if(stored?.currentUser){
      state.currentUser=stored.currentUser
      state.businesses=Array.isArray(stored.businesses)?stored.businesses:[]
      state.activeBusinessId=stored.activeBusinessId??null
      state.activePage=stored.activePage||'Dashboard'
      state.products=Array.isArray(stored.products)?stored.products:[]
      state.movements=Array.isArray(stored.movements)?stored.movements:[]
      state.suppliers=Array.isArray(stored.suppliers)?stored.suppliers:[]
    }
    watch(()=>({
      currentUser:state.currentUser,
      businesses:state.businesses,
      activeBusinessId:state.activeBusinessId,
      activePage:state.activePage,
      products:state.products,
      movements:state.movements,
      suppliers:state.suppliers
    }),snapshot=>{
      if(snapshot.currentUser)save(snapshot)
      else clear()
    },{deep:true,immediate:true})
  }

  document.addEventListener('click',event=>{
    if(event.target.closest('.logout-button,.logout-link'))clear()
    if(event.target.closest('.nav-list .nav-item,.sidebar-bottom .nav-item'))closeNotifications()
  },true)
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closeNotifications()})
  new MutationObserver(queue).observe(document.body,{childList:true,subtree:true,characterData:true})
  queue()
}
