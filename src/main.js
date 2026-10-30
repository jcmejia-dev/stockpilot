import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import './tenant.css'
import './branding.css'
import './walkthrough.css'
import { mountMejoraWalkthrough } from './walkthrough.js'

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

// Replace the legacy icon-line hero with a real visual product walkthrough.
mountMejoraWalkthrough(document)

// Preserve the existing preview account internally while displaying the Mejora-branded address.
document.addEventListener('submit', event => {
  const email = event.target?.querySelector?.('input[name="email"]')
  if (email?.value === 'jamie@mejora.demo') email.value = 'jamie@stockpilot.demo'
}, true)
