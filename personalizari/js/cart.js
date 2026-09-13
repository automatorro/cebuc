/**
 * Coș client-side pe localStorage. Nu există niciun backend — totul e simulat.
 */
const CART_KEY = "atelierprint_cart";

function readCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function writeCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

function addToCart(item) {
  const items = readCart();
  items.push({ id: Date.now() + "-" + Math.random().toString(36).slice(2, 8), ...item });
  writeCart(items);
  return items;
}

function removeFromCart(id) {
  const items = readCart().filter((it) => it.id !== id);
  writeCart(items);
  return items;
}

function clearCart() {
  writeCart([]);
}

function cartTotal(items) {
  return items.reduce((sum, it) => sum + it.price, 0);
}

function formatRON(value) {
  return value.toLocaleString("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " RON";
}

function updateCartBadge() {
  const badge = document.querySelector("[data-cart-count]");
  if (!badge) return;
  const count = readCart().length;
  badge.textContent = String(count);
  badge.hidden = count === 0;
}

document.addEventListener("DOMContentLoaded", updateCartBadge);
