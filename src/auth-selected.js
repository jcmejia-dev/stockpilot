let authQueued=false

function referenceScene(){
  return `<div class="auth-reference-scene" aria-hidden="true">
    <div class="auth-reference-features">
      <article><span class="reference-feature-icon bars"><i></i><i></i><i></i></span><div><strong>Adaptive dashboard</strong><small>See what matters with real-time insights tailored to your business.</small></div></article>
      <article><span class="reference-feature-icon sheet"><i></i></span><div><strong>Bring your spreadsheet</strong><small>Import existing Excel or CSV inventory in minutes.</small></div></article>
      <article><span class="reference-feature-icon bell"><i></i></span><div><strong>Stay in control</strong><small>Get low-stock alerts and track movements across locations.</small></div></article>
    </div>
    <div class="auth-reference-stage">
      <div class="auth-reference-stone"></div>
      <div class="auth-reference-plant plant-left"><i></i><i></i><i></i><i></i><i></i></div>
      <div class="auth-reference-plant plant-right"><i></i><i></i><i></i></div>
      <div class="auth-reference-laptop">
        <div class="laptop-display">
          <div class="laptop-app">
            <aside class="laptop-sidebar">
              <b>Mejora</b>
              <span class="active">▣ Dashboard</span><span>◇ Products</span><span>⇄ Stock Movement</span><span>♙ Suppliers</span><span>△ Low Stock</span><span>▤ Reports</span><span>⚙ Settings</span>
            </aside>
            <section class="laptop-content">
              <div class="laptop-toolbar"><span>⌕&nbsp;&nbsp; Search products, suppliers, or references...</span><b>JD</b></div>
              <div class="laptop-greeting"><div><strong>Good morning, Jamie!</strong><small>Here’s what’s happening with your inventory today.</small></div><small>Apr 24, 2024&nbsp; ◫</small></div>
              <div class="laptop-stats">
                <div><small>Products</small><strong>124</strong></div><div><small>Units</small><strong>1,248</strong></div><div class="warn"><small>Low stock</small><strong>12</strong></div>
              </div>
              <div class="laptop-analytics">
                <div class="laptop-chart"><div class="chart-head"><strong>Stock overview</strong><small>Last 6 months⌄</small></div><div class="bars-row"><i style="--h:34%"></i><i style="--h:48%"></i><i style="--h:63%"></i><i style="--h:79%"></i><i style="--h:68%"></i><i style="--h:57%"></i></div><div class="chart-months"><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span></div></div>
                <div class="laptop-donut-card"><strong>Stock status</strong><div class="laptop-donut"></div><small><i class="good"></i> Healthy&nbsp;&nbsp;70%</small><small><i class="low"></i> Low stock&nbsp;&nbsp;24%</small><small><i class="out"></i> Out of stock&nbsp;&nbsp;6%</small></div>
              </div>
              <div class="laptop-activity"><div class="activity-head"><strong>Recent activity</strong><small>View all →</small></div><div class="activity-row head"><span>Product</span><span>Type</span><span>Quantity</span><span>Date</span></div><div class="activity-row"><span>Brake Pad Set</span><em>In</em><b>18</b><span>Apr 24, 2024</span></div><div class="activity-row"><span>Engine Oil 1L</span><em class="out">Out</em><b>7</b><span>Apr 23, 2024</span></div><div class="activity-row"><span>Spark Plug CR8E</span><em>In</em><b>24</b><span>Apr 23, 2024</span></div></div>
            </section>
          </div>
        </div>
        <div class="laptop-base"><span></span></div>
      </div>
    </div>
  </div>`
}

function enhanceAuth(){
  authQueued=false
  const page=document.querySelector('.auth-page')
  const card=page?.querySelector('.auth-card')
  const brand=page?.querySelector('.auth-brand-copy')
  if(!page||!card||!brand)return

  if(!brand.querySelector('.auth-reference-scene'))brand.insertAdjacentHTML('beforeend',referenceScene())

  const email=card.querySelector('input[name="email"]')
  const password=card.querySelector('input[name="password"]')
  const name=card.querySelector('input[name="name"]')
  if(email){email.placeholder='you@company.com';email.autocomplete='email';email.setAttribute('aria-label','Email')}
  if(password){password.placeholder='Enter your password';password.autocomplete=card.querySelector('.eyebrow')?.textContent?.toLowerCase().includes('start')?'new-password':'current-password';password.setAttribute('aria-label','Password')}
  if(name){name.placeholder='Your full name';name.autocomplete='name'}

  const demo=card.querySelector('.demo-credentials')
  if(demo&&!demo.previousElementSibling?.classList.contains('auth-reference-divider')){
    const divider=document.createElement('div');divider.className='auth-reference-divider';divider.setAttribute('aria-hidden','true');divider.innerHTML='<span>OR</span>';demo.before(divider)
  }
}

function queueAuthEnhancement(){if(authQueued)return;authQueued=true;requestAnimationFrame(enhanceAuth)}

export function initSelectedAuth(){enhanceAuth();new MutationObserver(queueAuthEnhancement).observe(document.querySelector('#app')||document.body,{childList:true,subtree:true})}
