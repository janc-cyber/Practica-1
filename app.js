
/* ========= Datos (puedes editar sabores, precios, etc.) ========= */
const PRODUCTS = [
  { id: "cono_vainilla", name: "Cono Vainilla", desc: "Clásico suave y cremoso.", price: 90, cat: "cono", emoji: "🍦" },
  { id: "cono_choco", name: "Cono Chocolate", desc: "Intenso y delicioso.", price: 100, cat: "cono", emoji: "🍫" },
  { id: "cono_fresa", name: "Cono Fresa", desc: "Dulce, frutal y refrescante.", price: 95, cat: "cono", emoji: "🍓" },

  { id: "copa_mango", name: "Copa Mango", desc: "Mango tropical con topping.", price: 150, cat: "copa", emoji: "🥭" },
  { id: "copa_cookies", name: "Copa Cookies & Cream", desc: "Galleta + crema = vicio.", price: 170, cat: "copa", emoji: "🍪" },
  { id: "copa_pistacho", name: "Copa Pistacho", desc: "Premium con pistacho real.", price: 190, cat: "premium", emoji: "🌰" },

  { id: "litro_vainilla", name: "Litro Vainilla", desc: "Para compartir en familia.", price: 420, cat: "litro", emoji: "🧊" },
  { id: "litro_choco", name: "Litro Chocolate", desc: "Súper cremoso, full sabor.", price: 450, cat: "litro", emoji: "🧊" },
  { id: "litro_mixto", name: "Litro Mixto", desc: "Vainilla + chocolate + fresa.", price: 480, cat: "litro", emoji: "🧊" },
];

/* ========= Config ========= */
const CURRENCY = "RD$";
const CART_KEY = "ice_cart_v1";
const THEME_KEY = "ice_theme_v1";

// ⚠️ Pon tu número en formato internacional sin + (ej: 1809xxxxxxx)
const WHATSAPP_NUMBER = "18090000000";

// Delivery fijo (puedes cambiarlo a 0 si no aplica)
const DELIVERY_FEE = 100;

/* ========= Utilidades ========= */
const money = (n) => `${CURRENCY}${n.toLocaleString("es-DO")}`;
const byId = (id) => document.getElementById(id);

/* ========= DOM ========= */
const productsGrid = byId("productsGrid");
const searchInput = byId("searchInput");
const cartDrawer = byId("cartDrawer");
const openCartBtn = byId("openCartBtn");
const closeCartBtn = byId("closeCartBtn");
const backdrop = byId("backdrop");

const cartItemsEl = byId("cartItems");
const cartCountEl = byId("cartCount");
const subtotalText = byId("subtotalText");
const deliveryText = byId("deliveryText");
const totalText = byId("totalText");
const noteInput = byId("noteInput");
const whatsBtn = byId("whatsBtn");
const clearCartBtn = byId("clearCartBtn");

const themeBtn = byId("themeBtn");
const addPromoBtn = byId("addPromoBtn");
byId("year").textContent = new Date().getFullYear();

/* ========= Estado ========= */
let activeFilter = "all";
let cart = loadCart();

/* ========= Render Productos ========= */
function renderProducts() {
  const q = (searchInput.value || "").trim().toLowerCase();

  const filtered = PRODUCTS.filter(p => {
    const matchFilter = activeFilter === "all" ? true : p.cat === activeFilter;
    const matchSearch = !q ? true : (p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));
    return matchFilter && matchSearch;
  });

  productsGrid.innerHTML = filtered.map(p => `
    <article class="product">
      <div class="pic" aria-hidden="true">${p.emoji}</div>
      <div class="pInfo">
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <div class="priceRow">
          <span class="price">${money(p.price)}</span>
          <button class="btn" data-add="${p.id}">Agregar</button>
        </div>
      </div>
    </article>
  `).join("");

  // Eventos agregar
  productsGrid.querySelectorAll("[data-add]").forEach(btn => {
    btn.addEventListener("click", () => addToCart(btn.dataset.add));
  });
}

/* ========= Carrito ========= */
function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || {};
  } catch {
    return {};
  }
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(productId) {
  cart[productId] = (cart[productId] || 0) + 1;
  saveCart();
  renderCart();
  openDrawer();
}

function changeQty(productId, delta) {
  cart[productId] = (cart[productId] || 0) + delta;
  if (cart[productId] <= 0) delete cart[productId];
  saveCart();
  renderCart();
}

function clearCart() {
  cart = {};
  saveCart();
  renderCart();
}

function cartCount() {
  return Object.values(cart).reduce((a,b)=>a+b,0);
}

