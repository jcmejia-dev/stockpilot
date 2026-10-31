import { exactAuthDataUrl } from './auth-bg/exact-direct.js'

let queued = false

function applyExactArtwork(page) {
  page.style.setProperty('background-image', exactAuthDataUrl, 'important')
  page.style.setProperty('background-repeat', 'no-repeat', 'important')
  page.style.setProperty('background-position', '0 0', 'important')
  page.style.setProperty('background-size', '100% 100%', 'important')

  page.querySelector('.auth-exact-background')?.remove()
  page.querySelector('.auth-reference-scene')?.remove()
}

function enhanceAuth() {
  queued = false
  const page = document.querySelector('.auth-page')
  const card = page?.querySelector('.auth-card')
  if (!page || !card) return

  applyExactArtwork(page)
  page.classList.add('auth-approved-artwork')

  const email = card.querySelector('input[name="email"]')
  const password = card.querySelector('input[name="password"]')
  const name = card.querySelector('input[name="name"]')

  if (email) {
    email.placeholder = 'you@company.com'
    email.autocomplete = 'email'
    email.setAttribute('aria-label', 'Email')
  }
  if (password) {
    password.placeholder = 'Enter your password'
    password.autocomplete = card.querySelector('.eyebrow')?.textContent?.toLowerCase().includes('start') ? 'new-password' : 'current-password'
    password.setAttribute('aria-label', 'Password')
  }
  if (name) {
    name.placeholder = 'Your full name'
    name.autocomplete = 'name'
  }

  const demo = card.querySelector('.demo-credentials')
  if (demo && !demo.previousElementSibling?.classList.contains('auth-reference-divider')) {
    const divider = document.createElement('div')
    divider.className = 'auth-reference-divider'
    divider.setAttribute('aria-hidden', 'true')
    divider.innerHTML = '<span>OR</span>'
    demo.before(divider)
  }
}

function queueEnhancement() {
  if (queued) return
  queued = true
  requestAnimationFrame(enhanceAuth)
}

export function initSelectedAuth() {
  enhanceAuth()
  new MutationObserver(queueEnhancement).observe(document.querySelector('#app') || document.body, { childList: true, subtree: true })
}
