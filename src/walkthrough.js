const walkthroughMarkup = `
  <div class="mw-shell" aria-label="How Mejora works">
    <div class="mw-topbar">
      <div class="mw-window-dots"><span></span><span></span><span></span></div>
      <span class="mw-topbar-title">How Mejora works</span>
      <span class="mw-topbar-badge">LIVE PREVIEW</span>
    </div>

    <section class="mw-scene mw-scene-account">
      <div class="mw-scene-copy">
        <span class="mw-kicker">Step 1 · Account</span>
        <h3>Create your account</h3>
        <p>One login gives you access to every business workspace you manage.</p>
      </div>
      <div class="mw-ui-card mw-login-card">
        <div class="mw-card-title">Create account</div>
        <label><span>Full name</span><div class="mw-input"><i></i>Jamie Mejia</div></label>
        <label><span>Email</span><div class="mw-input"><i></i>jamie@mejora.app</div></label>
        <div class="mw-button mw-account-button"><span>Create account</span><b>Account ready</b></div>
      </div>
    </section>

    <section class="mw-scene mw-scene-business">
      <div class="mw-scene-copy">
        <span class="mw-kicker">Step 2 · Business setup</span>
        <h3>Tell Mejora what you run</h3>
        <p>The workspace changes to match your industry instead of forcing every business into the same template.</p>
      </div>
      <div class="mw-business-demo">
        <div class="mw-business-options">
          <button class="mw-business-option mw-business-selected"><span class="mw-radio"></span>Motorcycle Parts</button>
          <button class="mw-business-option"><span class="mw-radio"></span>Retail Store</button>
          <button class="mw-business-option"><span class="mw-radio"></span>Food Business</button>
        </div>
        <div class="mw-adapt-card">
          <span class="mw-adapt-label">Workspace adapted</span>
          <div class="mw-module-list">
            <span>Parts</span><span>Compatibility</span><span>Suppliers</span><span>Stock Movements</span>
          </div>
        </div>
      </div>
    </section>

    <section class="mw-scene mw-scene-import">
      <div class="mw-scene-copy">
        <span class="mw-kicker">Step 3 · Spreadsheet import</span>
        <h3>Drop in your Excel file</h3>
        <p>Mejora reads common headings, maps the columns, and flags anything that needs review.</p>
      </div>
      <div class="mw-import-demo">
        <div class="mw-sheet">
          <div class="mw-sheet-name"><span class="mw-file-chip">XLSX</span> current-inventory.xlsx</div>
          <div class="mw-sheet-grid mw-sheet-head"><span>Item Name</span><span>Qty</span><span>Cost</span></div>
          <div class="mw-sheet-grid mw-sheet-row r1"><span>Brake Pad Set</span><span>18</span><span>280</span></div>
          <div class="mw-sheet-grid mw-sheet-row r2"><span>Engine Oil 1L</span><span>7</span><span>205</span></div>
          <div class="mw-sheet-grid mw-sheet-row r3"><span>Spark Plug CR8E</span><span>42</span><span>95</span></div>
        </div>
        <div class="mw-map-list">
          <div><span>Item Name</span><i></i><b>Product name</b></div>
          <div><span>Qty</span><i></i><b>Stock</b></div>
          <div><span>Cost</span><i></i><b>Cost price</b></div>
        </div>
        <div class="mw-import-stats"><span><b>421</b> ready</span><span><b>9</b> duplicates</span><span><b>7</b> review</span></div>
      </div>
    </section>

    <section class="mw-scene mw-scene-ready">
      <div class="mw-scene-copy">
        <span class="mw-kicker">Step 4 · Ready</span>
        <h3>Your inventory is organized</h3>
        <p>Start managing stock, suppliers, movements, and low-stock alerts immediately.</p>
      </div>
      <div class="mw-dashboard-demo">
        <div class="mw-mini-metrics">
          <div><span>Products</span><b>124</b></div>
          <div><span>Units</span><b>1,248</b></div>
          <div><span>Low stock</span><b>12</b></div>
        </div>
        <div class="mw-table">
          <div class="mw-table-head"><span>Product</span><span>Stock</span><span>Status</span></div>
          <div class="mw-table-row t1"><span>Brake Pad Set</span><b>18</b><em>Healthy</em></div>
          <div class="mw-table-row t2"><span>Engine Oil 1L</span><b>7</b><em class="low">Low stock</em></div>
          <div class="mw-table-row t3"><span>Spark Plug CR8E</span><b>42</b><em>Healthy</em></div>
        </div>
        <div class="mw-ready-toast"><span></span> Spreadsheet imported successfully</div>
      </div>
    </section>

    <div class="mw-progress" aria-hidden="true">
      <span class="p1"></span><span class="p2"></span><span class="p3"></span><span class="p4"></span>
    </div>
  </div>
`

export function mountMejoraWalkthrough(root = document) {
  const apply = scope => {
    const target = scope?.matches?.('.visual-flow') ? scope : scope?.querySelector?.('.visual-flow')
    if (!target || target.dataset.mejoraWalkthrough === 'true') return
    target.dataset.mejoraWalkthrough = 'true'
    target.classList.add('mejora-demo')
    target.innerHTML = walkthroughMarkup
  }

  apply(root)

  const observer = new MutationObserver(records => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) apply(node)
      }
    }
  })
  observer.observe(document.body, { childList: true, subtree: true })
}
