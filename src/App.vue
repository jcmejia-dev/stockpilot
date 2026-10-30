<script setup>
import { computed, ref } from 'vue'
import { Activity, AlertTriangle, ArrowDownToLine, ArrowUpFromLine, BarChart3, Bell, Boxes, Building2, ChevronDown, ChevronRight, CircleUserRound, ClipboardList, FileText, LayoutDashboard, LogOut, Menu, Package, Plus, Search, Settings, ShoppingBag, Truck, UserPlus, X } from 'lucide-vue-next'

const mobileOpen = ref(false)
const search = ref('')
const activeFilter = ref('All')
const notice = ref('')
const showWorkspaceMenu = ref(false)
const showAuth = ref(false)
const authMode = ref('register')
const showCreateBusiness = ref(false)
const currentUser = ref({ id: 1, name: 'Jamie Mejia', email: 'jamie@stockpilot.local' })
const businesses = ref([
  { id: 1, name: 'Mejia Moto Supply', type: 'Motorcycle Parts', currency: 'PHP', timezone: 'Asia/Manila', role: 'OWNER' },
  { id: 2, name: 'Jamie Mini Mart', type: 'Retail Store', currency: 'PHP', timezone: 'Asia/Manila', role: 'OWNER' },
])
const activeBusinessId = ref(1)
const activeBusiness = computed(() => businesses.value.find(b => b.id === activeBusinessId.value))

const allProducts = ref([
  { id: 1, business_id: 1, name: 'Brake Pad Set', sku: 'MOTO-BRK-001', category: 'Motorcycle Parts', supplier: 'Davao Moto Supply', quantity: 18, threshold: 10, cost: 280 },
  { id: 2, business_id: 1, name: 'Engine Oil 1L', sku: 'MOTO-OIL-010', category: 'Lubricants', supplier: 'Prime Auto Trading', quantity: 7, threshold: 12, cost: 205 },
  { id: 3, business_id: 1, name: 'Spark Plug CR8E', sku: 'MOTO-SP-008', category: 'Motorcycle Parts', supplier: 'Davao Moto Supply', quantity: 42, threshold: 15, cost: 95 },
  { id: 4, business_id: 1, name: 'Chain Cleaner 500ml', sku: 'MOTO-CC-500', category: 'Maintenance', supplier: 'Prime Auto Trading', quantity: 0, threshold: 6, cost: 175 },
  { id: 101, business_id: 2, name: 'Coca-Cola 1.5L', sku: 'MART-DRK-001', category: 'Beverages', supplier: 'Local Distributor', quantity: 35, threshold: 12, cost: 55 },
  { id: 102, business_id: 2, name: 'Instant Noodles', sku: 'MART-FOD-014', category: 'Food', supplier: 'Local Distributor', quantity: 58, threshold: 20, cost: 12 },
  { id: 103, business_id: 2, name: 'Laundry Soap', sku: 'MART-HOM-021', category: 'Household', supplier: 'General Supplier', quantity: 9, threshold: 10, cost: 24 },
])
const allMovements = ref([
  { business_id: 1, type: 'Stock In', item: 'Brake Pad Set', qty: '+12', time: 'Today, 9:42 AM', user: 'Jamie' },
  { business_id: 1, type: 'Stock Out', item: 'Engine Oil 1L', qty: '-3', time: 'Today, 8:17 AM', user: 'Jamie' },
  { business_id: 1, type: 'Adjustment', item: 'Spark Plug CR8E', qty: '-1', time: 'Yesterday, 4:31 PM', user: 'Jamie' },
  { business_id: 2, type: 'Stock In', item: 'Coca-Cola 1.5L', qty: '+24', time: 'Today, 10:05 AM', user: 'Jamie' },
  { business_id: 2, type: 'Stock Out', item: 'Instant Noodles', qty: '-6', time: 'Today, 9:10 AM', user: 'Jamie' },
])

const products = computed(() => allProducts.value.filter(p => p.business_id === activeBusinessId.value))
const movements = computed(() => allMovements.value.filter(m => m.business_id === activeBusinessId.value))
const filteredProducts = computed(() => {
  const query = search.value.trim().toLowerCase()
  return products.value.filter(product => {
    const status = statusOf(product)
    return (activeFilter.value === 'All' || status === activeFilter.value) && (!query || [product.name, product.sku, product.category, product.supplier].some(v => v.toLowerCase().includes(query)))
  })
})
const totalProducts = computed(() => products.value.length)
const totalUnits = computed(() => products.value.reduce((s,p) => s + p.quantity, 0))
const inventoryValue = computed(() => products.value.reduce((s,p) => s + p.quantity * p.cost, 0))
const lowStock = computed(() => products.value.filter(p => p.quantity > 0 && p.quantity <= p.threshold).length)
const outOfStock = computed(() => products.value.filter(p => p.quantity === 0).length)
const money = value => new Intl.NumberFormat('en-PH', { style:'currency', currency: activeBusiness.value?.currency || 'PHP', maximumFractionDigits:0 }).format(value)
const statusOf = p => p.quantity === 0 ? 'Out of stock' : p.quantity <= p.threshold ? 'Low stock' : 'Healthy'
function selectBusiness(id) { activeBusinessId.value=id; showWorkspaceMenu.value=false; search.value=''; activeFilter.value='All'; notice.value='Workspace changed. Only this business’s preview records are now visible.' }
function quickAction(action) { notice.value=`${action} will be protected by the active business tenant in the Laravel API.`; setTimeout(()=>notice.value='',4000) }
function createBusiness(e) { const f=new FormData(e.target); const name=String(f.get('name')||'').trim(); if(!name)return; const id=Math.max(...businesses.value.map(b=>b.id))+1; businesses.value.push({id,name,type:String(f.get('type')||'Small Business'),currency:'PHP',timezone:'Asia/Manila',role:'OWNER'}); activeBusinessId.value=id; showCreateBusiness.value=false; notice.value=`${name} created as a separate workspace.` }
</script>

