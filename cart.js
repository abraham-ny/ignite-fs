// ============================================================
// CART — localStorage-backed shopping cart
// ============================================================
const Cart = (() => {
  const KEY = "ignite_cart";

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  }

  function save(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
    render();
    updateFab();
  }

  function add(productId, qty = 1) {
    const items = load();
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;
    if (product.stock === 0) { showToast("Sorry — this item is out of stock.", "error"); return; }
    const existing = items.find(i => i.id === productId);
    if (existing) {
      if (existing.qty + qty > product.stock) {
        showToast(`Only ${product.stock} in stock.`, "error"); return;
      }
      existing.qty += qty;
    } else {
      items.push({ id: productId, qty });
    }
    save(items);
    showToast(`${product.name} added to cart! 🎆`, "success");
  }

  function remove(productId) {
    const items = load().filter(i => i.id !== productId);
    save(items);
  }

  function updateQty(productId, qty) {
    const items = load();
    const item = items.find(i => i.id === productId);
    if (!item) return;
    if (qty <= 0) { remove(productId); return; }
    item.qty = qty;
    save(items);
  }

  function total() {
    return load().reduce((sum, item) => {
      const p = PRODUCTS.find(pr => pr.id === item.id);
      return p ? sum + p.price * item.qty : sum;
    }, 0);
  }

  function getAll() {
    return load().map(item => {
      const p = PRODUCTS.find(pr => pr.id === item.id);
      return p ? { ...p, qty: item.qty, lineTotal: p.price * item.qty } : null;
    }).filter(Boolean);
  }

  function clear() { localStorage.removeItem(KEY); render(); updateFab(); }

  function render() {
    const cartItems = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");
    const totalAmt = document.getElementById("totalAmt");
    if (!cartItems) return;

    const items = getAll();
    if (items.length === 0) {
      cartItems.innerHTML = '<p class="empty-cart">No items added yet. Browse products above and click "Add to Cart".</p>';
      if (cartTotal) cartTotal.style.display = "none";
      return;
    }

    cartItems.innerHTML = items.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <span class="ci-emoji">${item.emoji}</span>
        <div class="ci-info">
          <strong>${item.name}</strong>
          <span>${CONFIG.CURRENCY} ${item.price.toLocaleString()} each</span>
        </div>
        <div class="ci-qty">
          <button onclick="Cart.updateQty('${item.id}', ${item.qty - 1})">−</button>
          <span>${item.qty}</span>
          <button onclick="Cart.updateQty('${item.id}', ${item.qty + 1})">+</button>
        </div>
        <span class="ci-line">${CONFIG.CURRENCY} ${item.lineTotal.toLocaleString()}</span>
        <button class="ci-remove" onclick="Cart.remove('${item.id}')" title="Remove">✕</button>
      </div>
    `).join("");

    const t = total();
    if (cartTotal) {
      cartTotal.style.display = "flex";
      totalAmt.textContent = `${CONFIG.CURRENCY} ${t.toLocaleString()}`;
    }

    // Delivery notice
    if (t < CONFIG.FREE_DELIVERY_THRESHOLD) {
      const needed = CONFIG.FREE_DELIVERY_THRESHOLD - t;
      cartItems.insertAdjacentHTML("beforeend", `
        <p class="delivery-note">Add ${CONFIG.CURRENCY} ${needed.toLocaleString()} more for free delivery!</p>
      `);
    } else {
      cartItems.insertAdjacentHTML("beforeend", `
        <p class="delivery-note success-note">✓ Free delivery on this order!</p>
      `);
    }
  }

  function updateFab() {
    const count = load().reduce((s, i) => s + i.qty, 0);
    const fab = document.getElementById("cartCount");
    if (fab) {
      fab.textContent = count;
      fab.parentElement.classList.toggle("has-items", count > 0);
    }
  }

  return { add, remove, updateQty, total, getAll, clear, render, updateFab };
})();

// Scroll to order section when cart FAB clicked
document.addEventListener("DOMContentLoaded", () => {
  const fab = document.getElementById("cartFab");
  if (fab) {
    fab.addEventListener("click", () => {
      document.getElementById("order-section")?.scrollIntoView({ behavior: "smooth" });
    });
  }
  Cart.render();
  Cart.updateFab();
});
