import {resolveVueState,readState} from './state-access.js'

let queued=false
let host=null
let modal=null
let vmRef=null

function currentPage(){return document.querySelector('.content-wrap .hero-row h1')?.textContent?.trim()||''}
function esc(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]))}
function state(){return resolveVueState(vmRef)}
function activeProducts(){const s=state(),id=readState(s,'activeBusinessId'),products=readState(s,'products')||[];return products.filter(p=>String(p.business_id)===String(id))}
function movements(){const s=state();return readState(s,'movements')||[]}
function currentUser(){return readState(state(),'currentUser')?.name||'User'}
function status(p){return Number(p.qty)<=0?'Out of stock':Number(p.qty)<=Number(p.low||0)?'Low stock':'Healthy'}
function suggestion(p){const low=Math.max(1,Number(p.low)||1),target=Math.max(low*2,low+1);return Math.max(0,target-(Number(p.qty)||0))}
function showToast(text){let t=document.querySelector('.mejora-system-toast');if(!t){t=document.createElement('div');t.className='mejora-system-toast';document.body.appendChild(t)}t.textContent=text;t.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>t.classList.remove('show'),2400)}

function render(){
  if(currentPage()!=='Inventory'){host?.remove();host=null;closeModal();return}
  const panel=document.querySelector('.content-wrap .panel')
  if(!panel)return
  if(!host){host=document.createElement('section');host.className='mejora-inventory-tools';panel.insertAdjacentElement('afterend',host)}
  const items=activeProducts(),alerts=items.filter(p=>status(p)!=='Healthy'),out=items.filter(p=>Number(p.qty)<=0).length,low=alerts.length-out
  host.innerHTML=`<div class="inventory-tools-head"><div><span class="settings-kicker">Inventory control</span><h2>Reorder & stocktake</h2><p>Catch shortages early and reconcile physical counts without leaving Inventory.</p></div><button class="secondary-button" data-open-stocktake>Start stocktake</button></div><div class="inventory-tool-grid"><article class="inventory-tool-card"><div class="inventory-tool-title"><div><span class="settings-kicker">Reorder Center</span><h3>${alerts.length?`${alerts.length} item${alerts.length===1?'':'s'} need attention`:'Stock levels look healthy'}</h3></div><div class="inventory-health"><span><b>${out}</b> out</span><span><b>${low}</b> low</span></div></div>${alerts.length?`<div class="reorder-list">${alerts.slice(0,8).map(p=>`<div class="reorder-row"><div><strong>${esc(p.name)}</strong><span>${esc(p.sku||'No SKU')} · ${Number(p.qty)||0} on hand · reorder at ${Number(p.low)||0}</span></div><div class="reorder-actions"><span>+${suggestion(p)} suggested</span><button data-restock-id="${esc(p.id)}">Receive</button></div></div>`).join('')}</div><button class="text-button reorder-copy" data-copy-reorder>Copy reorder list</button>`:`<div class="inventory-tools-empty">No low-stock or out-of-stock items right now.</div>`}</article><article class="inventory-tool-card stocktake-summary"><span class="settings-kicker">Physical count</span><h3>Stocktake</h3><p>Compare shelf or warehouse counts against Mejora and post differences as movement records.</p><div class="stocktake-stats"><div><strong>${items.length}</strong><span>items to count</span></div><div><strong>${items.reduce((a,p)=>a+(Number(p.qty)||0),0)}</strong><span>recorded units</span></div></div><button class="primary-button" data-open-stocktake>Count inventory</button></article></div>`
}

function receiveSuggested(id){
  const p=activeProducts().find(x=>String(x.id)===String(id));if(!p)return
  const add=suggestion(p);if(add<=0)return showToast(`${p.name} is already above its reorder level.`)
  p.qty=(Number(p.qty)||0)+add
  movements().unshift({id:Date.now(),business_id:p.business_id,type:'Reorder Receipt',item:p.name,qty:`+${add}`,user:currentUser(),time:'Just now'})
  showToast(`${add} units received for ${p.name}.`);render()
}

async function copyReorder(){
  const alerts=activeProducts().filter(p=>status(p)!=='Healthy')
  const text=alerts.map(p=>`${p.name} (${p.sku||'No SKU'}) — order ${suggestion(p)} units`).join('\n')
  if(!text)return showToast('No reorder items to copy.')
  try{await navigator.clipboard.writeText(text);showToast('Reorder list copied.')}catch{showToast('Could not copy the reorder list.')}
}

function ensureModal(){
  if(modal)return modal
  modal=document.createElement('div');modal.className='stocktake-modal-backdrop';modal.innerHTML='<div class="stocktake-modal"><div class="stocktake-modal-head"><div><span class="settings-kicker">Physical inventory</span><h2>Stocktake</h2><p>Enter the quantity you physically counted. Only differences create adjustment records.</p></div><button data-close-stocktake aria-label="Close">×</button></div><form data-stocktake-form><div class="stocktake-table"></div><div class="stocktake-footer"><button type="button" class="secondary-button" data-close-stocktake>Cancel</button><button type="submit" class="primary-button">Apply counts</button></div></form></div>';document.body.appendChild(modal);return modal
}
function openModal(){
  const m=ensureModal(),items=activeProducts();m.querySelector('.stocktake-table').innerHTML=items.length?items.map(p=>`<label class="stocktake-row"><span><strong>${esc(p.name)}</strong><small>${esc(p.sku||'No SKU')} · recorded ${Number(p.qty)||0}</small></span><input name="count-${esc(p.id)}" type="number" min="0" step="1" value="${Math.max(0,Number(p.qty)||0)}" inputmode="numeric"></label>`).join(''):'<div class="inventory-tools-empty">No inventory items to count.</div>';m.classList.add('open')
}
function closeModal(){modal?.classList.remove('open')}
function applyStocktake(form){
  let changed=0
  for(const p of activeProducts()){
    const input=form.elements[`count-${p.id}`];if(!input)continue
    const counted=Math.max(0,Number(input.value)||0),old=Number(p.qty)||0,delta=counted-old
    if(!delta)continue
    p.qty=counted;changed++
    movements().unshift({id:Date.now()+changed,business_id:p.business_id,type:'Stocktake Adjustment',item:p.name,qty:`${delta>0?'+':''}${delta}`,user:currentUser(),time:'Just now'})
  }
  closeModal();render();showToast(changed?`${changed} stocktake adjustment${changed===1?'':'s'} posted.`:'Stocktake matched recorded inventory.')
}

function scan(){queued=false;render()}
function queue(){if(queued)return;queued=true;requestAnimationFrame(scan)}

export function initInventoryTools(vm){
  vmRef=vm
  document.addEventListener('click',event=>{
    const restock=event.target.closest('[data-restock-id]');if(restock)return receiveSuggested(restock.dataset.restockId)
    if(event.target.closest('[data-copy-reorder]'))return copyReorder()
    if(event.target.closest('[data-open-stocktake]'))return openModal()
    if(event.target.closest('[data-close-stocktake]')||event.target===modal)return closeModal()
  })
  document.addEventListener('submit',event=>{if(event.target.matches('[data-stocktake-form]')){event.preventDefault();applyStocktake(event.target)}})
  new MutationObserver(queue).observe(document.body,{childList:true,subtree:true,characterData:true})
  queue()
}
