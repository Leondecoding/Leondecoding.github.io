/* fz-cart-delegate.js — FZ Studio cart (localStorage) + editable drawer
   - Single source of truth: localStorage 'fz_cart'
   - Cart badge updates automatically
   - Drawer rows include + / − / × controls (delegated events)
   - Uses capture-phase listeners + stopPropagation() to prevent other scripts from overriding the drawer rendering
*/
(function(){
  if (window.__FZ_CART_WIRED__) return; // guard against double-load
  window.__FZ_CART_WIRED__ = true;

  // ---------- tiny helpers ----------
  const KEY = 'fz_cart';
  const $ = (s, r=document)=> (r||document).querySelector(s);
  const $all = (s, r=document)=> Array.from((r||document).querySelectorAll(s));

  function load(){ try{ return JSON.parse(localStorage.getItem(KEY)||'[]'); }catch(e){ return []; } }
  function save(a){ localStorage.setItem(KEY, JSON.stringify(a||[])); }
  function uid(){ return 'u' + Math.random().toString(36).slice(2) + Date.now().toString(36); }
  function fmt(v, cc){
    const n = parseFloat(v||0); const ok = isFinite(n) ? n : 0;
    const c = (cc||'GBP').toUpperCase();
    const sym = c==='GBP'?'£':c==='USD'?'$':c==='EUR'?'€':'';
    return (sym || (c+' ')) + ok.toFixed(2);
  }

  // read selected option value from a button's context (for product pages)
  function getSelectedValue(btn){
    const name = btn.dataset.optionInput || 'size';
    const root = btn.closest('.fz-product') || document;
    const el = root.querySelector(`input[name="${name}"]:checked`);
    return el ? el.value : '';
  }

  // ---------- badge ----------
  function updateBadge(){
    const b = $('#fz-cart-count'); if (!b) return;
    const n = load().reduce((m,i)=> m + Math.max(1, parseInt(i.qty||1,10)), 0);
    b.textContent = String(n); b.hidden = n<=0;
  }

  // ---------- cart ops (prefer uid, fallback index) ----------
  function setQtyByUid(id, delta){
    const cart = load(); const i = cart.findIndex(x => x.uid === id);
    if (i<0) return false;
    cart[i].qty = Math.max(0, (cart[i].qty||1) + delta);
    if (cart[i].qty <= 0) cart.splice(i,1);
    save(cart); updateBadge(); renderDrawer(); return true;
  }
  function setQtyByIndex(idx, delta){
    const cart = load(); if (idx<0 || idx>=cart.length) return false;
    cart[idx].qty = Math.max(0, (cart[idx].qty||1) + delta);
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

  // ===== Add to cart（轻量去重 & 防“一次加两件”） =====
  function shouldProcessAdd(sig){
    const now = Date.now();
    const last = window.__FZ_LAST_ADD__ || { ts:0, sig:'' };
    if (last.sig === sig && (now - last.ts) < 350) return false;
    window.__FZ_LAST_ADD__ = { ts: now, sig: sig };
    return true;
  }
  function addFromButton(btn){
    const optionName  = btn.dataset.optionName || 'Option';
    const optionValue = getSelectedValue(btn);
    const baseTitle   = btn.dataset.title || 'Artwork';
    const builtTitle  = baseTitle + (optionValue ? (' - ' + optionValue) : '');
    const baseSku     = btn.dataset.sku || 'item';
    const builtSku    = baseSku + (optionValue ? ('-' + optionValue) : '');
    const price       = parseFloat(btn.dataset.price || '0');

    const sig = (btn.id || '') + '|' + builtSku + '|' + JSON.stringify(optionValue||'');
    if (!shouldProcessAdd(sig)) return;

    const item = {
      uid: uid(),
      sku: builtSku,
      title: builtTitle,
      price: isFinite(price) ? price : 0,
      currency: (btn.dataset.currency || 'GBP').toUpperCase(),
      image: btn.dataset.image || '',
      qty: 1,
      options: optionValue ? [{ name: optionName, value: optionValue }] : []
    };

    const cart = load();
    const exist = cart.find(x => x.sku === item.sku && JSON.stringify(x.options||[]) === JSON.stringify(item.options||[]));
    if (exist) exist.qty = (exist.qty||1) + 1; else cart.push(item);

    // <<< 关键：立即重绘，确保出现 + / − / × >>>
    save(cart); updateBadge(); renderDrawer();

    // 小提示
    const old = btn.textContent; btn.disabled = true; btn.textContent = 'Added ✓';
    setTimeout(()=>{ btn.textContent = old; btn.disabled = false; }, 900);
  }

  // ===== Drawer 渲染（行上带 data-index，按钮上带 data-uid & data-idx） =====
  function renderDrawer(){
    const box = $('#fz-cart-content'); if(!box) return;
    const items = load();
    if (!items.length){ box.innerHTML = '<p>Cart is empty.</p>'; return; }

    let total = 0;
    box.innerHTML = items.map((it, idx) => {
      const p = parseFloat(it.price)||0, q = it.qty||1; total += p*q;
      const opt = (it.options && it.options[0])
        ? ` <div style="color:#666;font-size:.9em;">(${it.options[0].name}: ${it.options[0].value})</div>` : '';
      const uidSafe = (typeof it.uid === 'string') ? it.uid : '';

      return `
      <div class="fz-cart-row" data-index="${idx}" style="display:grid;grid-template-columns:64px 1fr auto auto;gap:12px;align-items:center;margin-bottom:10px;">
        ${it.image ? `<img src="${it.image}" alt="" style="width:64px;height:64px;object-fit:cover;border:1px solid #eee;">`
                    : `<div style="width:64px;height:64px;background:#f4f4f4"></div>`}
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

    // header: open/close cart/search — 先阻止其它脚本干预
    if (target.closest('#fz-cart-btn')) {
      ev.preventDefault();
      ev.stopPropagation();        // 关键：防止其它脚本在冒泡阶段重画抽屉
      renderDrawer();
      const d = $('#fz-cart-drawer'); if (d) d.hidden = false;
      return;
    }
    if (target.closest('[data-close="fz-cart-drawer"]')) {
      ev.preventDefault();
      ev.stopPropagation();
      const d = $('#fz-cart-drawer'); if (d) d.hidden = true;
      return;
    }

    if (target.closest('#fz-search-btn')) { ev.preventDefault(); ev.stopPropagation(); const p=$('#fz-search-panel'); if(p) p.hidden=false; return; }
    if (target.closest('[data-close="fz-search-panel"]')) { ev.preventDefault(); ev.stopPropagation(); const p=$('#fz-search-panel'); if(p) p.hidden=true; return; }

    if (target.closest('#fz-login-btn')) {
      ev.preventDefault(); ev.stopPropagation();
      const m = $('#fz-login-menu'); if (!m) return;
      const open = m.hidden; m.hidden = !open;
      const loginBtn = $('#fz-login-btn'); if (loginBtn) loginBtn.setAttribute('aria-expanded', String(open));
      return;
    }

    // drawer: + / − / ×
    const act = target.closest('#fz-cart-content [data-action]');
    if (act) {
      ev.preventDefault();
      ev.stopPropagation(); // 关键：防止其它脚本也尝试处理这个点击
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

    // product page: Add to Cart
    const addBtn = target.closest('.js-add-to-cart');
    if (addBtn) {
      ev.preventDefault();
      ev.stopPropagation(); // 关键：防止其它监听器重复处理或覆盖渲染
      // 轻量 "double-click" 锁
      const now = Date.now();
      if (addBtn._lock && (now - addBtn._lock) < 280) return;
      addBtn._lock = now;
      addFromButton(addBtn);
      return;
    }
  }

  // capture-phase 绑定，保证先于其它脚本执行
  document.addEventListener('click', onDocClick, true);

  // ---------- boot ----------
  function ready(fn){ if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',fn);} else {fn();} }
  ready(() => { updateBadge(); /* 可选：若抽屉一开始已打开，可渲染一次 */ });
})();
