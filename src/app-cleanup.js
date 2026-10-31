const MODULE_PREFIX='mejora.module.v1.'
const CATALOG_PAGES=['Products','Parts','Ingredients','Items','Materials','Styles','Devices']
let scanQueued=false
let featureModal=null

const MODULES={
  Compatibility:{description:'Match parts to compatible vehicle models.',add:'Add compatibility',fields:[['part','Part'],['model','Compatible model'],['years','Year / notes']],seed:[{part:'Brake Pad Set',model:'Honda Click 125 / 150',years:'2018–2026'},{part:'Spark Plug CR8E',model:'Yamaha Mio / NMAX',years:'Check engine spec'}]},
  Recipes:{description:'Keep recipes and ingredient requirements beside stock.',add:'Add recipe',fields:[['name','Recipe'],['yield','Yield'],['ingredients','Ingredients']],seed:[{name:'Chicken Adobo',yield:'6 servings',ingredients:'Chicken, soy sauce, vinegar, garlic'},{name:'Garlic Rice',yield:'10 servings',ingredients:'Rice, garlic, oil, salt'}]},
  Expiry:{description:'Track batches and expiry-sensitive inventory.',add:'Add batch',fields:[['item','Item'],['batch','Batch / lot'],['expires','Expiry date','date']],seed:[{item:'Cooking Oil 5L',batch:'CO-1026-A',expires:'2027-04-30'},{item:'Rice 25kg',batch:'R-1026-B',expires:'2027-02-15'}]},
  Orders:{description:'Track customer orders from new to completed.',add:'New order',fields:[['order','Order #'],['customer','Customer'],['channel','Channel'],['status','Status','select',['New','Processing','Packed','Completed']]],cycle:['New','Processing','Packed','Completed'],seed:[{order:'ORD-1001',customer:'Juan Dela Cruz',channel:'Shopee',status:'Processing'},{order:'ORD-1002',customer:'Maria S.',channel:'TikTok Shop',status:'New'}]},
  Locations:{description:'Organize warehouse stock by rack, bin and zone.',add:'Add location',fields:[['location','Location'],['zone','Zone / rack'],['capacity','Capacity']],seed:[{location:'A-04',zone:'Rack A',capacity:'80 units'},{location:'B-11',zone:'Rack B',capacity:'120 units'}]},
  Receiving:{description:'Record incoming deliveries and receiving references.',add:'Record receiving',fields:[['item','Item'],['qty','Quantity','number'],['reference','Reference / DR']],seed:[{item:'Storage Box L',qty:'12',reference:'DR-1026-018'}]},
  Dispatch:{description:'Record outgoing stock and dispatch references.',add:'Record dispatch',fields:[['item','Item'],['qty','Quantity','number'],['reference','Reference / recipient']],seed:[{item:'Packing Tape',qty:'8',reference:'OUT-1026-007'}]},
  Transfers:{description:'Track stock movement between warehouse locations.',add:'Record transfer',fields:[['item','Item'],['qty','Quantity','number'],['from','From'],['to','To']],seed:[{item:'Storage Box L',qty:'5',from:'A-04',to:'B-11'}]},
  Variants:{description:'Manage size, color and SKU variants for each style.',add:'Add variant',fields:[['style','Style'],['variant','Size / color'],['sku','Variant SKU'],['qty','Stock','number']],seed:[{style:'Classic Tee',variant:'M / Black',sku:'TEE-M-BLK',qty:'12'},{style:'Classic Tee',variant:'L / Black',sku:'TEE-L-BLK',qty:'9'}]},
  'Serial Numbers':{description:'Track individual device serial numbers and status.',add:'Register serial',fields:[['device','Device'],['serial','Serial number'],['status','Status','select',['In stock','Assigned','Sold']]],cycle:['In stock','Assigned','Sold'],seed:[{device:'Wireless Router',serial:'TPA6-1026-001',status:'In stock'},{device:'SSD 1TB',serial:'870EVO-1026-014',status:'Assigned'}]},
  Warranty:{description:'Keep warranty coverage tied to devices and customers.',add:'Add warranty',fields:[['device','Device'],['serial','Serial number'],['customer','Customer'],['until','Covered until','date']],seed:[{device:'Wireless Router',serial:'TPA6-1026-001',customer:'Walk-in customer',until:'2027-10-30'}]}
}

const PAGE_COPY={
  Inventory:'Adjust stock and review reorder levels.',
  'Stock Movements':'Review every recorded stock change.',
  Suppliers:'Manage supplier contacts and ordering details.',
  Reports:'Review inventory health and export a clean summary.',
  Activity:'See recent inventory and workspace activity.',
  Settings:'Appearance, alerts, dashboard, mobile access and privacy.'
}

