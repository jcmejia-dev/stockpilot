import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import './tenant.css'
import './branding.css'
import './walkthrough.css'
import './settings.css'
import './ux-enhancements.css'
import './dashboard-preferences.css'
import './app-cleanup.css'
import './runtime-fixes.css'
import './notification-position-fix.css'
import './inventory-tools.css'
import './auth-selected.css'
import './auth-bg-direct-fix.css'
import { mountMejoraWalkthrough } from './walkthrough.js'
import { initMejoraSettings } from './settings.js'
import { initMejoraUXEnhancements } from './ux-enhancements.js'
import { initDashboardPreferences } from './dashboard-preferences.js'
import { initAppCleanup } from './app-cleanup.js'
import { initRuntimeFixes } from './runtime-fixes.js'
import { initInspectDeterrent } from './inspect-deterrent.js'
import { initInventoryTools } from './inventory-tools.js'
import { installSessionPersistence } from './session-persistence.js'
import { initSelectedAuth } from './auth-selected.js'

const app=createApp(App)
installSessionPersistence(app)
const vm=app.mount('#app')

const rebrand=root=>{
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT)
  const nodes=[]
  while(walker.nextNode())nodes.push(walker.currentNode)
  for(const node of nodes){
    if(node.nodeValue?.includes('StockPilot'))node.nodeValue=node.nodeValue.replaceAll('StockPilot','Mejora')
    if(node.nodeValue?.includes('stockpilot.demo'))node.nodeValue=node.nodeValue.replaceAll('stockpilot.demo','mejora.demo')
  }
}
rebrand(document.body)
new MutationObserver(records=>{
  for(const record of records)for(const node of record.addedNodes)if(node.nodeType===Node.ELEMENT_NODE||node.nodeType===Node.TEXT_NODE)rebrand(node)
}).observe(document.body,{childList:true,subtree:true})

initSelectedAuth()
mountMejoraWalkthrough(document)
initMejoraSettings()
initMejoraUXEnhancements()
initDashboardPreferences()
initAppCleanup()
initRuntimeFixes()
initInventoryTools(vm)
initInspectDeterrent()

if('serviceWorker' in navigator){
  setTimeout(()=>navigator.serviceWorker.getRegistration('/stockpilot/').then(reg=>reg?.update()).catch(()=>{}),800)
}

document.addEventListener('submit',event=>{
  const email=event.target?.querySelector?.('input[name="email"]')
  if(email?.value==='jamie@mejora.demo')email.value='jamie@stockpilot.demo'
},true)
