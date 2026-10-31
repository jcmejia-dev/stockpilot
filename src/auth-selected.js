let authQueued=false

function enhanceAuth(){
  authQueued=false
  const card=document.querySelector('.auth-page .auth-card')
  if(!card)return

  const email=card.querySelector('input[name="email"]')
  const password=card.querySelector('input[name="password"]')
  const name=card.querySelector('input[name="name"]')

  if(email){
    email.placeholder='you@company.com'
    email.autocomplete='email'
    email.setAttribute('aria-label','Email')
  }
  if(password){
    password.placeholder='Enter your password'
    password.autocomplete=card.querySelector('.eyebrow')?.textContent?.toLowerCase().includes('start')?'new-password':'current-password'
    password.setAttribute('aria-label','Password')
  }
  if(name){
    name.placeholder='Your full name'
    name.autocomplete='name'
  }

  const demo=card.querySelector('.demo-credentials')
  if(demo && !demo.previousElementSibling?.classList.contains('auth-reference-divider')){
    const divider=document.createElement('div')
    divider.className='auth-reference-divider'
    divider.setAttribute('aria-hidden','true')
    divider.innerHTML='<span>OR</span>'
    demo.before(divider)
  }
}

function queueAuthEnhancement(){
  if(authQueued)return
  authQueued=true
  requestAnimationFrame(enhanceAuth)
}

export function initSelectedAuth(){
  enhanceAuth()
  new MutationObserver(queueAuthEnhancement).observe(document.querySelector('#app')||document.body,{childList:true,subtree:true})
}
