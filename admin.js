// ============================================================
// ADMIN.JS — Login, dashboard, orders, inventory, messages
// ============================================================

// ---- Config: set your admin credentials here ----
// For production, validate server-side via Apps Script
const ADMIN_CREDENTIALS = {
  email: "admin@ignitefireworks.co.ke",
  password: "Ignite2025!" // Change this!
};

const SESSION_KEY = "ignite_admin_session";

// ---- Toast ----
function showToast(msg, type = "success") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = `toast show ${type}`;
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove("show"), 3500);
}

// ---- Session ----
function getSession() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)); }
  catch { return null; }
}
function setSession(email) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ email, time: Date.now() }));
}
function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

// ---- Login ----
function initLogin() {
  const session = getSession();
  if (session) {
    showDashboard(session.email);
    return;
  }

  // Toggle password visibility
  document.getElementById("togglePw")?.addEventListener("click", () => {
    const pw = document.getElementById("loginPassword");
    pw.type = pw.type === "password" ? "text" : "password";
  });

  document.getElementById("loginBtn")?.addEventListener("click", async () => {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const errEl = document.getElementById("loginError");
    const btn = document.getElementById("loginBtn");
    const label = document.getElementById("loginLabel");
    const spinner = document.getElementById("loginSpinner");

    errEl.style.display = "none";

    if (!email || !password) {
      errEl.textContent = "Please enter your email and password.";
      errEl.style.display = "block";
      return;
    }

    btn.disabled = true;
    label.style.display = "none";
    spinner.style.display = "inline-block";

    // Simulate slight delay for UX
    await new Promise(r => setTimeout(r, 600));

    // Client-side credential check
    // For production: replace with server-side validation via Apps Script
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      setSession(email);
      showDashboard(email);
    } else {
      errEl.textContent = "Invalid email or password. Please try again.";
      errEl.style.display = "block";
      btn.disabled = false;
      label.style.display = "inline";
      spinner.style.display = "none";
    }
  });

  // Enter key support
  document.getElementById("loginPassword")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("loginBtn")?.click();
  });
}

// ---- Show Dashboard ----
function showDashboard(email) {
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("adminWrap").style.display = "flex";
  document.getElementById("adminEmailDisplay").textContent = email;
  loadPanel("dashboard");
  fetchAllData();
}

// ---- Logout ----
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  clearSession();
  document.getElementById("adminWrap").style.display = "none";
  document.getElementById("loginScreen").style.display = "flex";
  document.getElementById("loginEmail").value = "";
  document.getElementById("loginPassword").value = "";
});

// ---- Sidebar Navigation ----
document.querySelectorAll(".sidebar-link").forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const panel = link.dataset.panel;
    document.querySelectorAll(".sidebar-link").forEach(l => l.classList.remove("active"));
    link.classList.add("active");
    loadPanel(panel);
    document.getElementById("adminSidebar").classList.remove("open");
  });
});

document.getElementById("sidebarToggle")?.addEventListener("click", () => {
  document.getElementById("adminSidebar").classList.toggle("open");
});

function loadPanel(name) {
  document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
  document.getElementById(`panel-${name}`)?.classList.add("active");
  const titles = { dashboard: "Dashboard", orders: "Orders", inventory: "Inventory", messages: "Messages" };
  document.getElementById("panelTitle").textContent = titles[name] || name;
}

// ---- Refresh ----
document.getElementById("refreshBtn")?.addEventListener("click", () => {
  fetchAllData();
  showToast("Data refreshed.", "success");
});

// ============================================================
// DATA — Fetch from Google Apps Script
// ============================================================
let allOrders = [];
let allMessages = [];
let localStock = {}; // local edits before saving

