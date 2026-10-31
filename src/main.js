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

// Lightweight UI deterrent for common Inspect / Developer Tools entry points.
// This is intentionally only a deterrent; real security must remain server-side.
const initInspectDeterrent = () => {
  let hideTimer
  const ensureToast = () => {
    let toast = document.querySelector('.mejora-prohibited-toast')
    if (toast) return toast
    toast = document.createElement('div')
    toast.className = 'mejora-prohibited-toast'
    toast.setAttribute('role','status')
    toast.setAttribute('aria-live','polite')
    toast.innerHTML = '<div class="mejora-prohibited-icon">!</div><div><strong>Action prohibited</strong><span>Inspect and Developer Tools shortcuts are disabled in Mejora.</span></div>'
    const style = document.createElement('style')
    style.textContent = `
      .mejora-prohibited-toast{position:fixed;right:22px;bottom:22px;z-index:100000;display:flex;align-items:center;gap:12px;max-width:390px;padding:13px 16px;border:1px solid rgba(220,38,38,.22);border-radius:14px;background:rgba(255,255,255,.97);color:#17211c;box-shadow:0 16px 42px rgba(15,23,42,.18);font-family:inherit;opacity:0;transform:translateY(14px) scale(.98);pointer-events:none;transition:opacity .2s ease,transform .2s ease}
      .mejora-prohibited-toast.show{opacity:1;transform:translateY(0) scale(1)}
      .mejora-prohibited-toast strong{display:block;font-size:13px;line-height:1.2;margin-bottom:3px}
      .mejora-prohibited-toast span{display:block;font-size:11px;line-height:1.4;color:#66756d}
      .mejora-prohibited-icon{width:30px;height:30px;flex:0 0 30px;display:grid;place-items:center;border-radius:9px;background:#fff0f0;color:#c62828;font-weight:800}
      [data-theme="dark"] .mejora-prohibited-toast{background:rgba(18,31,25,.98);color:#f4fbf7;border-color:rgba(248,113,113,.25);box-shadow:0 18px 48px rgba(0,0,0,.38)}
      [data-theme="dark"] .mejora-prohibited-toast span{color:#a9bbb1}
      [data-theme="dark"] .mejora-prohibited-icon{background:rgba(248,113,113,.12);color:#fca5a5}
      @media(max-width:600px){.mejora-prohibited-toast{left:14px;right:14px;bottom:16px;max-width:none}}
      @media(prefers-reduced-motion:reduce){.mejora-prohibited-toast{transition:none}}
    `
    document.head.appendChild(style)
    document.body.appendChild(toast)
    return toast
  }
  const prohibited = () => {
    const toast = ensureToast()
    toast.classList.remove('show')
    void toast.offsetWidth
    toast.classList.add('show')
    clearTimeout(hideTimer)
    hideTimer = setTimeout(()=>toast.classList.remove('show'),2400)
  }
  document.addEventListener('keydown', event => {
    const key = String(event.key||'').toLowerCase()
    const ctrlShift = event.ctrlKey && event.shiftKey
    const cmdAlt = event.metaKey && event.altKey
    const devtoolsShortcut = event.key === 'F12' || (ctrlShift && ['i','j','c'].includes(key)) || (cmdAlt && ['i','j','c'].includes(key)) || ((event.ctrlKey || event.metaKey) && key === 'u')
    if (!devtoolsShortcut) return
    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation?.()
    prohibited()
  }, true)
  document.addEventListener('contextmenu', event => {
    event.preventDefault()
    prohibited()
  }, true)
}
initInspectDeterrent()

// Preserve the existing preview account internally while displaying the Mejora-branded address.
document.addEventListener('submit', event => {
  const email = event.target?.querySelector?.('input[name="email"]')
  if (email?.value === 'jamie@mejora.demo') email.value = 'jamie@stockpilot.demo'
}, true)
