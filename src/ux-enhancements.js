const SUPPLIER_PREFIX='mejora.suppliers.v1.'
let scanPending=false
let revealObserver=null
let supplierModal=null

function esc(value){return String(value??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[ch]))}
function businessName(){return document.querySelector('.workspace-copy strong')?.textContent?.trim()||'default-business'}
function supplierKey(){return SUPPLIER_PREFIX+businessName().toLowerCase().replace(/[^a-z0-9]+/g,'-')}
function loadSuppliers(){try{const v=JSON.parse(localStorage.getItem(supplierKey())||'[]');return Array.isArray(v)?v:[]}catch{return []}}
function saveSuppliers(items){localStorage.setItem(supplierKey(),JSON.stringify(items))}
function normalizePhone(value){
  let raw=String(value||'').trim().replace(/[()\s.-]/g,'')
  if(!raw)return''
  if(raw.startsWith('00'))raw='+'+raw.slice(2)
  if(/^09\d{9}$/.test(raw))return'+63'+raw.slice(1)
  if(/^9\d{9}$/.test(raw))return'+63'+raw
  if(/^63\d{10}$/.test(raw))return'+'+raw
  if(/^\+\d{8,15}$/.test(raw))return raw
  const digits=raw.replace(/\D/g,'')
  return digits.length>=8&&digits.length<=15?`+${digits}`:''
}
function whatsappNumber(value){return normalizePhone(value).replace(/\D/g,'')}
function isPhone(){
  if(navigator.userAgentData&&typeof navigator.userAgentData.mobile==='boolean')return navigator.userAgentData.mobile
  const ua=navigator.userAgent||''
  if(/iPhone|iPod|Android.+Mobile|Windows Phone|IEMobile|Opera Mini/i.test(ua))return true
  if(/iPad|Tablet|Android(?!.*Mobile)/i.test(ua))return false
  return matchMedia('(max-width: 767px)').matches&&navigator.maxTouchPoints>0
}
function applyDeviceMode(){document.documentElement.dataset.device=isPhone()?'phone':'desktop'}

function enhancePhoneConnect(){
  const card=document.querySelector('.mobile-connect-card')
  if(!card)return
  const phone=document.documentElement.dataset.device==='phone'
  const title=card.querySelector('.settings-card-head h3')
  const text=card.querySelector('.phone-copy>p')
  const detail=card.querySelector('.phone-copy>small')
  if(phone){
    if(title)title.textContent='Install Mejora on this phone'
    if(text)text.textContent='Install the compact Mejora experience so you can check stock, suppliers and business activity anywhere.'
    if(detail)detail.textContent='This preview installs as a PWA today. The future native Mejora app will sync through the same business account and API.'
  }else{
    if(title)title.textContent='Connect your phone'
    if(text)text.textContent='Scan the QR with your phone to open this Mejora workspace, then install it from the phone.'
    if(detail)detail.textContent='The QR is shown only on laptops and desktop computers. On a phone, Mejora switches to a direct install experience.'
  }
}

function ensureRevealObserver(){
  if(revealObserver||!('IntersectionObserver'in window))return
  revealObserver=new IntersectionObserver(entries=>{
    for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('mejora-visible');revealObserver.unobserve(entry.target)}
  },{threshold:.08,rootMargin:'0px 0px -24px 0px'})
}
function wireReveal(){
  ensureRevealObserver()
  const nodes=document.querySelectorAll('.panel,.metric-card,.quick-action,.industry-banner,.settings-card,.supplier-card,.supplier-toolbar')
  nodes.forEach((node,index)=>{
    if(node.dataset.mejoraReveal)return
    node.dataset.mejoraReveal='true'
    node.style.setProperty('--mejora-delay',`${Math.min(index%6,5)*45}ms`)
    node.classList.add('mejora-reveal')
    if(revealObserver)revealObserver.observe(node);else node.classList.add('mejora-visible')
  })
}
function animatePageChange(){
  const content=document.querySelector('.content-wrap')
  if(!content)return
  const title=content.querySelector('.hero-row h1')?.textContent?.trim()||''
  if(content.dataset.mejoraPage===title)return
  content.dataset.mejoraPage=title
  content.classList.remove('mejora-page-swap')
  void content.offsetWidth
  content.classList.add('mejora-page-swap')
}
function setupSwipeTabs(){
  const card=document.querySelector('.auth-card')
  if(!card||card.dataset.swipeReady)return
  card.dataset.swipeReady='true'
  let startX=0,startY=0
  card.addEventListener('touchstart',e=>{const t=e.changedTouches[0];startX=t.clientX;startY=t.clientY},{passive:true})
  card.addEventListener('touchend',e=>{const t=e.changedTouches[0],dx=t.clientX-startX,dy=t.clientY-startY;if(Math.abs(dx)<60||Math.abs(dx)<Math.abs(dy)*1.25)return;const buttons=card.querySelectorAll('.auth-tabs button');if(dx<0)buttons[1]?.click();else buttons[0]?.click()},{passive:true})
}