async function fetchAllData() {
  try {
    const resp = await fetch(`${CONFIG.SCRIPT_URL}?action=getAdminData`);
    const data = await resp.json();

    if (data.orders) { allOrders = data.orders; }
    if (data.messages) { allMessages = data.messages; }

    updateStats();
    renderRecentOrders();
    renderOrdersTable();
    renderInventory();
    renderMessages();
  } catch (err) {
    console.error("Fetch error:", err);
    // Render with empty/mock data so UI is visible
    allOrders = getDemoOrders();
    allMessages = getDemoMessages();
    updateStats();
    renderRecentOrders();
    renderOrdersTable();
    renderInventory();
    renderMessages();
    showToast("Using demo data — connect your Apps Script URL in products.js.", "error");
  }
}

// Demo fallback data
function getDemoOrders() {
  return [
    { id:"ORD001", name:"Sarah M.", email:"sarah@example.com", phone:"+254711000001", address:"Westlands, Nairobi", items:"Galaxy Burst Shell x2", total:5000, eventType:"Wedding", eventDate:"2025-12-15", status:"Pending", date:"2025-06-01" },
    { id:"ORD002", name:"James K.", email:"james@example.com", phone:"+254711000002", address:"Nyali, Mombasa", items:"Grand Finale Cake x1, Sparklers x5", total:12250, eventType:"Corporate Event", eventDate:"2025-12-31", status:"Confirmed", date:"2025-06-02" },
    { id:"ORD003", name:"Amina W.", email:"amina@example.com", phone:"+254711000003", address:"Kisumu CBD", items:"Kids Safe Sparklers x3", total:600, eventType:"Birthday Party", eventDate:"2025-06-20", status:"Delivered", date:"2025-06-03" },
  ];
}
function getDemoMessages() {
  return [
    { id:"MSG001", name:"Peter L.", email:"peter@example.com", subject:"Wholesale Query", message:"I'd like to discuss bulk pricing for 500 packs of sparklers.", rating:"5", date:"2025-06-04" },
    { id:"MSG002", name:"Grace N.", email:"grace@example.com", subject:"Delivery Question", message:"Do you deliver to Nakuru? What's the timeline?", rating:"4", date:"2025-06-05" },
  ];
}

// ---- Stats ----
function updateStats() {
  const totalOrders = allOrders.length;
  const revenue = allOrders.reduce((s, o) => s + parseFloat(o.total || 0), 0);
  const inStockCount = PRODUCTS.filter(p => p.stock > 0).length;

  document.getElementById("stat-total-orders").textContent = totalOrders;
  document.getElementById("stat-revenue").textContent = `KES ${revenue.toLocaleString()}`;
  document.getElementById("stat-messages").textContent = allMessages.length;
  document.getElementById("stat-products").textContent = `${inStockCount}/${PRODUCTS.length}`;
}

// ---- Recent Orders ----
function renderRecentOrders() {
  const el = document.getElementById("recentOrdersTable");
  const recent = [...allOrders].slice(-5).reverse();
  if (!recent.length) { el.innerHTML = '<p class="empty-state">No orders yet.</p>'; return; }
  el.innerHTML = buildOrderTable(recent, true);
}

// ---- Orders Table ----
function renderOrdersTable(filter = "") {
  const el = document.getElementById("ordersTableWrap");
  let orders = allOrders;
  if (filter) {
    const q = filter.toLowerCase();
    orders = orders.filter(o => o.name?.toLowerCase().includes(q) || o.email?.toLowerCase().includes(q));
  }
  if (!orders.length) { el.innerHTML = '<p class="empty-state">No orders found.</p>'; return; }
  el.innerHTML = buildOrderTable([...orders].reverse(), false);
}