function esc(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]))}
function slug(value){return String(value||'default').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
function currentPage(){return document.querySelector('.content-wrap .hero-row h1')?.textContent?.trim()||''}
function businessName(){return document.querySelector('.workspace-copy strong')?.textContent?.trim()||'default-business'}
function moduleKey(page){return `${MODULE_PREFIX}${slug(businessName())}.${slug(page)}`}
function readRecords(page){const def=MODULES[page];try{const raw=localStorage.getItem(moduleKey(page));if(raw===null){const seeded=(def?.seed||[]).map((x,i)=>({id:`seed-${i}-${Date.now()}`,...x}));localStorage.setItem(moduleKey(page),JSON.stringify(seeded));return seeded}const value=JSON.parse(raw);return Array.isArray(value)?value:[]}catch{return []}}
function writeRecords(page,records){localStorage.setItem(moduleKey(page),JSON.stringify(records))}
function navLabels(){return [...document.querySelectorAll('.nav-list .nav-item')].map(b=>b.textContent.trim())}
function clickNav(label){const button=[...document.querySelectorAll('.nav-list .nav-item,.sidebar-bottom .nav-item')].find(b=>b.textContent.trim()===label);if(button)button.click()}

function cleanupChrome(){
  const page=currentPage();if(!page)return
  const searchable=CATALOG_PAGES.includes(page)||page==='Inventory'
  const search=document.querySelector('.global-search');if(search)search.hidden=!searchable
  const hero=document.querySelector('.content-wrap .hero-row');if(!hero)return
  const description=hero.querySelector(':scope > div > p')
  if(MODULES[page]&&description)description.textContent=MODULES[page].description
  else if(PAGE_COPY[page]&&description)description.textContent=PAGE_COPY[page]
  const actions=hero.querySelector('.hero-actions')
  if(actions){
    let visible=0
    for(const action of [...actions.children]){
      const text=action.textContent.replace(/\s+/g,' ').trim()
      const showImport=/Import Excel/i.test(text)&&(CATALOG_PAGES.includes(page)||page==='Inventory')
      const showExport=/^Export$/i.test(text)&&(CATALOG_PAGES.includes(page)||page==='Inventory')
      const showAdd=/^Add /i.test(text)&&CATALOG_PAGES.includes(page)
      const show=showImport||showExport||showAdd
      action.hidden=!show;if(show)visible++
    }
    actions.hidden=visible===0
  }
  if(page==='Dashboard'){
    const duplicate= document.querySelector('.industry-banner > div:first-child > span')
    if(duplicate)duplicate.hidden=true
  }
}

function quickTarget(label){
  const q=label.toLowerCase(),available=navLabels()
  const has=x=>available.includes(x)
  if(q.includes('compat'))return has('Compatibility')?'Compatibility':null
  if(q.includes('expiry'))return has('Expiry')?'Expiry':null
  if(q.includes('order')||q.includes('reserve'))return has('Orders')?'Orders':'Inventory'
  if(q.includes('transfer'))return has('Transfers')?'Transfers':'Inventory'
  if(q.includes('variant'))return has('Variants')?'Variants':null
  if(q.includes('serial'))return has('Serial Numbers')?'Serial Numbers':null
  if(q.includes('receive')&&has('Receiving'))return'Receiving'
  if(q.includes('dispatch')&&has('Dispatch'))return'Dispatch'
  if(q.includes('stock in')||q.includes('stock out')||q.includes('issue')||q.includes('use ingredients')||q.includes('receive')||q.includes('add stock')||q.includes('sell'))return'Inventory'
  if(q.includes('scan')||q.includes('add item')||q.includes('add material'))return available.find(x=>CATALOG_PAGES.includes(x))||null
  return null
}

function fieldInput([key,label,type='text',options=[]]){
  if(type==='select')return `<label>${esc(label)}<select name="${esc(key)}" required>${options.map(o=>`<option>${esc(o)}</option>`).join('')}</select></label>`
  const attrs=type==='number'?'min="0" step="1" inputmode="numeric"':''
  return `<label>${esc(label)}<input name="${esc(key)}" type="${esc(type)}" ${attrs} required></label>`
}
function ensureFeatureModal(){
  if(featureModal)return featureModal
  featureModal=document.createElement('div');featureModal.className='feature-modal-backdrop';featureModal.innerHTML='<div class="feature-modal"><button class="feature-modal-close" type="button" data-feature-close>×</button><span class="settings-kicker">Mejora module</span><h2 data-feature-title></h2><form data-feature-form><div class="feature-form-grid" data-feature-fields></div><button class="primary-button feature-save" type="submit">Save</button></form></div>';document.body.appendChild(featureModal);return featureModal
}
function openFeatureModal(page){
  const def=MODULES[page];if(!def)return
  const modal=ensureFeatureModal();modal.dataset.page=page;modal.querySelector('[data-feature-title]').textContent=def.add;modal.querySelector('[data-feature-fields]').innerHTML=def.fields.map(fieldInput).join('');modal.classList.add('open');setTimeout(()=>modal.querySelector('input,select')?.focus(),100)
}
function closeFeatureModal(){featureModal?.classList.remove('open')}
function nextCycle(def,current){const cycle=def.cycle||[];const i=cycle.indexOf(current);return cycle[(i+1)%cycle.length]||current}
function recordCell(field,record){const value=record[field[0]]??'—';if(field[0]==='status')return `<span class="feature-status">${esc(value)}</span>`;return esc(value)}
function renderModule(page,panel){
  const def=MODULES[page],records=readRecords(page);if(!def||!panel)return
  panel.dataset.mejoraFeaturePage=page;panel.classList.add('feature-module-panel')
  const headers=def.fields.map(f=>`<th>${esc(f[1])}</th>`).join('')
  const rows=records.map(record=>`<tr>${def.fields.map(f=>`<td>${recordCell(f,record)}</td>`).join('')}<td class="feature-row-actions">${def.cycle?`<button class="mini-action" data-feature-advance="${esc(record.id)}">Next status</button>`:''}<button class="mini-action danger" data-feature-delete="${esc(record.id)}">Delete</button></td></tr>`).join('')
  panel.innerHTML=`<div class="feature-module-head"><div><span class="eyebrow">${esc(businessName())}</span><h2>${esc(page)}</h2></div><button class="primary-button" data-feature-add="${esc(page)}">+ ${esc(def.add)}</button></div>${records.length?`<div class="table-wrap"><table><thead><tr>${headers}<th>Actions</th></tr></thead><tbody>${rows}</tbody></table></div>`:`<div class="feature-empty"><strong>No ${esc(page.toLowerCase())} records yet</strong><span>Add the first record to start using this module.</span><button class="primary-button" data-feature-add="${esc(page)}">${esc(def.add)}</button></div>`}`
}
function enhanceFeaturePage(){
  const page=currentPage(),def=MODULES[page];if(!def)return
  const content=document.querySelector('.content-wrap');if(!content)return
  const panel=content.querySelector('.panel');if(!panel)return
  if(panel.dataset.mejoraFeaturePage===page)return
  renderModule(page,panel)
}

function enhanceReports(){
  if(currentPage()!=='Reports')return
  const root=document.querySelector('.content-wrap');if(!root||root.querySelector('.report-toolbox'))return
  const grid=root.querySelector('.metric-grid');if(!grid)return
  const box=document.createElement('section');box.className='panel report-toolbox';box.innerHTML='<div class="panel-header"><div><h2>Report tools</h2><span class="muted">Export the visible summary or print this report.</span></div><div class="report-actions"><button class="secondary-button" data-report-csv>Download CSV</button><button class="secondary-button" data-report-print>Print</button></div></div><div class="report-summary-line"><span>Inventory summary</span><strong>Uses the current business workspace data</strong></div>';grid.insertAdjacentElement('afterend',box)
}
function downloadReportCsv(){
  const cards=[...document.querySelectorAll('.content-wrap .metric-grid .metric-card')];if(!cards.length)return
  const rows=[['Metric','Value'],...cards.map(card=>[card.querySelector('small,.metric-label')?.textContent?.trim()||'Metric',card.querySelector('strong')?.textContent?.trim()||'0'])]
  const csv=rows.map(row=>row.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n'),blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`${slug(businessName())}-report.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),500)
}

function scan(){scanQueued=false;cleanupChrome();enhanceFeaturePage();enhanceReports()}
function queueScan(){if(scanQueued)return;scanQueued=true;requestAnimationFrame(scan)}

export function initAppCleanup(){
  ensureFeatureModal();scan()
  new MutationObserver(queueScan).observe(document.body,{childList:true,subtree:true,characterData:true})
  document.addEventListener('click',event=>{
    const quick=event.target.closest('.quick-action')
    if(quick){const target=quickTarget(quick.querySelector('strong')?.textContent||'');if(target){event.preventDefault();event.stopImmediatePropagation();clickNav(target)}return}
    const add=event.target.closest('[data-feature-add]');if(add)return openFeatureModal(add.dataset.featureAdd)
    if(event.target.closest('[data-feature-close]')||event.target===featureModal)return closeFeatureModal()
    const del=event.target.closest('[data-feature-delete]');if(del){const page=currentPage(),records=readRecords(page).filter(r=>String(r.id)!==String(del.dataset.featureDelete));writeRecords(page,records);const panel=document.querySelector('.feature-module-panel');if(panel)renderModule(page,panel);return}
    const advance=event.target.closest('[data-feature-advance]');if(advance){const page=currentPage(),def=MODULES[page],records=readRecords(page),record=records.find(r=>String(r.id)===String(advance.dataset.featureAdvance));if(record&&def?.cycle){record.status=nextCycle(def,record.status);writeRecords(page,records);const panel=document.querySelector('.feature-module-panel');if(panel)renderModule(page,panel)}return}
    if(event.target.closest('[data-report-csv]'))return downloadReportCsv()
    if(event.target.closest('[data-report-print]'))return window.print()
  },true)
  featureModal.addEventListener('submit',event=>{
    event.preventDefault();const page=featureModal.dataset.page,def=MODULES[page];if(!def)return
    const data=Object.fromEntries(new FormData(event.target)),record={id:String(Date.now())};for(const [key] of def.fields)record[key]=String(data[key]??'').trim();const records=readRecords(page);records.unshift(record);writeRecords(page,records);closeFeatureModal();event.target.reset();const panel=document.querySelector('.feature-module-panel');if(panel&&currentPage()===page)renderModule(page,panel)
  })
}