function seedFromExistingTable(panel){
  if(localStorage.getItem(supplierKey())!==null)return
  const rows=[...panel.querySelectorAll('tbody tr')]
  const seeded=rows.map((row,index)=>{
    const cells=row.querySelectorAll('td'),contact=cells[1]?.textContent?.trim()||''
    return {id:Date.now()+index,name:cells[0]?.textContent?.trim()||'Supplier',contactPerson:'',phone:/@/.test(contact)?'':contact,email:/@/.test(contact)?contact:'',address:'',items:cells[2]?.textContent?.trim()||'',notes:''}
  })
  saveSuppliers(seeded)
}
function supplierActions(s){
  const phone=normalizePhone(s.phone),wa=whatsappNumber(s.phone),email=String(s.email||'').trim()
  const subject=encodeURIComponent(`Mejora order inquiry — ${businessName()}`)
  const body=encodeURIComponent(`Hi ${s.contactPerson||s.name||'there'}, I’m contacting you from ${businessName()} through Mejora regarding an order.`)
  const waMessage=encodeURIComponent(`Hi ${s.contactPerson||s.name||'there'}, I’m contacting you from ${businessName()} through Mejora regarding an order.`)
  return [
    phone?`<a class="supplier-action primary" data-contact-kind="call" href="tel:${encodeURIComponent(phone)}" aria-label="Call ${esc(s.name)}" title="Open phone dialer">Call</a>`:'',
    phone?`<a class="supplier-action" data-contact-kind="sms" href="sms:${encodeURIComponent(phone)}?body=${body}" aria-label="Text ${esc(s.name)}" title="Open SMS app">SMS</a>`:'',
    wa?`<a class="supplier-action" data-contact-kind="whatsapp" href="https://wa.me/${wa}?text=${waMessage}" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp ${esc(s.name)}" title="Open WhatsApp">WhatsApp</a>`:'',
    email?`<a class="supplier-action" data-contact-kind="email" href="mailto:${encodeURIComponent(email)}?subject=${subject}&body=${body}" aria-label="Email ${esc(s.name)}" title="Open email app">Email</a>`:'',
    `<button class="supplier-action" data-edit-supplier="${esc(s.id)}">Edit</button>`
  ].filter(Boolean).join('')
}
function renderSuppliers(panel){
  const suppliers=loadSuppliers()
  panel.innerHTML=`<div class="supplier-toolbar"><div><span class="settings-kicker">Supplier directory</span><h2>Contacts you can reach in a jiffy</h2><p>Keep ordering contacts, phone numbers and supplier details beside your inventory.</p></div><button class="primary-button" data-add-supplier>+ Add supplier</button></div><div class="supplier-grid">${suppliers.length?suppliers.map(s=>`<article class="supplier-card"><div class="supplier-card-top"><div class="supplier-avatar">${esc((s.name||'S').slice(0,1).toUpperCase())}</div><div><h3>${esc(s.name)}</h3><span>${esc(s.contactPerson||'Supplier contact')}</span></div><button class="supplier-delete" data-delete-supplier="${esc(s.id)}" aria-label="Delete supplier">×</button></div><div class="supplier-details">${s.phone?`<div><span>Phone</span><strong>${esc(s.phone)}</strong></div>`:''}${s.email?`<div><span>Email</span><strong>${esc(s.email)}</strong></div>`:''}${s.address?`<div><span>Address</span><strong>${esc(s.address)}</strong></div>`:''}${s.items?`<div><span>Supplies</span><strong>${esc(s.items)}</strong></div>`:''}${s.notes?`<div class="supplier-note"><span>Notes</span><strong>${esc(s.notes)}</strong></div>`:''}</div><div class="supplier-actions">${supplierActions(s)}</div></article>`).join(''):`<div class="supplier-empty"><strong>No suppliers yet</strong><span>Add a supplier once and their contact actions stay ready here.</span><button class="primary-button" data-add-supplier>Add first supplier</button></div>`}</div>`
  wireReveal()
}
function ensureSupplierModal(){
  if(supplierModal)return supplierModal
  supplierModal=document.createElement('div')
  supplierModal.className='supplier-modal-backdrop'
  supplierModal.innerHTML=`<div class="supplier-modal"><button class="supplier-modal-close" data-close-supplier>×</button><span class="settings-kicker">Supplier contact</span><h2 data-supplier-modal-title>Add supplier</h2><p>Save the details you need for fast reordering and contact.</p><form data-supplier-form><input type="hidden" name="id"><div class="supplier-form-grid"><label>Supplier / company<input name="name" required placeholder="e.g. Davao Moto Supply"></label><label>Contact person<input name="contactPerson" placeholder="e.g. Maria Santos"></label><label>Phone number<input name="phone" inputmode="tel" autocomplete="tel" placeholder="e.g. 0917 123 4567 or +63 917 123 4567"></label><label>Email<input name="email" type="email" autocomplete="email" placeholder="orders@supplier.com"></label><label class="full">Address<input name="address" autocomplete="street-address" placeholder="Warehouse or store address"></label><label class="full">What do they supply?<input name="items" placeholder="e.g. Brake parts, oils, filters"></label><label class="full">Notes<textarea name="notes" rows="3" placeholder="Ordering schedule, minimum order, payment notes..."></textarea></label></div><button class="primary-button supplier-save" type="submit">Save supplier</button></form></div>`
  document.body.appendChild(supplierModal)
  return supplierModal
}
function openSupplierModal(id=null){
  const modal=ensureSupplierModal(),form=modal.querySelector('[data-supplier-form]'),items=loadSuppliers(),supplier=id?items.find(s=>String(s.id)===String(id)):null
  form.reset();form.elements.id.value=supplier?.id||'';['name','contactPerson','phone','email','address','items','notes'].forEach(k=>form.elements[k].value=supplier?.[k]||'')
  modal.querySelector('[data-supplier-modal-title]').textContent=supplier?'Edit supplier':'Add supplier'
  modal.classList.add('open');setTimeout(()=>form.elements.name.focus(),120)
}
function closeSupplierModal(){supplierModal?.classList.remove('open')}
function enhanceSuppliers(){
  const heading=[...document.querySelectorAll('.content-wrap h1')].find(h=>h.textContent.trim()==='Suppliers')
  if(!heading)return
  const content=heading.closest('.content-wrap'),panel=content?.querySelector('.panel')
  if(!panel||panel.dataset.supplierEnhanced)return
  seedFromExistingTable(panel);panel.dataset.supplierEnhanced='true';panel.classList.add('supplier-manager-panel');renderSuppliers(panel)
}

