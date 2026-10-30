<script setup>
import { computed, ref } from 'vue'
import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  Bell,
  Boxes,
  ChevronRight,
  CircleUserRound,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Menu,
  Package,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  Truck,
  X,
} from 'lucide-vue-next'

const mobileOpen = ref(false)
const search = ref('')
const activeFilter = ref('All')
const notice = ref('')

const products = ref([
  { id: 1, name: 'Brake Pad Set', sku: 'MOTO-BRK-001', category: 'Motorcycle Parts', supplier: 'Davao Moto Supply', quantity: 18, threshold: 10, cost: 280 },
  { id: 2, name: 'Engine Oil 1L', sku: 'MOTO-OIL-010', category: 'Lubricants', supplier: 'Prime Auto Trading', quantity: 7, threshold: 12, cost: 205 },
  { id: 3, name: 'Spark Plug CR8E', sku: 'MOTO-SP-008', category: 'Motorcycle Parts', supplier: 'Davao Moto Supply', quantity: 42, threshold: 15, cost: 95 },
  { id: 4, name: 'Chain Cleaner 500ml', sku: 'MOTO-CC-500', category: 'Maintenance', supplier: 'Prime Auto Trading', quantity: 0, threshold: 6, cost: 175 },
])

const movements = ref([
  { type: 'Stock In', item: 'Brake Pad Set', qty: '+12', time: 'Today, 9:42 AM', user: 'Jamie' },
  { type: 'Stock Out', item: 'Engine Oil 1L', qty: '-3', time: 'Today, 8:17 AM', user: 'Jamie' },
  { type: 'Adjustment', item: 'Spark Plug CR8E', qty: '-1', time: 'Yesterday, 4:31 PM', user: 'Jamie' },
])

const filteredProducts = computed(() => {
  const query = search.value.trim().toLowerCase()
  return products.value.filter((product) => {
    const status = product.quantity === 0 ? 'Out of stock' : product.quantity <= product.threshold ? 'Low stock' : 'Healthy'
    const matchesFilter = activeFilter.value === 'All' || status === activeFilter.value
    const matchesQuery = !query || [product.name, product.sku, product.category, product.supplier].some((value) => value.toLowerCase().includes(query))
    return matchesFilter && matchesQuery
  })
})

const totalProducts = computed(() => products.value.length)
const totalUnits = computed(() => products.value.reduce((sum, product) => sum + product.quantity, 0))
const inventoryValue = computed(() => products.value.reduce((sum, product) => sum + product.quantity * product.cost, 0))
const lowStock = computed(() => products.value.filter((product) => product.quantity > 0 && product.quantity <= product.threshold).length)
const outOfStock = computed(() => products.value.filter((product) => product.quantity === 0).length)

const money = (value) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(value)
const statusOf = (product) => product.quantity === 0 ? 'Out of stock' : product.quantity <= product.threshold ? 'Low stock' : 'Healthy'

