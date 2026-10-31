let queued=false

function enhanceAuth(){
  queued=false
  const page=document.querySelector('.auth-page')
  const card=page?.querySelector('.auth-card')
  if(!page||!card)return

  // Use the approved reference artwork as a normal static asset.
  page.style.setProperty('--mejora-auth-bg','url("/stockpilot/mejora-auth-bg.webp?v=69")')

  const email=card.querySelector('input[name="email"]')
  const password=card.querySelector('input[name="password"]')
  const name=card.querySelector('input[name="name"]')
  if(email){email.placeholder='you@company.com';email.autocomplete='email'}
  if(password){password.placeholder='Enter your password';password.autocomplete=card.querySelector('.eyebrow')?.textContent?.toLowerCase().includes('start')?'new-password':'current-password'}
  if(name){name.placeholder='Your full name';name.autocomplete='name'}

  const demo=card.querySelector('.demo-credentials')
  if(demo&&!demo.previousElementSibling?.classList.contains('auth-reference-divider')){
    const divider=document.createElement('div')
    divider.className='auth-reference-divider'
    divider.innerHTML='<span>OR</span>'
    demo.before(divider)
  }
}

function queue(){if(queued)return;queued=true;requestAnimationFrame(enhanceAuth)}

export function initSelectedAuth(){
  enhanceAuth()
  new MutationObserver(queue).observe(document.querySelector('#app')||document.body,{childList:true,subtree:true})
}
