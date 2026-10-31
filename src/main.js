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
import { mountMejoraWalkthrough } from './walkthrough.js'
import { initMejoraSettings } from './settings.js'
import { initMejoraUXEnhancements } from './ux-enhancements.js'
import { initDashboardPreferences } from './dashboard-preferences.js'
import { initAppCleanup } from './app-cleanup.js'

createApp(App).mount('#app')

// Transitional brand layer while the GitHub Pages repository still uses the /stockpilot/ path.
// Keeps every customer-facing StockPilot reference branded as Mejora without changing routing.
const rebrand = root => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const nodes = []
  while (walker.nextNode()) nodes.push(walker.currentNode)
  for (const node of nodes) {
    if (node.nodeValue?.includes('StockPilot')) node.nodeValue = node.nodeValue.replaceAll('StockPilot', 'Mejora')
    if (node.nodeValue?.includes('stockpilot.demo')) node.nodeValue = node.nodeValue.replaceAll('stockpilot.demo', 'mejora.demo')
  }
}
rebrand(document.body)
new MutationObserver(records => {
  for (const record of records) for (const node of record.addedNodes) if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) rebrand(node)
}).observe(document.body,{childList:true,subtree:true})

// Replace the legacy icon-line hero with the visual product walkthrough.
mountMejoraWalkthrough(document)

// Add persistent settings, notifications, theme and installable mobile/PWA behavior.
initMejoraSettings()

// Add premium dark-mode refinements, device-aware install UI, smooth motion and supplier contact tools.
initMejoraUXEnhancements()

// Let each user choose whether dashboard data is shown as KPI numbers, bars, pie, or text.
initDashboardPreferences()

// Remove duplicate/unneeded controls and turn every industry-specific menu into a working module.
initAppCleanup()

// Preserve the existing preview account internally while displaying the Mejora-branded address.
document.addEventListener('submit', event => {
  const email = event.target?.querySelector?.('input[name="email"]')
  if (email?.value === 'jamie@mejora.demo') email.value = 'jamie@stockpilot.demo'
}, true)