function buildOrderTable(orders, compact) {
  const statusColors = { Pending: "warning", Confirmed: "info", Delivered: "success", Cancelled: "error" };
  return `
    <table class="admin-table">
      <thead><tr>
        <th>ID</th><th>Customer</th><th>Items</th>
        <th>Total</th><th>Status</th><th>Date</th>
        ${compact ? "" : "<th>Actions</th>"}
      </tr></thead>
      <tbody>
        ${orders.map(o => `
          <tr>
            <td><code>${o.id || "—"}</code></td>
            <td><strong>${o.name}</strong><br/><small>${o.email}</small></td>
            <td class="items-cell"><small>${o.items}</small></td>
            <td><strong>KES ${parseFloat(o.total||0).toLocaleString()}</strong></td>
            <td><span class="status-badge ${statusColors[o.status]||"info"}">${o.status||"Pending"}</span></td>
            <td><small>${o.date || "—"}</small></td>
            ${compact ? "" : `
              <td class="table-actions">
                <button class="btn-sm btn-primary" onclick="openOrderModal('${o.id}')">View</button>
                <select class="status-select" onchange="updateOrderStatus('${o.id}', this.value)">
                  <option value="">Update status</option>
                  <option>Pending</option>
                  <option>Confirmed</option>
                  <option>Delivered</option>
                  <option>Cancelled</option>
                </select>
              </td>
            `}
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

document.getElementById("orderSearch")?.addEventListener("input", (e) => {
  renderOrdersTable(e.target.value);
});

// ---- Export CSV ----
document.getElementById("exportOrdersBtn")?.addEventListener("click", () => {
  exportCSV(allOrders, "ignite_orders.csv");
});
document.getElementById("exportMsgsBtn")?.addEventListener("click", () => {
  exportCSV(allMessages, "ignite_messages.csv");
});

function exportCSV(data, filename) {
  if (!data.length) { showToast("No data to export.", "error"); return; }
  const keys = Object.keys(data[0]);
  const csv = [keys.join(","), ...data.map(row =>
    keys.map(k => `"${(row[k] || "").toString().replace(/"/g,'""')}"`).join(",")
  )].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = filename;
  a.click();
}

// ---- Inventory ----
function renderInventory() {
  const grid = document.getElementById("inventoryGrid");
  if (!grid) return;

  grid.innerHTML = PRODUCTS.map(p => {
    const stock = localStock[p.id] !== undefined ? localStock[p.id] : p.stock;
    const outOfStock = stock === 0;
    return `
      <div class="inv-card glass-card ${outOfStock ? "oos" : ""}">
        <div class="inv-header">
          <span class="inv-emoji">${p.emoji}</span>
          <div>
            <h4>${p.name}</h4>
            <p class="inv-cat">${p.category}</p>
          </div>
          <span class="status-badge ${outOfStock ? "error" : "success"}">
            ${outOfStock ? "Out of Stock" : "In Stock"}
          </span>
        </div>
        <div class="inv-price">KES ${p.price.toLocaleString()}</div>
        <div class="inv-stock-control">
          <label>Stock Level</label>
          <div class="stock-input-row">
            <button onclick="adjustStock('${p.id}', -10)">−10</button>
            <button onclick="adjustStock('${p.id}', -1)">−1</button>
            <input type="number" id="stock-${p.id}" value="${stock}" min="0"
              onchange="setStock('${p.id}', this.value)"/>
            <button onclick="adjustStock('${p.id}', 1)">+1</button>
            <button onclick="adjustStock('${p.id}', 10)">+10</button>
          </div>
        </div>
        <div class="inv-actions">
          <button class="btn-sm ${outOfStock ? "btn-primary" : "btn-outline-danger"}"
            onclick="toggleStockStatus('${p.id}', ${stock})">
            ${outOfStock ? "Mark In Stock" : "Mark Out of Stock"}
          </button>
          <button class="btn-sm btn-primary" onclick="saveStockUpdate('${p.id}')">
            Save Changes
          </button>
        </div>
      </div>
    `;
  }).join("");
}

function adjustStock(id, delta) {
  const input = document.getElementById(`stock-${id}`);
  const newVal = Math.max(0, parseInt(input.value || 0) + delta);
  input.value = newVal;
  localStock[id] = newVal;
}

function setStock(id, val) {
  localStock[id] = Math.max(0, parseInt(val) || 0);
}

function toggleStockStatus(id, currentStock) {
  const newVal = currentStock === 0 ? 10 : 0;
  const input = document.getElementById(`stock-${id}`);
  if (input) input.value = newVal;
  localStock[id] = newVal;
  renderInventory();
}

async function saveStockUpdate(productId) {
  const stock = localStock[productId] !== undefined
    ? localStock[productId]
    : (PRODUCTS.find(p => p.id === productId)?.stock || 0);

  try {
    const resp = await fetch(CONFIG.SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ action: "updateStock", productId, stock })
    });
    const result = await resp.json();
    if (result.success) {
      // Update local PRODUCTS array
      const prod = PRODUCTS.find(p => p.id === productId);
      if (prod) prod.stock = stock;
      showToast("Stock updated successfully.", "success");
      renderInventory();
      updateStats();
    } else {
      showToast("Failed to update. Check your Apps Script URL.", "error");
    }
  } catch {
    // Still update local state even if server fails (demo mode)
    const prod = PRODUCTS.find(p => p.id === productId);
    if (prod) prod.stock = stock;
    showToast("Saved locally (Apps Script not connected).", "warning");
    renderInventory();
  }
}