function calcSubtotal() {
  let sum = 0;
  for (const [id, qty] of Object.entries(cart)) {
    const p = PRODUCTS.find(x => x.id === id);
    if (p) sum += p.price * qty;
  }
  return sum;
}

function renderCart() {
  const count = cartCount();
  cartCountEl.textContent = count;

  if (count === 0) {
    cartItemsEl.innerHTML = `
      <div class="muted">Tu carrito está vacío. Agrega un helado 🍦</div>
    `;
  } else {
    cartItemsEl.innerHTML = Object.entries(cart).map(([id, qty]) => {
      const p = PRODUCTS.find(x => x.id === id);
      if (!p) return "";
      return `
        <div class="cartItem">
          <div class="miniPic" aria-hidden="true">${p.emoji}</div>
          <div class="meta">
            <strong>${p.name}</strong>
            <small>${money(p.price)} c/u</small>
          </div>
          <div class="qty">
            <button data-dec="${id}" aria-label="Disminuir">−</button>
            <span>${qty}</span>
            <button data-inc="${id}" aria-label="Aumentar">+</button>
          </div>
        </div>
      `;
    }).join("");

    cartItemsEl.querySelectorAll("[data-inc]").forEach(b =>
      b.addEventListener("click", () => changeQty(b.dataset.inc, +1))
    );
    cartItemsEl.querySelectorAll("[data-dec]").forEach(b =>
      b.addEventListener("click", () => changeQty(b.dataset.dec, -1))
    );
  }

  const subtotal = calcSubtotal();
  const delivery = subtotal > 0 ? DELIVERY_FEE : 0;
  const total = subtotal + delivery;

  subtotalText.textContent = money(subtotal);
  deliveryText.textContent = money(delivery);
  totalText.textContent = money(total);

  // WhatsApp link
  whatsBtn.href = buildWhatsAppLink(subtotal, delivery, total);
}

/* ========= WhatsApp ========= */
function buildWhatsAppLink(subtotal, delivery, total) {
  const lines = [];
  lines.push("Hola! Quiero hacer un pedido de helados 🍦");
  lines.push("");
  lines.push("Detalle del pedido:");

  for (const [id, qty] of Object.entries(cart)) {
    const p = PRODUCTS.find(x => x.id === id);
    if (!p) continue;
    lines.push(`- ${qty} x ${p.name} (${money(p.price)} c/u)`);
  }

  lines.push("");
  lines.push(`Subtotal: ${money(subtotal)}`);
  lines.push(`Delivery: ${money(delivery)}`);
  lines.push(`Total: ${money(total)}`);

  const note = (noteInput.value || "").trim();
  if (note) {
    lines.push("");
    lines.push(`Nota: ${note}`);
  }

  lines.push("");
  lines.push("Mi dirección es: ________");
  lines.push("Forma de pago: ________");

  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${8294961480}?text=${text}`;
}

/* ========= Drawer ========= */
function openDrawer(){
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
  backdrop.hidden = false;
}
function closeDrawer(){
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  backdrop.hidden = true;
}

/* ========= Tema ========= */
function loadTheme(){
  const t = localStorage.getItem(THEME_KEY);
  if (t) document.body.setAttribute("data-theme", t);
  themeBtn.textContent = (document.body.getAttribute("data-theme") === "light") ? "🌞" : "🌙";
}
function toggleTheme(){
  const current = document.body.getAttribute("data-theme");
  const next = current === "light" ? "dark" : "light";
  document.body.setAttribute("data-theme", next);
  localStorage.setItem(THEME_KEY, next);
  themeBtn.textContent = next === "light" ? "🌞" : "🌙";
}

/* ========= Filtros ========= */
document.querySelectorAll(".chip").forEach(chip => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    activeFilter = chip.dataset.filter;
    renderProducts();
  });
});

/* ========= Eventos ========= */
searchInput.addEventListener("input", renderProducts);
openCartBtn.addEventListener("click", openDrawer);
closeCartBtn.addEventListener("click", closeDrawer);
backdrop.addEventListener("click", closeDrawer);

clearCartBtn.addEventListener("click", () => {
  clearCart();
});

noteInput.addEventListener("input", () => renderCart());

themeBtn.addEventListener("click", toggleTheme);

addPromoBtn.addEventListener("click", () => {
  // Promo: 2 conos vainilla (ejemplo)
  addToCart("cono_vainilla");
  addToCart("cono_vainilla");
});

/* ========= Init ========= */
loadTheme();
renderProducts();
renderCart();