function scan(){scanPending=false;applyDeviceMode();enhancePhoneConnect();enhanceSuppliers();wireReveal();animatePageChange();setupSwipeTabs()}
function queueScan(){if(scanPending)return;scanPending=true;requestAnimationFrame(scan)}

export function initMejoraUXEnhancements(){
  applyDeviceMode();ensureSupplierModal();scan()
  window.addEventListener('resize',queueScan,{passive:true})
  new MutationObserver(queueScan).observe(document.body,{childList:true,subtree:true,characterData:true})
  document.addEventListener('click',event=>{
    const target=event.target
    const contact=target.closest('[data-contact-kind]')
    if(contact){
      const kind=contact.dataset.contactKind
      contact.dataset.opened='true'
      if(kind==='whatsapp')return
      // tel:, sms: and mailto: are intentionally left to the operating system so
      // the user's configured Phone, Messages or Mail app opens directly.
      return
    }
    if(target.closest('[data-add-supplier]'))return openSupplierModal()
    const edit=target.closest('[data-edit-supplier]');if(edit)return openSupplierModal(edit.dataset.editSupplier)
    const del=target.closest('[data-delete-supplier]');if(del){const id=del.dataset.deleteSupplier;if(confirm('Delete this supplier?')){saveSuppliers(loadSuppliers().filter(s=>String(s.id)!==String(id)));const panel=document.querySelector('.supplier-manager-panel');if(panel)renderSuppliers(panel)}return}
    if(target.closest('[data-close-supplier]')||target===supplierModal)return closeSupplierModal()
  })
  supplierModal.addEventListener('submit',event=>{
    event.preventDefault();const form=event.target,data=Object.fromEntries(new FormData(form)),items=loadSuppliers(),id=data.id||String(Date.now()),normalized=normalizePhone(data.phone),record={id,name:data.name.trim(),contactPerson:data.contactPerson.trim(),phone:normalized||data.phone.trim(),email:data.email.trim(),address:data.address.trim(),items:data.items.trim(),notes:data.notes.trim()},index=items.findIndex(s=>String(s.id)===String(id));if(index>=0)items[index]=record;else items.unshift(record);saveSuppliers(items);closeSupplierModal();const panel=document.querySelector('.supplier-manager-panel');if(panel)renderSuppliers(panel)
  })
}