// ---- Order Status Update ----
async function updateOrderStatus(orderId, status) {
  if (!status) return;
  try {
    const resp = await fetch(CONFIG.SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ action: "updateOrderStatus", orderId, status })
    });
    const result = await resp.json();
    if (result.success) {
      const order = allOrders.find(o => o.id === orderId);
      if (order) order.status = status;
      renderOrdersTable();
      renderRecentOrders();
      showToast(`Order ${orderId} marked as ${status}.`, "success");
    } else {
      showToast("Failed to update status.", "error");
    }
  } catch {
    // Demo mode
    const order = allOrders.find(o => o.id === orderId);
    if (order) order.status = status;
    renderOrdersTable();
    showToast(`Status updated locally (demo mode).`, "warning");
  }
}

// ---- Messages ----
function renderMessages() {
  const el = document.getElementById("messagesList");
  if (!allMessages.length) {
    el.innerHTML = '<p class="empty-state">No messages yet.</p>'; return;
  }
  el.innerHTML = allMessages.map(m => `
    <div class="message-card glass-card">
      <div class="msg-header">
        <div>
          <strong>${m.name}</strong>
          <small>${m.email}</small>
        </div>
        <div class="msg-meta">
          <span class="status-badge info">${m.subject}</span>
          <small>${m.date}</small>
        </div>
      </div>
      <p class="msg-body">${m.message}</p>
      ${m.rating && m.rating !== "0"
        ? `<p class="msg-rating">${"★".repeat(parseInt(m.rating))}${"☆".repeat(5-parseInt(m.rating))}</p>`
        : ""}
    </div>
  `).join("");
}

// ---- Order Detail Modal ----
function openOrderModal(orderId) {
  const order = allOrders.find(o => o.id === orderId);
  if (!order) return;
  document.getElementById("modalBody").innerHTML = `
    <h3>Order Details — ${order.id}</h3>
    <div class="modal-detail-grid">
      <div><label>Customer</label><p>${order.name}</p></div>
      <div><label>Email</label><p>${order.email}</p></div>
      <div><label>Phone</label><p>${order.phone}</p></div>
      <div><label>Address</label><p>${order.address}</p></div>
      <div><label>Event Type</label><p>${order.eventType || "—"}</p></div>
      <div><label>Event Date</label><p>${order.eventDate || "—"}</p></div>
      <div><label>Total</label><p><strong>KES ${parseFloat(order.total||0).toLocaleString()}</strong></p></div>
      <div><label>Status</label><p><span class="status-badge info">${order.status}</span></p></div>
      <div class="full-width"><label>Items</label><p>${order.items}</p></div>
      ${order.notes ? `<div class="full-width"><label>Notes</label><p>${order.notes}</p></div>` : ""}
    </div>
  `;
  document.getElementById("modalOverlay").classList.add("active");
}

document.getElementById("modalClose")?.addEventListener("click", () => {
  document.getElementById("modalOverlay").classList.remove("active");
});
document.getElementById("modalOverlay")?.addEventListener("click", (e) => {
  if (e.target === document.getElementById("modalOverlay")) {
    document.getElementById("modalOverlay").classList.remove("active");
  }
});

// ---- Init ----
initLogin();