function quickAction(action) {
  notice.value = `${action} is wired as a frontend preview. The Laravel inventory transaction API is the next implementation phase.`
  window.setTimeout(() => (notice.value = ''), 4500)
}
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar" :class="{ 'sidebar--open': mobileOpen }">
      <div class="brand-row">
        <div class="brand-mark"><Boxes :size="20" /></div>
        <div>
          <div class="brand-name">StockPilot</div>
          <div class="brand-byline">by Mejia Software</div>
        </div>
        <button class="mobile-close" aria-label="Close navigation" @click="mobileOpen = false"><X :size="20" /></button>
      </div>

      <div class="workspace-card">
        <div class="workspace-icon"><ShoppingBag :size="17" /></div>
        <div class="workspace-copy">
          <strong>Mejia Moto Supply</strong>
          <span>Preview workspace</span>
        </div>
        <ChevronRight :size="16" />
      </div>

      <nav class="nav-list">
        <a class="nav-item nav-item--active" href="#"><LayoutDashboard :size="18" /><span>Dashboard</span></a>
        <a class="nav-item" href="#inventory"><Package :size="18" /><span>Products</span></a>
        <a class="nav-item" href="#inventory"><ClipboardList :size="18" /><span>Inventory</span></a>
        <a class="nav-item" href="#movements"><Activity :size="18" /><span>Stock Movements</span></a>
        <a class="nav-item" href="#"><Truck :size="18" /><span>Suppliers</span></a>
        <a class="nav-item" href="#"><BarChart3 :size="18" /><span>Reports</span></a>
        <a class="nav-item" href="#"><FileText :size="18" /><span>Activity</span></a>
      </nav>

      <div class="sidebar-bottom">
        <a class="nav-item" href="#"><Settings :size="18" /><span>Settings</span></a>
        <div class="user-row">
          <div class="avatar">JM</div>
          <div><strong>Jamie Mejia</strong><span>Owner</span></div>
        </div>
      </div>
    </aside>

    <div class="mobile-scrim" :class="{ 'mobile-scrim--open': mobileOpen }" @click="mobileOpen = false"></div>

    <main class="main-area">
      <header class="topbar">
        <div class="topbar-left">
          <button class="menu-button" aria-label="Open navigation" @click="mobileOpen = true"><Menu :size="21" /></button>
          <div class="global-search">
            <Search :size="18" />
            <input v-model="search" type="search" placeholder="Search products, SKU, supplier..." />
            <kbd>⌘ K</kbd>
          </div>
        </div>
        <div class="topbar-actions">
          <span class="alpha-pill">ALPHA PREVIEW</span>
          <button class="icon-button" aria-label="Notifications"><Bell :size="19" /></button>
          <button class="profile-button" aria-label="Profile"><CircleUserRound :size="22" /></button>
        </div>
      </header>

      <div class="content-wrap">
        <section class="hero-row">
          <div>
            <div class="eyebrow">Friday · Inventory overview</div>
            <h1>Good evening, Jamie.</h1>
            <p>Know what you have, what moved, and what needs attention.</p>
          </div>
          <button class="primary-button" @click="quickAction('Add Product')"><Plus :size="18" /> Add product</button>
        </section>

        <div class="preview-banner">
          <span class="preview-dot"></span>
          <div><strong>Frontend preview data</strong><span>This GitHub Pages build demonstrates the StockPilot interface. Production inventory will come from the Laravel backend, not hard-coded browser data.</span></div>
        </div>

        <section class="metric-grid">
          <article class="metric-card">
            <div class="metric-icon"><Package :size="18" /></div>
            <span class="metric-label">Total products</span>
            <strong>{{ totalProducts }}</strong>
            <small>Active SKUs</small>
          </article>
          <article class="metric-card">
            <div class="metric-icon"><Boxes :size="18" /></div>
            <span class="metric-label">Total stock</span>
            <strong>{{ totalUnits }}</strong>
            <small>Units on hand</small>
          </article>
          <article class="metric-card">
            <div class="metric-icon"><BarChart3 :size="18" /></div>
            <span class="metric-label">Inventory value</span>
            <strong>{{ money(inventoryValue) }}</strong>
            <small>Based on cost price</small>
          </article>
          <article class="metric-card metric-card--warning">
            <div class="metric-icon"><AlertTriangle :size="18" /></div>
            <span class="metric-label">Needs attention</span>
            <strong>{{ lowStock + outOfStock }}</strong>
            <small>{{ lowStock }} low · {{ outOfStock }} out</small>
          </article>
        </section>

        <section class="quick-actions-section">
          <div class="section-heading"><div><span class="eyebrow">Common tasks</span><h2>Quick actions</h2></div></div>
          <div class="quick-action-grid">
            <button class="quick-action" @click="quickAction('Stock In')"><span class="quick-icon"><ArrowDownToLine :size="20" /></span><span><strong>Stock in</strong><small>Record incoming inventory</small></span><ChevronRight :size="17" /></button>
            <button class="quick-action" @click="quickAction('Stock Out')"><span class="quick-icon"><ArrowUpFromLine :size="20" /></span><span><strong>Stock out</strong><small>Record outgoing inventory</small></span><ChevronRight :size="17" /></button>
            <button class="quick-action" @click="quickAction('Adjust Inventory')"><span class="quick-icon"><ClipboardList :size="20" /></span><span><strong>Adjust inventory</strong><small>Reconcile a physical count</small></span><ChevronRight :size="17" /></button>
          </div>
        </section>

        <div class="dashboard-grid">
          <section id="inventory" class="panel inventory-panel">
            <div class="panel-header">
              <div><span class="eyebrow">Live table preview</span><h2>Inventory</h2></div>
              <div class="filter-tabs">
                <button v-for="filter in ['All', 'Healthy', 'Low stock', 'Out of stock']" :key="filter" :class="{ active: activeFilter === filter }" @click="activeFilter = filter">{{ filter }}</button>
              </div>
            </div>
            <div class="table-wrap">
              <table>
                <thead><tr><th>Product</th><th>SKU</th><th>Stock</th><th>Status</th><th>Value</th></tr></thead>
                <tbody>
                  <tr v-for="product in filteredProducts" :key="product.id">
                    <td><div class="product-cell"><span class="product-glyph"><Package :size="17" /></span><span><strong>{{ product.name }}</strong><small>{{ product.category }}</small></span></div></td>
                    <td class="mono">{{ product.sku }}</td>
                    <td><strong>{{ product.quantity }}</strong> <span class="muted">units</span></td>
                    <td><span class="status-badge" :class="`status-${statusOf(product).toLowerCase().replaceAll(' ', '-')}`">{{ statusOf(product) }}</span></td>
                    <td>{{ money(product.quantity * product.cost) }}</td>
                  </tr>
                  <tr v-if="filteredProducts.length === 0"><td colspan="5" class="empty-row">No products match your search or filter.</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="movements" class="panel movement-panel">
            <div class="panel-header"><div><span class="eyebrow">Traceability</span><h2>Recent movements</h2></div><button class="text-button">View all</button></div>
            <div class="movement-list">
              <div v-for="movement in movements" :key="`${movement.item}-${movement.time}`" class="movement-row">
                <span class="movement-icon" :class="movement.type === 'Stock In' ? 'movement-in' : movement.type === 'Stock Out' ? 'movement-out' : 'movement-adjust'">
                  <ArrowDownToLine v-if="movement.type === 'Stock In'" :size="17" />
                  <ArrowUpFromLine v-else-if="movement.type === 'Stock Out'" :size="17" />
                  <ClipboardList v-else :size="17" />
                </span>
                <div class="movement-copy"><strong>{{ movement.item }}</strong><span>{{ movement.type }} · {{ movement.user }}</span><small>{{ movement.time }}</small></div>
                <strong class="movement-qty">{{ movement.qty }}</strong>
              </div>
            </div>
            <div class="trust-note"><Activity :size="17" /><span><strong>Every quantity change needs a reason.</strong> The production ledger will preserve previous quantity, new quantity, user, reference and timestamp.</span></div>
          </section>
        </div>
      </div>

      <transition name="toast">
        <div v-if="notice" class="toast"><span>{{ notice }}</span><button @click="notice = ''"><X :size="17" /></button></div>
      </transition>
    </main>
  </div>
</template>
