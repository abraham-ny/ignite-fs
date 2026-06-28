// ============================================================
// MAIN.JS — Product rendering, order form, nav, canvas sparks
// ============================================================

// ---- Toast Notification ----
function showToast(msg, type = "success") {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `toast show ${type}`;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove("show"), 3500);
}

// ---- Render Products ----
function renderProducts(filter = "all") {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;

  const filtered = filter === "all" ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);

  grid.innerHTML = filtered.map(p => {
    const outOfStock = p.stock === 0;
    const badgeHTML = p.badge ? `<span class="prod-badge">${p.badge}</span>` : "";
    const discountHTML = p.originalPrice
      ? `<span class="price-original">${CONFIG.CURRENCY} ${p.originalPrice.toLocaleString()}</span>`
      : "";
    const stockLabel = outOfStock
      ? `<span class="stock-out">Out of Stock</span>`
      : `<span class="stock-in">${p.stock} available</span>`;
    const addBtn = outOfStock
      ? `<button class="btn-add disabled" disabled>Out of Stock</button>`
      : `<button class="btn-add" onclick="Cart.add('${p.id}', 1)">Add to Cart</button>`;
    const effectTags = p.effects.map(e => `<span class="effect-tag">${e}</span>`).join("");

    return `
      <div class="product-card glass-card" data-category="${p.category}" ${outOfStock ? 'data-oos="true"' : ""}>
        ${badgeHTML}
        <div class="prod-emoji">${p.emoji}</div>
        <div class="prod-info">
          <p class="prod-category">${p.category.charAt(0).toUpperCase() + p.category.slice(1)}</p>
          <h3>${p.name}</h3>
          <p class="prod-desc">${p.description}</p>
          <div class="effect-tags">${effectTags}</div>
          <div class="prod-footer">
            <div class="prod-price">
              ${discountHTML}
              <span class="price-main">${CONFIG.CURRENCY} ${p.price.toLocaleString()}</span>
            </div>
            <div class="prod-stock">${stockLabel}</div>
          </div>
        </div>
        <div class="prod-action">${addBtn}</div>
      </div>
    `;
  }).join("");

  // Stagger animation
  grid.querySelectorAll(".product-card").forEach((card, i) => {
    card.style.animationDelay = `${i * 60}ms`;
    card.classList.add("card-enter");
  });
}

// ---- Filter Buttons ----
function initFilters() {
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderProducts(btn.dataset.filter);
    });
  });
}

// ---- Order Form Submission ----
function initOrderForm() {
  const form = document.getElementById("orderForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const items = Cart.getAll();
    if (items.length === 0) {
      showToast("Please add items to your cart first.", "error");
      document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    const name = document.getElementById("custName").value.trim();
    const phone = document.getElementById("custPhone").value.trim();
    const email = document.getElementById("custEmail").value.trim();
    const address = document.getElementById("custAddress").value.trim();
    const eventType = document.getElementById("eventType").value;
    const eventDate = document.getElementById("eventDate").value;
    const notes = document.getElementById("custNotes").value.trim();

    if (!name || !phone || !email || !address) {
      showToast("Please fill in all required fields.", "error");
      return;
    }

    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailReg.test(email)) {
      showToast("Please enter a valid email address.", "error");
      return;
    }

    const btn = document.getElementById("submitOrderBtn");
    const label = document.getElementById("submitLabel");
    const spinner = document.getElementById("submitSpinner");
    btn.disabled = true;
    label.style.display = "none";
    spinner.style.display = "inline-block";

    const orderData = {
      action: "submitOrder",
      name, phone, email, address, eventType, eventDate, notes,
      items: JSON.stringify(items.map(i => ({
        id: i.id, name: i.name, qty: i.qty,
        price: i.price, lineTotal: i.lineTotal
      }))),
      total: Cart.total(),
      orderDate: new Date().toISOString()
    };

    try {
      const resp = await fetch(CONFIG.SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify(orderData)
      });
      const result = await resp.json();

      if (result.success) {
        showToast("🎆 Order placed successfully! We'll be in touch soon.", "success");
        form.reset();
        Cart.clear();
        confettiPop();
      } else {
        showToast("Something went wrong. Please try again.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error. Please check your connection and try again.", "error");
    } finally {
      btn.disabled = false;
      label.style.display = "inline";
      spinner.style.display = "none";
    }
  });
}

// ---- Navbar Scroll Effect ----
function initNav() {
  const nav = document.getElementById("navbar");
  window.addEventListener("scroll", () => {
    nav?.classList.toggle("scrolled", window.scrollY > 60);
  });

  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");
  hamburger?.addEventListener("click", () => {
    navLinks?.classList.toggle("open");
    hamburger.classList.toggle("active");
  });

  // Close nav on link click
  navLinks?.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      navLinks.classList.remove("open");
      hamburger?.classList.remove("active");
    });
  });
}

// ---- Canvas Sparks (Hero) ----
function initCanvas() {
  const canvas = document.getElementById("sparkCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  const particles = [];
  const COLORS = ["#ff6b35", "#ff3366", "#ffcc00", "#cc44ff", "#44aaff", "#ff8800"];

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = -Math.random() * 0.8 - 0.2;
      this.life = Math.random();
      this.maxLife = Math.random() * 0.015 + 0.004;
      this.size = Math.random() * 2.5 + 0.5;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.alpha = 0;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life -= this.maxLife;
      this.alpha = this.life > 0.5 ? (1 - this.life) * 2 : this.life * 2;
      if (this.life <= 0 || this.x < 0 || this.x > canvas.width) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha * 0.7;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  for (let i = 0; i < 80; i++) particles.push(new Particle());

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }
  animate();
}

// ---- Confetti Pop (order success) ----
function confettiPop() {
  const colors = ["#ff6b35","#ffcc00","#cc44ff","#44aaff","#ff3366","#00ffaa"];
  const container = document.body;
  for (let i = 0; i < 60; i++) {
    const dot = document.createElement("div");
    dot.className = "confetti-dot";
    dot.style.cssText = `
      position:fixed; width:8px; height:8px; border-radius:50%;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      left:${Math.random()*100}vw; top:-10px;
      animation: confettiFall ${1.5 + Math.random()*2}s ease-in forwards;
      animation-delay:${Math.random()*0.8}s;
      z-index:9999;
    `;
    container.appendChild(dot);
    setTimeout(() => dot.remove(), 4000);
  }
}

// ---- Intersection Observer (scroll reveal) ----
function initReveal() {
  const els = document.querySelectorAll(".section-header, .product-card, .testi-card, .about-text, .about-visual, .badge");
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("revealed"); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));
}

// ---- Init ----
document.addEventListener("DOMContentLoaded", () => {
  initNav();
  renderProducts();
  initFilters();
  initOrderForm();
  initCanvas();
  initReveal();

  // Confetti keyframe injection
  if (!document.getElementById("confettiStyle")) {
    const style = document.createElement("style");
    style.id = "confettiStyle";
    style.textContent = `
      @keyframes confettiFall {
        to { transform: translateY(110vh) rotate(720deg); opacity:0; }
      }
    `;
    document.head.appendChild(style);
  }
});
