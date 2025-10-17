/* fz-ui.js — cart with + / - / remove, and English "Checkout" */
(function () {
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const $  = (s, c = document) => c.querySelector(s);

  // ===== Storage helpers =====
  const STORE_KEY = 'fz_cart';
  const loadCart  = () => { try { return JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); } catch(e){ return []; } };
  const saveCart  = (arr) => localStorage.setItem(STORE_KEY, JSON.stringify(arr));
  const cartCount = () => loadCart().reduce((n,i)=>n + (i.qty || 1), 0);

  function updateBadge() {
    const badge = $('#fz-cart-count');
    if (!badge) return;
    const n = cartCount();
    badge.textContent = String(n);
    badge.hidden = n <= 0;
  }

  // ===== Currency format =====
  function formatCurrency(v, code) {
    const sym = (code==='GBP')?'£':(code==='USD')?'$':(code==='EUR')?'€'
              :((code==='JPY'||code==='CNY')?'¥':(code==='HKD')?'HK$':(code==='TWD')?'NT$':'');
    const n = (typeof v === 'number') ? v : parseFloat(v || '0');
    return (sym || '') + (isFinite(n) ? n.toFixed(2) : v) + (sym ? '' : (code ? (' ' + code) : ''));
  }

  // ===== Cart operations =====
  function setQty(sku, delta) {
    const cart = loadCart();
    const i = cart.findIndex(x => x.sku === sku);
    if (i < 0) return;
    cart[i].qty = (cart[i].qty || 1) + delta;
    if (cart[i].qty <= 0) cart.splice(i, 1);           // 变 0 则移除
    saveCart(cart);
    updateBadge();
    renderCartDrawer();
  }

  function removeItem(sku) {
    const cart = loadCart().filter(x => x.sku !== sku);
    saveCart(cart);
    updateBadge();
    renderCartDrawer();
  }

  function addToCartFromButton(btn) {
    const optionName  = btn.dataset.optionName || 'Option';
    const optionValue = getSelectedValue(btn);
    const title = (btn.dataset.title || 'Artwork') + (optionValue ? (' - ' + optionValue) : '');
    const sku   = (btn.dataset.sku   || 'item')    + (optionValue ? ('-' + optionValue) : '');

    const item = {
      sku,
      title,
      price: parseFloat(btn.dataset.price || '0'),
      currency: btn.dataset.currency || 'GBP',
      image: btn.dataset.image || '',
      qty: 1,
      options: optionValue ? [{ name: optionName, value: optionValue }] : []
    };

    const cart = loadCart();
    const exist = cart.find(x => x.sku === item.sku);
    if (exist) exist.qty = (exist.qty || 1) + 1;
    else cart.push(item);
    saveCart(cart);
    updateBadge();

    // 小提示
    const old = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Added ✓';
    setTimeout(() => { btn.textContent = old; btn.disabled = false; }, 900);
  }

  function getSelectedValue(btn){
    const inputName = btn.dataset.optionInput || 'size';
    const wrap = btn.closest('.fz-product') || document;
    const picked = wrap.querySelector('input[name="'+inputName+'"]:checked');
    return picked ? picked.value : '';
  }

  // ===== Drawer rendering =====
  function renderCartDrawer() {
    const box = $('#fz-cart-content');
    if (!box) return;
    const items = loadCart();
    if (!items.length) {
      box.innerHTML = '<p>Cart is empty.</p>';
      return;
    }

    let total = 0;
    box.innerHTML = items.map(it => {
      const p = parseFloat(it.price) || 0;
      const q = it.qty || 1;
      total += p * q;
      const opt = (it.options && it.options[0]) ? ` <div style="color:#666;font-size:.9em;">(${it.options[0].name}: ${it.options[0].value})</div>` : '';
      return `
      <div class="fz-cart-row" style="display:grid;grid-template-columns:64px 1fr auto auto;gap:12px;align-items:center;margin-bottom:10px;">
        ${it.image ? `<img src="${it.image}" alt="" style="width:64px;height:64px;object-fit:cover;border:1px solid #eee;">`
                    : `<div style="width:64px;height:64px;background:#f4f4f4"></div>`}
        <div>
          <div style="font-weight:600;line-height:1.2">${it.title || 'Untitled'}</div>
          ${opt}
          <div class="fz-qty" style="display:inline-flex;align-items:center;gap:6px;margin-top:6px;">
            <button data-action="dec" data-sku="${it.sku}" aria-label="Decrease quantity" style="width:26px;height:26px;border:1px solid #ccc;border-radius:4px;">−</button>
            <span aria-live="polite">${q}</span>
            <button data-action="inc" data-sku="${it.sku}" aria-label="Increase quantity" style="width:26px;height:26px;border:1px solid #ccc;border-radius:4px;">+</button>
            <button data-action="remove" data-sku="${it.sku}" aria-label="Remove item" title="Remove" style="margin-left:8px;border:none;background:transparent;font-size:18px;line-height:1;">×</button>
          </div>
        </div>
        <div style="white-space:nowrap;font-weight:600;">${formatCurrency(p, it.currency)}</div>
        <div style="white-space:nowrap;color:#333;">× ${q}</div>
      </div>`;
    }).join('') +
    `<hr style="margin:12px 0;">
     <div style="display:flex;justify-content:space-between;font-weight:700;">
       <span>Total</span><span>${formatCurrency(total, (items[0] && items[0].currency) || 'GBP')}</span>
     </div>`;

    // 委托监听：+ / − / remove
    box.onclick = (ev) => {
      const btn = ev.target.closest('[data-action]');
      if (!btn) return;
      const sku = btn.dataset.sku;
      const action = btn.dataset.action;
      if (action === 'inc') setQty(sku, +1);
      else if (action === 'dec') setQty(sku, -1);
      else if (action === 'remove') removeItem(sku);
    };
  }

  // ===== Header interactivity =====
  function openEl(id){ const el = $('#'+id); if (el) el.hidden = false; }
  function closeEl(id){ const el = $('#'+id); if (el) el.hidden = true; }

  // ===== Boot =====
  document.addEventListener('DOMContentLoaded', () => {
    // 统一把结算按钮文本设为英文
    const checkoutBtn = $('#fz-cart-drawer .fz-drawer__footer a');
    if (checkoutBtn) checkoutBtn.textContent = 'Checkout';

    // 绑定 "Add to cart"（跟随 data-*）
    $$('.js-add-to-cart').forEach(btn => {
      btn.addEventListener('click', () => addToCartFromButton(btn));
      btn._fzWired = true;
    });

    // 搜索 / 登录 / 购物车开关
    const searchBtn = $('#fz-search-btn');
    if (searchBtn) searchBtn.addEventListener('click', () => openEl('fz-search-panel'));
    $$('#fz-search-panel [data-close="fz-search-panel"]').forEach(el => el.addEventListener('click', () => closeEl('fz-search-panel')));

    const loginBtn  = $('#fz-login-btn');
    const loginMenu = $('#fz-login-menu');
    if (loginBtn && loginMenu) {
      loginBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = loginMenu.hidden;
        loginMenu.hidden = !open;
        loginBtn.setAttribute('aria-expanded', String(open));
      });
      document.addEventListener('click', (e) => {
        if (!loginMenu.hidden && !loginMenu.contains(e.target) && e.target !== loginBtn) {
          loginMenu.hidden = true;
          loginBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }

    const cartBtn   = $('#fz-cart-btn');
    if (cartBtn) cartBtn.addEventListener('click', () => { renderCartDrawer(); openEl('fz-cart-drawer'); });
    $$('#fz-cart-drawer [data-close="fz-cart-drawer"]').forEach(el => el.addEventListener('click', () => closeEl('fz-cart-drawer')));

    updateBadge();
  });
})();
