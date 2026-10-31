import {resolveVueState,readState,writeState,cloneStateValue} from './state-access.js'

const SESSION_KEY='mejora.preview.state.v2'
const LEGACY_KEY='mejora.preview.state.v1'
let queued=false
let resumeAttempted=false
let stateRef=null

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

function load(){
  try{
    const current=JSON.parse(localStorage.getItem(SESSION_KEY)||'null')
    if(current)return current
    const legacy=JSON.parse(localStorage.getItem(LEGACY_KEY)||'null')
    if(legacy){localStorage.setItem(SESSION_KEY,JSON.stringify(legacy));return legacy}
  }catch{}
  return null
}
function save(snapshot){try{localStorage.setItem(SESSION_KEY,JSON.stringify(snapshot));localStorage.removeItem(LEGACY_KEY)}catch{}}
function clear(){localStorage.removeItem(SESSION_KEY);localStorage.removeItem(LEGACY_KEY)}
function currentPage(){return document.querySelector('.content-wrap .hero-row h1')?.textContent?.trim()||''}
function currentBusinessType(){return document.querySelector('.workspace-copy span')?.textContent?.trim()||'Other'}
function closeNotifications(){document.querySelector('[data-close-notifications]')?.click()}

function snapshot(state){
  if(!state)return null
  const user=readState(state,'currentUser')
  if(!user)return null
  return {
    version:2,
    savedAt:Date.now(),
    currentUser:cloneStateValue(user),
    businesses:cloneStateValue(readState(state,'businesses')||[]),
    activeBusinessId:readState(state,'activeBusinessId')??null,
    activePage:readState(state,'activePage')||'Dashboard',
    products:cloneStateValue(readState(state,'products')||[]),
    movements:cloneStateValue(readState(state,'movements')||[]),
    suppliers:cloneStateValue(readState(state,'suppliers')||[])
  }
}

function restore(state,stored){
  if(!state||!stored?.currentUser)return false
  writeState(state,'currentUser',cloneStateValue(stored.currentUser))
  writeState(state,'businesses',Array.isArray(stored.businesses)?cloneStateValue(stored.businesses):[])
  writeState(state,'activeBusinessId',stored.activeBusinessId??null)
  writeState(state,'activePage',stored.activePage||'Dashboard')
  writeState(state,'products',Array.isArray(stored.products)?cloneStateValue(stored.products):[])
  writeState(state,'movements',Array.isArray(stored.movements)?cloneStateValue(stored.movements):[])
  writeState(state,'suppliers',Array.isArray(stored.suppliers)?cloneStateValue(stored.suppliers):[])
  return true
}

function persistNow(){
  stateRef=stateRef||resolveVueState()
  const data=snapshot(stateRef)
  if(data)save(data)
}

function resumeViaForm(stored){
  if(resumeAttempted||!stored?.currentUser||!document.querySelector('.auth-card'))return
  const form=document.querySelector('.auth-form')
  if(!form)return
  const spans=[...document.querySelectorAll('.demo-credentials span')]
  const email=spans.find(el=>el.textContent.includes('@'))?.textContent.trim()
  const passwordText=spans.find(el=>/password\s*:/i.test(el.textContent))?.textContent||''
  const password=passwordText.split(':').slice(1).join(':').trim()
  const emailInput=form.querySelector('input[name="email"]'),passwordInput=form.querySelector('input[name="password"]')
  if(!email||!password||!emailInput||!passwordInput)return
  resumeAttempted=true
  emailInput.value=email;emailInput.dispatchEvent(new Event('input',{bubbles:true}))
  passwordInput.value=password;passwordInput.dispatchEvent(new Event('input',{bubbles:true}))
  form.requestSubmit()
  setTimeout(()=>{
    stateRef=resolveVueState()
    if(restore(stateRef,stored))persistNow()
  },120)
}

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

function scan(){
  queued=false
  stateRef=stateRef||resolveVueState()
  const stored=load()
  if(stored?.currentUser&&stateRef&&!readState(stateRef,'currentUser'))restore(stateRef,stored)
  if(stored?.currentUser&&!readState(stateRef,'currentUser'))resumeViaForm(stored)
  fixPageCopy();polishNotifications()
}
function queue(){if(queued)return;queued=true;requestAnimationFrame(scan)}

export function initRuntimeFixes(vm){
  stateRef=resolveVueState(vm)
  const stored=load()
  if(stored?.currentUser)restore(stateRef,stored)

  const persistTimer=setInterval(persistNow,700)
  window.addEventListener('pagehide',persistNow)
  window.addEventListener('beforeunload',persistNow)
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')persistNow()})

  document.addEventListener('click',event=>{
    if(event.target.closest('.logout-button,.logout-link')){clear();resumeAttempted=true}
    if(event.target.closest('.nav-list .nav-item,.sidebar-bottom .nav-item'))closeNotifications()
  },true)
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closeNotifications()})
  new MutationObserver(queue).observe(document.body,{childList:true,subtree:true,characterData:true})
  queue()

  window.addEventListener('unload',()=>clearInterval(persistTimer),{once:true})
}