<template>
<div class="app-shell">
  <aside class="sidebar" :class="{'sidebar--open':mobileOpen}">
    <div class="brand-row"><div class="brand-mark"><Boxes :size="20"/></div><div><div class="brand-name">StockPilot</div><div class="brand-byline">by Mejia Software</div></div><button class="mobile-close" @click="mobileOpen=false"><X :size="20"/></button></div>
    <div class="workspace-wrap">
      <button class="workspace-card workspace-button" @click="showWorkspaceMenu=!showWorkspaceMenu"><div class="workspace-icon"><ShoppingBag :size="17"/></div><div class="workspace-copy"><strong>{{activeBusiness.name}}</strong><span>{{activeBusiness.role}} · Isolated workspace</span></div><ChevronDown :size="16"/></button>
      <div v-if="showWorkspaceMenu" class="workspace-menu">
        <div class="workspace-menu-title">Your businesses</div>
        <button v-for="b in businesses" :key="b.id" :class="{'workspace-option--active':b.id===activeBusinessId}" class="workspace-option" @click="selectBusiness(b.id)"><Building2 :size="16"/><span><strong>{{b.name}}</strong><small>{{b.type}}</small></span></button>
        <button class="workspace-create" @click="showWorkspaceMenu=false;showCreateBusiness=true"><Plus :size="16"/> Create business</button>
      </div>
    </div>
    <nav class="nav-list"><a class="nav-item nav-item--active"><LayoutDashboard :size="18"/>Dashboard</a><a class="nav-item" href="#inventory"><Package :size="18"/>Products</a><a class="nav-item" href="#inventory"><ClipboardList :size="18"/>Inventory</a><a class="nav-item" href="#movements"><Activity :size="18"/>Stock Movements</a><a class="nav-item"><Truck :size="18"/>Suppliers</a><a class="nav-item"><BarChart3 :size="18"/>Reports</a><a class="nav-item"><FileText :size="18"/>Activity</a></nav>
    <div class="sidebar-bottom"><a class="nav-item"><Settings :size="18"/>Settings</a><div class="user-row"><div class="avatar">JM</div><div><strong>{{currentUser.name}}</strong><span>{{activeBusiness.role}}</span></div></div></div>
  </aside>
  <div class="mobile-scrim" :class="{'mobile-scrim--open':mobileOpen}" @click="mobileOpen=false"></div>
  <main class="main-area">
    <header class="topbar"><div class="topbar-left"><button class="menu-button" @click="mobileOpen=true"><Menu :size="21"/></button><div class="global-search"><Search :size="18"/><input v-model="search" placeholder="Search this business..."/><kbd>⌘ K</kbd></div></div><div class="topbar-actions"><span class="tenant-pill"><Building2 :size="13"/> {{activeBusiness.name}}</span><span class="alpha-pill">ALPHA PREVIEW</span><button class="icon-button"><Bell :size="19"/></button><button class="profile-button"><CircleUserRound :size="22"/></button></div></header>
    <div class="content-wrap">
      <section class="hero-row"><div><div class="eyebrow">Business workspace · Inventory overview</div><h1>Good evening, Jamie.</h1><p>You are viewing <strong>{{activeBusiness.name}}</strong>. Other businesses’ inventory is isolated.</p></div><button class="primary-button" @click="quickAction('Add Product')"><Plus :size="18"/> Add product</button></section>
      <div class="preview-banner tenant-banner"><span class="preview-dot"></span><div><strong>Multi-tenant preview enabled</strong><span>Switch businesses in the sidebar to see tenant isolation in action. Each preview record carries a business_id. Production enforcement will happen server-side in Laravel with authorization and tenant-isolation tests.</span></div></div>
      <section class="metric-grid"><article class="metric-card"><div class="metric-icon"><Package :size="18"/></div><span class="metric-label">Total products</span><strong>{{totalProducts}}</strong><small>Only {{activeBusiness.name}}</small></article><article class="metric-card"><div class="metric-icon"><Boxes :size="18"/></div><span class="metric-label">Total stock</span><strong>{{totalUnits}}</strong><small>Units on hand</small></article><article class="metric-card"><div class="metric-icon"><BarChart3 :size="18"/></div><span class="metric-label">Inventory value</span><strong>{{money(inventoryValue)}}</strong><small>Based on cost price</small></article><article class="metric-card metric-card--warning"><div class="metric-icon"><AlertTriangle :size="18"/></div><span class="metric-label">Needs attention</span><strong>{{lowStock+outOfStock}}</strong><small>{{lowStock}} low · {{outOfStock}} out</small></article></section>
      <section class="quick-actions-section"><div class="section-heading"><div><span class="eyebrow">Common tasks</span><h2>Quick actions</h2></div></div><div class="quick-action-grid"><button class="quick-action" @click="quickAction('Stock In')"><span class="quick-icon"><ArrowDownToLine :size="20"/></span><span><strong>Stock in</strong><small>Record incoming inventory</small></span><ChevronRight :size="17"/></button><button class="quick-action" @click="quickAction('Stock Out')"><span class="quick-icon"><ArrowUpFromLine :size="20"/></span><span><strong>Stock out</strong><small>Record outgoing inventory</small></span><ChevronRight :size="17"/></button><button class="quick-action" @click="quickAction('Adjust Inventory')"><span class="quick-icon"><ClipboardList :size="20"/></span><span><strong>Adjust inventory</strong><small>Reconcile a physical count</small></span><ChevronRight :size="17"/></button></div></section>
      <div class="dashboard-grid"><section id="inventory" class="panel inventory-panel"><div class="panel-header"><div><span class="eyebrow">{{activeBusiness.name}}</span><h2>Inventory</h2></div><div class="filter-tabs"><button v-for="f in ['All','Healthy','Low stock','Out of stock']" :key="f" :class="{active:activeFilter===f}" @click="activeFilter=f">{{f}}</button></div></div><div class="table-wrap"><table><thead><tr><th>Product</th><th>SKU</th><th>Stock</th><th>Status</th><th>Value</th></tr></thead><tbody><tr v-for="p in filteredProducts" :key="p.id"><td><div class="product-cell"><span class="product-glyph"><Package :size="17"/></span><span><strong>{{p.name}}</strong><small>{{p.category}}</small></span></div></td><td class="mono">{{p.sku}}</td><td><strong>{{p.quantity}}</strong> <span class="muted">units</span></td><td><span class="status-badge" :class="`status-${statusOf(p).toLowerCase().replaceAll(' ','-')}`">{{statusOf(p)}}</span></td><td>{{money(p.quantity*p.cost)}}</td></tr><tr v-if="!filteredProducts.length"><td colspan="5" class="empty-row">No products in this workspace match your filter.</td></tr></tbody></table></div></section>
      <section id="movements" class="panel movement-panel"><div class="panel-header"><div><span class="eyebrow">Tenant ledger</span><h2>Recent movements</h2></div><button class="text-button">View all</button></div><div class="movement-list"><div v-for="m in movements" :key="m.item+m.time" class="movement-row"><span class="movement-icon" :class="m.type==='Stock In'?'movement-in':m.type==='Stock Out'?'movement-out':'movement-adjust'"><ArrowDownToLine v-if="m.type==='Stock In'" :size="17"/><ArrowUpFromLine v-else-if="m.type==='Stock Out'" :size="17"/><ClipboardList v-else :size="17"/></span><div class="movement-copy"><strong>{{m.item}}</strong><span>{{m.type}} · {{m.user}}</span><small>{{m.time}}</small></div><strong class="movement-qty">{{m.qty}}</strong></div></div><div class="trust-note"><Activity :size="17"/><span><strong>Tenant boundary: business #{{activeBusinessId}}.</strong> Production requests will derive this boundary from the authenticated membership, never from a trusted browser value.</span></div></section></div>
    </div>
    <transition name="toast"><div v-if="notice" class="toast"><span>{{notice}}</span><button @click="notice='' "><X :size="17"/></button></div></transition>
  </main>

  <div v-if="showCreateBusiness" class="modal-backdrop" @click.self="showCreateBusiness=false"><form class="modal-card" @submit.prevent="createBusiness"><button type="button" class="modal-close" @click="showCreateBusiness=false"><X :size="18"/></button><div class="modal-icon"><Building2 :size="22"/></div><span class="eyebrow">New tenant workspace</span><h2>Create a business</h2><p>This preview creates an isolated browser workspace. The real version will persist it through Laravel.</p><label>Business name<input name="name" required placeholder="e.g. Garcia Hardware"/></label><label>Business type<select name="type"><option>Retail Store</option><option>Motorcycle Parts</option><option>Small Warehouse</option><option>Online Seller</option><option>Food Business</option><option>Other</option></select></label><div class="modal-note">Currency: PHP · Timezone: Asia/Manila · Your role: OWNER</div><button class="primary-button modal-submit" type="submit">Create business</button></form></div>
</div>
</template>
