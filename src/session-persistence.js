import {getCurrentInstance,watch} from 'vue'
import {readState,writeState,cloneStateValue} from './state-access.js'

const SESSION_KEY='mejora.preview.state.v3'
const LEGACY_KEYS=['mejora.preview.state.v2','mejora.preview.state.v1']

function loadSession(){
  const keys=[SESSION_KEY,...LEGACY_KEYS]
  for(const key of keys){
    try{
      const parsed=JSON.parse(localStorage.getItem(key)||'null')
      if(parsed?.currentUser){
        if(key!==SESSION_KEY)localStorage.setItem(SESSION_KEY,JSON.stringify(parsed))
        return parsed
      }
    }catch{}
  }
  return null
}

function clearSession(){
  try{localStorage.removeItem(SESSION_KEY);for(const key of LEGACY_KEYS)localStorage.removeItem(key)}catch{}
}

function snapshot(state){
  const currentUser=readState(state,'currentUser')
  if(!currentUser)return null
  return {
    version:3,
    savedAt:Date.now(),
    currentUser:cloneStateValue(currentUser),
    businesses:cloneStateValue(readState(state,'businesses')||[]),
    activeBusinessId:readState(state,'activeBusinessId')??null,
    activePage:readState(state,'activePage')||'Dashboard',
    products:cloneStateValue(readState(state,'products')||[]),
    movements:cloneStateValue(readState(state,'movements')||[]),
    suppliers:cloneStateValue(readState(state,'suppliers')||[])
  }
}

function restore(state,saved){
  if(!state||!saved?.currentUser)return false
  writeState(state,'currentUser',cloneStateValue(saved.currentUser))
  writeState(state,'businesses',Array.isArray(saved.businesses)?cloneStateValue(saved.businesses):[])
  writeState(state,'activeBusinessId',saved.activeBusinessId??null)
  writeState(state,'activePage',saved.activePage||'Dashboard')
  writeState(state,'products',Array.isArray(saved.products)?cloneStateValue(saved.products):[])
  writeState(state,'movements',Array.isArray(saved.movements)?cloneStateValue(saved.movements):[])
  writeState(state,'suppliers',Array.isArray(saved.suppliers)?cloneStateValue(saved.suppliers):[])
  return true
}

function saveState(state){
  const data=snapshot(state)
  try{
    if(data)localStorage.setItem(SESSION_KEY,JSON.stringify(data))
    else clearSession()
  }catch{}
}

export function installSessionPersistence(app){
  app.mixin({
    created(){
      const instance=getCurrentInstance()
      if(!instance||instance.parent)return
      const state=instance.setupState
      if(!state)return

      const saved=loadSession()
      if(saved?.currentUser)restore(state,saved)

      watch(()=>({
        currentUser:readState(state,'currentUser'),
        businesses:readState(state,'businesses'),
        activeBusinessId:readState(state,'activeBusinessId'),
        activePage:readState(state,'activePage'),
        products:readState(state,'products'),
        movements:readState(state,'movements'),
        suppliers:readState(state,'suppliers')
      }),()=>saveState(state),{deep:true,flush:'sync'})

      const persist=()=>saveState(state)
      window.addEventListener('pagehide',persist)
      window.addEventListener('beforeunload',persist)
      document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')persist()})
    }
  })
}
