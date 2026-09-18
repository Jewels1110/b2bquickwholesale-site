/* Interactive demo of the buyer's ordering page.
   Mirrors the real portal's behaviour: quantity rules (minimum and increments),
   stock limits, "In cart" counts, a running order total and free-shipping
   progress. Everything happens in the page; nothing is sent anywhere. */
(() => {
  const money = (cents) =>
    (cents / 100).toLocaleString(undefined, { style: "currency", currency: "USD" });

  const CATALOG = [
    { id: 1, sku: "CST-100", name: "Clarifying Toner", cat: "skincare", msrp: 2400, price: 1200, min: 6, step: 6, stock: 48 },
    { id: 2, sku: "HYD-250", name: "Hydrating Serum", cat: "skincare", msrp: 4800, price: 2400, min: 6, step: 6, stock: 12 },
    { id: 3, sku: "BLM-050", name: "Balm Cleanser", cat: "skincare", msrp: 3200, price: 1600, min: 12, step: 12, stock: 96 },
    { id: 4, sku: "SPF-030", name: "Daily SPF 30", cat: "skincare", msrp: 3600, price: 1800, min: 6, step: 6, stock: 3 },
    { id: 5, sku: "CND-200", name: "Soy Candle, Fig", cat: "home", msrp: 2800, price: 1400, min: 4, step: 4, stock: 120 },
    { id: 6, sku: "SOP-120", name: "Bar Soap, Cedar", cat: "home", msrp: 1200, price: 600, min: 12, step: 12, stock: 240 },
    { id: 7, sku: "TWL-001", name: "Waffle Hand Towel", cat: "home", msrp: 2200, price: 1100, min: 6, step: 6, stock: 0 },
    { id: 8, sku: "GFT-010", name: "Gift Set, Trio", cat: "gifting", msrp: 7500, price: 3750, min: 2, step: 2, stock: 24 },
  ];
  const FREE_SHIPPING = 25000;

  const root = document.querySelector("[data-order-demo]");
  if (!root) return;

  const state = { view: "quick", cat: "all", search: "", qty: {}, cart: {} };
  CATALOG.forEach((p) => (state.qty[p.id] = 0));

  const fit = (product, wanted) => {
    if (wanted <= 0) return 0;
    const stock = product.stock;
    let n = Math.max(product.min, Math.ceil(wanted / product.step) * product.step);
    // Always clamp to stock. Guarding this with stock > 0 read "0 means no limit",
    // so the quantity on an out-of-stock product counted happily upwards.
    if (n > stock) n = Math.floor(stock / product.step) * product.step;
    return Math.max(0, n);
  };

  const ruleText = (p) => {
    const bits = [];
    if (p.min > 1) bits.push(`Min ${p.min}`);
    if (p.step > 1) bits.push(`sold in ${p.step}s`);
    if (p.stock === 0) bits.push("Out of stock");
    else if (p.stock <= 12) bits.push(`Only ${p.stock} left`);
    return bits.join(" · ");
  };

  root.innerHTML = `
    <div class="od__chrome" aria-hidden="true">
      <span class="od__dot"></span><span class="od__dot"></span><span class="od__dot"></span>
      <span class="od__url">glowsupply.com/pages/wholesale-ordering</span>
    </div>
    <div class="od__body">
      <div class="od__head">
        <div>
          <h3 class="od__title">Wholesale ordering</h3>
          <p class="od__who">Signed in as Dana Whitlock · Glow Studio — Colorado Springs</p>
        </div>
        <span class="stamp">Live demo</span>
      </div>

      <div class="od__bar">
        <label class="sr-only" for="od-search">Search products</label>
        <input class="od__search" id="od-search" type="search" placeholder="Search products or SKUs…" autocomplete="off">
        <div class="od__chips" role="group" aria-label="Filter by category">
          <button class="od__chip" type="button" data-cat="all" aria-pressed="true">All 8</button>
          <button class="od__chip" type="button" data-cat="skincare" aria-pressed="false">Skincare 4</button>
          <button class="od__chip" type="button" data-cat="home" aria-pressed="false">Home 3</button>
          <button class="od__chip" type="button" data-cat="gifting" aria-pressed="false">Gifting 1</button>
        </div>
        <div class="od__views" role="group" aria-label="View">
          <button class="od__view" type="button" data-view="quick" aria-pressed="true">Quick order</button>
          <button class="od__view" type="button" data-view="catalog" aria-pressed="false">Catalog</button>
        </div>
      </div>

      <div class="od__cols" aria-hidden="true">
        <span></span><span>Product</span><span>MSRP</span><span>Wholesale</span><span>Qty</span><span></span>
      </div>
      <div class="od__list" data-list></div>

      <div class="od__summary">
        <div>
          <span class="od__sumlabel">Order form subtotal</span>
          <strong class="od__sumtotal" data-subtotal>$0.00</strong>
          <span class="od__ship" data-ship></span>
        </div>
        <div class="od__status" data-status role="status" aria-live="polite"></div>
        <div class="btn-row">
          <button class="btn btn--sm btn--ghost" type="button" data-reset>Clear form</button>
          <button class="btn btn--sm" type="button" data-addall>Add all to cart</button>
        </div>
      </div>
    </div>`;

  const list = root.querySelector("[data-list]");
  const statusEl = root.querySelector("[data-status]");
  const subtotalEl = root.querySelector("[data-subtotal]");
  const shipEl = root.querySelector("[data-ship]");
  let statusTimer;

  const say = (message) => {
    statusEl.textContent = message;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => (statusEl.textContent = ""), 3200);
  };

  list.innerHTML = CATALOG.map(
    (p) => `
    <article class="od__row" data-id="${p.id}" data-cat="${p.cat}" data-search="${(p.name + " " + p.sku).toLowerCase()}">
      <div class="od__cell--thumb od__thumb" aria-hidden="true">${p.sku.slice(0, 3)}</div>
      <div class="od__cell--body">
        <div class="od__name">${p.name}</div>
        <div class="od__meta">
          <span>SKU: ${p.sku}</span>
          <span class="od__incart" data-incart hidden></span>
        </div>
        <span class="od__rule" data-rule>${ruleText(p)}</span>
      </div>
      <div class="od__cell--msrp od__msrp">${money(p.msrp)}</div>
      <div class="od__cell--price od__price">${money(p.price)}</div>
      <div class="od__cell--qty">
        <div class="od__stepper">
          <button type="button" data-minus aria-label="Decrease quantity of ${p.name}">−</button>
          <input type="number" inputmode="numeric" value="0" min="0" step="${p.step}" data-qty aria-label="Quantity of ${p.name}">
          <button type="button" data-plus aria-label="Increase quantity of ${p.name}">+</button>
        </div>
        <span class="od__total" data-line></span>
      </div>
      <div class="od__cell--action">
        <button class="od__add" type="button" data-add ${fit(p, p.min) ? "" : "disabled"}>${fit(p, p.min) ? "Add" : "Unavailable"}</button>
      </div>
    </article>`,
  ).join("");

  const rowOf = (id) => list.querySelector(`[data-id="${id}"]`);

  const refresh = () => {
    let subtotal = 0;
    CATALOG.forEach((p) => {
      const row = rowOf(p.id);
      const qty = state.qty[p.id];
      subtotal += qty * p.price;
      row.querySelector("[data-qty]").value = qty;
      row.querySelector("[data-line]").textContent = qty ? money(qty * p.price) : "";
      const badge = row.querySelector("[data-incart]");
      const inCart = state.cart[p.id] || 0;
      badge.hidden = !inCart;
      badge.textContent = inCart ? `In cart: ${inCart}` : "";
      const match =
        (state.cat === "all" || state.cat === p.cat) &&
        (!state.search || row.dataset.search.includes(state.search));
      row.hidden = !match;
    });
    const cartCents = Object.entries(state.cart).reduce(
      (sum, [id, qty]) => sum + qty * CATALOG.find((p) => p.id === Number(id)).price,
      0,
    );
    subtotalEl.textContent = money(subtotal);
    const total = subtotal + cartCents;
    shipEl.textContent =
      total >= FREE_SHIPPING
        ? "Qualifies for free wholesale shipping."
        : `Add ${money(FREE_SHIPPING - total)} more (including what's in your cart) for free wholesale shipping.`;
  };

  const add = (ids, button) => {
    const lines = ids.filter((id) => state.qty[id] > 0);
    if (!lines.length) {
      say("Add a quantity first.");
      return;
    }
    let units = 0;
    lines.forEach((id) => {
      state.cart[id] = (state.cart[id] || 0) + state.qty[id];
      units += state.qty[id];
      state.qty[id] = 0;
    });
    refresh();
    say(`${units} ${units === 1 ? "item" : "items"} added to cart.`);
    if (button && !button.disabled) {
      const label = button.textContent;
      button.textContent = "Added ✓";
      button.classList.add("is-added");
      setTimeout(() => {
        button.textContent = label;
        button.classList.remove("is-added");
      }, 1600);
    }
  };

  list.addEventListener("click", (event) => {
    const row = event.target.closest("[data-id]");
    if (!row) return;
    const id = Number(row.dataset.id);
    const product = CATALOG.find((p) => p.id === id);
    if (event.target.closest("[data-plus]")) state.qty[id] = fit(product, state.qty[id] + product.step);
    else if (event.target.closest("[data-minus]")) {
      const next = state.qty[id] - product.step;
      state.qty[id] = next < product.min ? 0 : fit(product, next);
    } else if (event.target.closest("[data-add]")) {
      if (!state.qty[id]) state.qty[id] = fit(product, product.min);
      add([id], event.target.closest("[data-add]"));
      return;
    } else return;
    refresh();
  });

  list.addEventListener("change", (event) => {
    const input = event.target.closest("[data-qty]");
    if (!input) return;
    const id = Number(input.closest("[data-id]").dataset.id);
    const product = CATALOG.find((p) => p.id === id);
    const wanted = Number(input.value) || 0;
    state.qty[id] = fit(product, wanted);
    if (state.qty[id] !== wanted && wanted > 0) {
      // Say why the number changed, the way the real ordering page does.
      const capped = product.stock > 0 && wanted > product.stock;
      say(
        capped
          ? `${product.name}: only ${product.stock} left, and it's sold in ${product.step}s.`
          : `${product.name}: ${product.min > 1 ? `minimum ${product.min}, ` : ""}sold in ${product.step}s.`,
      );
    }
    refresh();
  });

  root.querySelector("[data-addall]").addEventListener("click", (event) => add(CATALOG.map((p) => p.id), event.currentTarget));
  root.querySelector("[data-reset]").addEventListener("click", () => {
    CATALOG.forEach((p) => (state.qty[p.id] = 0));
    state.cart = {};
    refresh();
    say("Form cleared.");
  });
  root.querySelector("#od-search").addEventListener("input", (event) => {
    state.search = event.target.value.trim().toLowerCase();
    refresh();
  });
  root.querySelectorAll("[data-cat]").forEach((chip) =>
    chip.addEventListener("click", () => {
      state.cat = chip.dataset.cat;
      root.querySelectorAll("[data-cat]").forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
      refresh();
    }),
  );
  root.querySelectorAll("[data-view]").forEach((button) =>
    button.addEventListener("click", () => {
      state.view = button.dataset.view;
      list.dataset.view = state.view;
      root.querySelector(".od__cols").dataset.view = state.view;
      root.querySelectorAll("[data-view]").forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
    }),
  );

  refresh();
})();
