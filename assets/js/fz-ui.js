/* fz-ui.js — clean build-safe version (no Liquid inside) */
(function () {
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const $  = (s, c = document) => c.querySelector(s);

  // ========== CART STORAGE ==========
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

  function getSelectedValue(btn){
    const inputName = btn.dataset.optionInput; // e.g. "size"
    if(!inputName) return '';
    const wrap = btn.closest('.fz-product') || document;
    const picked = wrap.querySelector('input[name="'+inputName+'"]:checked');
    return picked ? picked.value : '';
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

  // ========== HEADER INTERACTIONS ==========
  function openEl(id){ const el = $('#'+id); if (el) el.hidden = false; }
  function closeEl(id){ const el = $('#'+id); if (el) el.hidden = true; }

  function renderCartDrawer() {
    const box = $('#fz-cart-content');
    if (!box) return;
    const items = loadCart();
    if (!items.length) {
      box.innerHTML = '<p>当前为空。</p>';
      return;
    }
    let total = 0;
    const html = items.map(it => {
      const p = parseFloat(it.price)||0, q = it.qty||1;
      total += p*q;
      const opt = (it.options && it.options[0]) ? ` <span style="color:#666;font-size:.9em;">(${it.options[0].name}: ${it.options[0].value})</span>` : '';
      return `
      <div style="display:grid;grid-template-columns:64px 1fr auto;gap:12px;align-items:center;">
        ${it.image ? `<img src="${it.image}" alt="" style="width:64px;height:64px;object-fit:cover;border:1px solid #eee;">` : `<div style="width:64px;height:64px;background:#f4f4f4"></div>`}
        <div><div style="font-weight:600;">${it.title}</div>${opt}</div>
        <div style="font-weight:600;">${formatCurrency(p, it.currency)} × ${q}</div>
      </div>`;
    }).join('');
    box.innerHTML = html + `<hr style="margin:12px 0;">
      <div style="display:flex;justify-content:space-between;font-weight:700;">
        <span>Total</span><span>${formatCurrency(total, (items[0] && items[0].currency) || 'GBP')}</span>
      </div>`;
  }

  function formatCurrency(v, code) {
    const sym = (code==='GBP')?'£':(code==='USD')?'$':(code==='EUR')?'€':((code==='JPY'||code==='CNY')?'¥':(code==='HKD')?'HK$':(code==='TWD')?'NT$':''));
    const n = (typeof v === 'number') ? v : parseFloat(v || '0');
    return (sym || '') + (isFinite(n) ? n.toFixed(2) : v) + (sym ? '' : (' ' + (code || '')));
  }

  // ========== BOOT ==========
  document.addEventListener('DOMContentLoaded', () => {
    // Add to cart
    $$('.js-add-to-cart').forEach(btn => {
      btn.addEventListener('click', () => addToCartFromButton(btn));
      btn._fzWired = true;
    });

    // 搜索面板
    const searchBtn = $('#fz-search-btn');
    if (searchBtn) searchBtn.addEventListener('click', () => openEl('fz-search-panel'));
    $$('#fz-search-panel [data-close="fz-search-panel"]').forEach(el => el.addEventListener('click', () => closeEl('fz-search-panel')));

    // 登录菜单
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

    // 购物车抽屉
    const cartBtn   = $('#fz-cart-btn');
    if (cartBtn) cartBtn.addEventListener('click', () => { renderCartDrawer(); openEl('fz-cart-drawer'); });
    $$('#fz-cart-drawer [data-close="fz-cart-drawer"]').forEach(el => el.addEventListener('click', () => closeEl('fz-cart-drawer')));

    updateBadge();
  });
})();
