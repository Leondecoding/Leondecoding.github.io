/* fz-cart-delegate.js — global delegated handlers that "just work"
   - Keeps your existing layout & fz-ui.js intact
   - Always-on handlers: search/login/cart drawer, Add to Cart, +/−/× inside drawer
   - Legacy cart migration (add uid), de-dupe to avoid double-add, Checkout label EN
*/
(function(){
  const KEY = 'fz_cart';
  const $ = (sel, root) => (root||document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root||document).querySelectorAll(sel));

  // ---------- storage ----------
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch(e){ return []; } };
  const save = (arr) => localStorage.setItem(KEY, JSON.stringify(arr));
  const count = () => load().reduce((n,i)=> n+(i.qty||1), 0);
  function updateBadge(){
    const b = $('#fz-cart-count'); if (!b) return;
    const n = count(); b.textContent = String(n); b.hidden = n<=0;
  }

  // ---------- utils ----------
  const uid = () => 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2,7);
  function fmt(v, code){
    const sym = (code==='GBP')?'£':(code==='USD')?'$':(code==='EUR')?'€':((code==='JPY'||code==='CNY')?'¥':(code==='HKD')?'HK$':(code==='TWD')?'NT$':'');
    const n = (typeof v==='number')? v : parseFloat(v||'0');
    return (sym||'') + (isFinite(n)? n.toFixed(2) : v) + (sym? '' : (code ? (' '+code) : ''));
  }
  function getSelectedValue(btn){
    const name = btn.dataset.optionInput || 'size';
    const w = btn.closest('.fz-product') || document;
    const picked = w.querySelector('input[name="'+name+'"]:checked');
    return picked ? picked.value : '';
  }

  // ---------- migrate legacy items (so old zero-price/untitled can be removed) ----------
  function migrate(){
    const cart = load(); let changed = false;
    for (let i=0;i<cart.length;i++){
      const it = cart[i];
      if (!it.uid) { it.uid = uid(); changed = true; }
      if (typeof it.qty !== 'number' || it.qty < 1) { it.qty = 1; changed = true; }
      const p = (typeof it.price === 'number') ? it.price : parseFloat(it.price);
      it.price = isFinite(p) ? p : 0;
      if (!it.currency) it.currency = 'GBP';
      if (!it.title) it.title = 'Untitled';
      if (typeof it.sku !== 'string') it.sku = '';
      if (!Array.isArray(it.options)) it.options = [];
      if (typeof it.image !== 'string') it.image = '';
    }
    if (changed) save(cart);
  }

  // ---------- cart ops (prefer uid, fallback index) ----------
  function setQtyByUid(id, delta){
    const cart = load(); const i = cart.findIndex(x => x.uid === id);
    if (i<0) return false;
    cart[i].qty = (cart[i].qty||1) + delta;
    if (cart[i].qty <= 0) cart.splice(i,1);
    save(cart); updateBadge(); renderDrawer(); return true;
  }
  function setQtyByIndex(idx, delta){
    const cart = load(); if (idx<0 || idx>=cart.length) return false;
    cart[idx].qty = (cart[idx].qty||1) + delta;
    if (cart[idx].qty <= 0) cart.splice(idx,1);
    save(cart); updateBadge(); renderDrawer(); return true;
  }
  function removeByUid(id){
    const cart = load().filter(x => x.uid !== id);
    save(cart); updateBadge(); renderDrawer();
  }
  function removeByIndex(idx){
    const cart = load(); if (idx<0 || idx>=cart.length) return;
    cart.splice(idx,1); save(cart); updateBadge(); renderDrawer();
  }

  // ---------- add to cart (global de-dupe) ----------
  function shouldProcessAdd(sig){
    const now = Date.now();
    const last = window.__FZ_LAST_ADD__ || { ts:0, sig:'' };
    if (last.sig === sig && (now - last.ts) < 350) return false;
    window.__FZ_LAST_ADD__ = { ts: now, sig: sig };
    return true;
  }
  function addFromButton(btn){
    const optName  = btn.dataset.optionName || 'Option';
    const optVal   = getSelectedValue(btn);
    const baseT    = btn.dataset.title || 'Artwork';
    const title    = baseT + (optVal ? (' - ' + optVal) : '');
    const baseSku  = btn.dataset.sku || 'item';
    const sku      = baseSku + (optVal ? ('-' + optVal) : '');
    const price    = parseFloat(btn.dataset.price || '0');

    const sig = (btn.id || '') + '|' + sku + '|' + JSON.stringify(optVal||'');
    if (!shouldProcessAdd(sig)) return;

    const item = {
      uid: uid(), sku, title,
      price: isFinite(price) ? price : 0,
      currency: btn.dataset.currency || 'GBP',
      image: btn.dataset.image || '',
      qty: 1,
      options: optVal ? [{ name: optName, value: optVal }] : []
    };

    const cart = load();
    const exist = cart.find(x => x.sku === item.sku && JSON.stringify(x.options||[]) === JSON.stringify(item.options||[]));
    if (exist) exist.qty = (exist.qty||1) + 1;
    else cart.push(item);

    save(cart); updateBadge();

    // 小提示
    const old = btn.textContent; btn.disabled = true; btn.textContent = 'Added ✓';
    setTimeout(()=>{ btn.textContent = old; btn.disabled = false; }, 900);
  }

  // ---------- drawer render (editable +/−/×) ----------
  function renderDrawer(){
    const box = $('#fz-cart-content'); if(!box) return;
    const items = load();
    if (!items.length){ box.innerHTML = '<p>Cart is empty.</p>'; return; }

    let total = 0;
    box.innerHTML = items.map((it, idx) => {
      const p = parseFloat(it.price)||0, q = it.qty||1; total += p*q;
      const opt = (it.options && it.options[0]) ? ` <div style="color:#666;font-size:.9em;">(${it.options[0].name}: ${it.options[0].value})</div>` : '';
      const uidSafe = (typeof it.uid === 'string') ? it.uid : '';
      return `
      <div class="fz-cart-row" data-index="${idx}" style="display:grid;grid-template-columns:64px 1fr auto auto;gap:12px;align-items:center;margin-bottom:10px;">
        ${it.image ? `<img src="${it.image}" alt="" style="width:64px;height:64px;object-fit:cover;border:1px solid #eee;">` : `<div style="width:64px;height:64px;background:#f4f4f4"></div>`}
        <div>
          <div style="font-weight:600;line-height:1.2">${it.title || 'Untitled'}</div>
          ${opt}
          <div class="fz-qty" style="display:inline-flex;align-items:center;gap:6px;margin-top:6px;">
            <button type="button" data-action="dec" data-uid="${uidSafe}" data-idx="${idx}" aria-label="Decrease quantity" style="width:26px;height:26px;border:1px solid #ccc;border-radius:4px;">−</button>
            <span aria-live="polite">${q}</span>
            <button type="button" data-action="inc" data-uid="${uidSafe}" data-idx="${idx}" aria-label="Increase quantity" style="width:26px;height:26px;border:1px solid #ccc;border-radius:4px;">+</button>
            <button type="button" data-action="remove" data-uid="${uidSafe}" data-idx="${idx}" aria-label="Remove item" title="Remove" style="margin-left:8px;border:none;background:transparent;font-size:18px;line-height:1;">×</button>
          </div>
        </div>
        <div style="white-space:nowrap;font-weight:600;">${fmt(p, it.currency)}</div>
        <div style="white-space:nowrap;color:#333;">× ${q}</div>
      </div>`;
    }).join('') +
    `<hr style="margin:12px 0;">
     <div style="display:flex;justify-content:space-between;font-weight:700;">
       <span>Total</span><span>${fmt(total, (items[0] && items[0].currency) || 'GBP')}</span>
     </div>`;
  }

  // ---------- GLOBAL delegated clicks (capture) ----------
  function onDocClick(ev){
    const target = ev.target;

    // header: open/close cart/search
    if (target.closest('#fz-cart-btn')) { ev.preventDefault(); renderDrawer(); const d=$('#fz-cart-drawer'); if(d) d.hidden=false; return; }
    if (target.closest('[data-close="fz-cart-drawer"]')) { ev.preventDefault(); const d=$('#fz-cart-drawer'); if(d) d.hidden=true; return; }

    if (target.closest('#fz-search-btn')) { ev.preventDefault(); const p=$('#fz-search-panel'); if(p) p.hidden=false; return; }
    if (target.closest('[data-close="fz-search-panel"]')) { ev.preventDefault(); const p=$('#fz-search-panel'); if(p) p.hidden=true; return; }

    if (target.closest('#fz-login-btn')) {
      ev.preventDefault();
      const m = $('#fz-login-menu'); if (!m) return;
      const open = m.hidden; m.hidden = !open;
      const loginBtn = $('#fz-login-btn'); if (loginBtn) loginBtn.setAttribute('aria-expanded', String(open));
      return;
    }

    // drawer: + / − / ×
    const act = target.closest('#fz-cart-content [data-action]');
    if (act) {
      ev.preventDefault();
      const action = act.dataset.action;
      let id = act.dataset.uid;
      let idx = parseInt(act.dataset.idx,10);
      if (!Number.isInteger(idx)) {
        const row = act.closest('.fz-cart-row'); if (row && row.dataset.index) idx = parseInt(row.dataset.index,10);
      }
      const noUid = !id || id === 'undefined' || id === 'null';
      if (action === 'inc') { if (!(noUid ? setQtyByIndex(idx,+1) : setQtyByUid(id,+1))) setQtyByIndex(idx,+1); }
      else if (action === 'dec') { if (!(noUid ? setQtyByIndex(idx,-1) : setQtyByUid(id,-1))) setQtyByIndex(idx,-1); }
      else if (action === 'remove') { if (noUid) removeByIndex(idx); else removeByUid(id); }
      return;
    }

    // product: Add to Cart（全局去重）
    const addBtn = target.closest('.js-add-to-cart');
if (addBtn) {
  ev.preventDefault();
  ev.stopPropagation();   // ← 加这一行，阻止冒泡重复触发
  const now = Date.now();
  if (addBtn._lock && (now - addBtn._lock) < 280) return;
  addBtn._lock = now;
  addFromButton(addBtn);
  return;
}

  }

  // ---------- boot ----------
  document.addEventListener('DOMContentLoaded', function(){
    // 安全迁移旧条目，并刷新徽标/结算文案
    migrate(); updateBadge();
    const ck = $('#fz-cart-drawer .fz-drawer__footer a'); if (ck) ck.textContent = 'Checkout';

    // 全局捕获事件：无论别的脚本如何，这里都能接住
    document.addEventListener('click', onDocClick, true);
  });
})();
