/* fz-ui.js — Editable cart (+/−/×), legacy migration with uid, single add binding + global de-dupe, Checkout (EN) */
(function () {
  const $$ = (s, c = document) => Array.from((c || document).querySelectorAll(s));
  const $  = (s, c = document) => (c || document).querySelector(s);

  // ===== Storage =====
  const KEY = 'fz_cart';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch(e){ return []; } };
  const save = (arr) => localStorage.setItem(KEY, JSON.stringify(arr));
  const count = () => load().reduce((n,i)=>n+(i.qty||1),0);
  function updateBadge(){ const b=$('#fz-cart-count'); if(!b) return; const n=count(); b.textContent=String(n); b.hidden=n<=0; }

  // ===== Utils =====
  const uid = () => 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2,7);
  function fmt(v, code){
    const sym = (code==='GBP')?'£':(code==='USD')?'$':(code==='EUR')?'€':((code==='JPY'||code==='CNY')?'¥':(code==='HKD')?'HK$':(code==='TWD')?'NT$':''));
    const n = (typeof v==='number')? v : parseFloat(v||'0'); return (sym||'') + (isFinite(n)? n.toFixed(2) : v) + (sym? '' : (code? (' '+code):''));
  }
  function getSelectedValue(btn){
    const name = btn.dataset.optionInput || 'size';
    const wrap = btn.closest('.fz-product') || document;
    const picked = wrap.querySelector('input[name="'+name+'"]:checked');
    return picked ? picked.value : '';
  }

  // ===== Legacy migration: make old items removable/editable =====
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

  // ===== Cart ops (prefer uid; fallback index) =====
  function setQtyByUid(_uid, delta){
    const cart = load(); const i = cart.findIndex(x => x.uid === _uid);
    if (i<0) return false; cart[i].qty = (cart[i].qty||1)+delta; if (cart[i].qty<=0) cart.splice(i,1);
    save(cart); updateBadge(); renderDrawer(); return true;
  }
  function setQtyByIndex(idx, delta){
    const cart = load(); if (idx<0 || idx>=cart.length) return false;
    cart[idx].qty = (cart[idx].qty||1)+delta; if (cart[idx].qty<=0) cart.splice(idx,1);
    save(cart); updateBadge(); renderDrawer(); return true;
  }
  function removeByUid(_uid){ const cart=load().filter(x=>x.uid!==_uid); save(cart); updateBadge(); renderDrawer(); }
  function removeByIndex(idx){ const cart=load(); if(idx<0||idx>=cart.length) return; cart.splice(idx,1); save(cart); updateBadge(); renderDrawer(); }

  // ===== Global de-dupe guard for add-to-cart =====
  // 防止同一点击被多个监听重复处理（旧兜底脚本或冒泡导致）
  function shouldProcessAdd(sig){
    const now = Date.now();
    const last = window.__FZ_LAST_ADD__ || { ts:0, sig:'' };
    if (last.sig === sig && (now - last.ts) < 350) return false; // 350ms 内相同签名只处理一次
    window.__FZ_LAST_ADD__ = { ts: now, sig: sig };
    return true;
  }

  // ===== Add to cart =====
  function addFromButton(btn){
    const optionName  = btn.dataset.optionName || 'Option';
    const optionValue = getSelectedValue(btn);
    const baseTitle   = btn.dataset.title || 'Artwork';
    const builtTitle  = baseTitle + (optionValue ? (' - ' + optionValue) : '');
    const baseSku     = btn.dataset.sku || 'item';
    const builtSku    = baseSku + (optionValue ? ('-' + optionValue) : '');
    const price       = parseFloat(btn.dataset.price || '0');

    // 事件签名（同一按钮 / 同一 SKU / 同一选项）
    const sig = (btn.id || '') + '|' + builtSku + '|' + JSON.stringify(optionValue||'');
    if (!shouldProcessAdd(sig)) return; // 去重：另一处监听已处理

    const item = {
      uid: uid(), sku: builtSku, title: builtTitle,
      price: isFinite(price) ? price : 0,
      currency: btn.dataset.currency || 'GBP',
      image: btn.dataset.image || '', qty: 1,
      options: optionValue ? [{ name: optionName, value: optionValue }] : []
    };

    const cart = load();
    const exist = cart.find(x => x.sku === item.sku && JSON.stringify(x.options||[])===JSON.stringify(item.options||[]));
    if (exist) exist.qty = (exist.qty||1) + 1; else cart.push(item);
    save(cart); updateBadge();

    // 小提示
    const old = btn.textContent; btn.disabled = true; btn.textContent = 'Added ✓';
    setTimeout(()=>{ btn.textContent = old; btn.disabled = false; }, 900);
  }

  // ===== Drawer (editable: + / − / ×) =====
  function renderDrawer(){
    const box = $('#fz-cart-content'); if(!box) return;
    const items = load();
    if (!items.length){ box.innerHTML = '<p>Cart is empty.</p>'; return; }

    let total = 0;
    box.innerHTML = items.map((it, idx) => {
      const p = parseFloat(it.price)||0, q = it.qty||1; total += p*q;
      const opt = (it.options && it.options[0]) ? ` <div style="color:#666;font-size:.9em;">(${it.options[0].name}: ${it.options[0].value})</div>` : '';
      const safeUid = (typeof it.uid === 'string') ? it.uid : '';
      return `
      <div class="fz-cart-row" style="display:grid;grid-template-columns:64px 1fr auto auto;gap:12px;align-items:center;margin-bottom:10px;">
        ${it.image ? `<img src="${it.image}" alt="" style="width:64px;height:64px;object-fit:cover;border:1px solid #eee;">` : `<div style="width:64px;height:64px;background:#f4f4f4"></div>`}
        <div>
          <div style="font-weight:600;line-height:1.2">${it.title || 'Untitled'}</div>
          ${opt}
          <div class="fz-qty" style="display:inline-flex;align-items:center;gap:6px;margin-top:6px;">
            <button data-action="dec" data-uid="${safeUid}" data-idx="${idx}" aria-label="Decrease quantity" style="width:26px;height:26px;border:1px solid #ccc;border-radius:4px;">−</button>
            <span aria-live="polite">${q}</span>
            <button data-action="inc" data-uid="${safeUid}" data-idx="${idx}" aria-label="Increase quantity" style="width:26px;height:26px;border:1px solid #ccc;border-radius:4px;">+</button>
            <button data-action="remove" data-uid="${safeUid}" data-idx="${idx}" aria-label="Remove item" title="Remove" style="margin-left:8px;border:none;background:transparent;font-size:18px;line-height:1;">×</button>
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

    box.onclick = (ev) => {
      const btn = ev.target.closest('[data-action]'); if (!btn) return;
      const action = btn.dataset.action, id = btn.dataset.uid, idx = parseInt(btn.dataset.idx,10);
      const noUid = !id || id === 'undefined' || id === 'null';
      if (action === 'inc') { if (!(noUid ? setQtyByIndex(idx,+1) : setQtyByUid(id,+1))) setQtyByIndex(idx,+1); }
      else if (action === 'dec') { if (!(noUid ? setQtyByIndex(idx,-1) : setQtyByUid(id,-1))) setQtyByIndex(idx,-1); }
      else if (action === 'remove') { if (noUid) removeByIndex(idx); else removeByUid(id); }
    };
  }

  // ===== Header toggles =====
  function openEl(id){ const el=$('#'+id); if(el) el.hidden=false; }
  function closeEl(id){ const el=$('#'+id); if(el) el.hidden=true; }

  // ===== Bind add buttons: clone-rebind to purge duplicate listeners =====
  function rebindAddButtons(){
    $$('.js-add-to-cart').forEach(orig => {
      // 克隆替换：去掉此前任何地方绑定的监听
      const btn = orig.cloneNode(true);
      orig.replaceWith(btn);
      // 我们自己的监听 + 轻节流（在全局防重之外）
      if (!btn._fzWired){
        btn.addEventListener('click', () => {
          const now = Date.now();
          if (btn._lock && (now - btn._lock) < 280) return;
          btn._lock = now;
          addFromButton(btn);
        });
        btn._fzWired = true;
      }
    });
  }

  // ===== Boot =====
  document.addEventListener('DOMContentLoaded', () => {
    migrate();

    const checkoutBtn = $('#fz-cart-drawer .fz-drawer__footer a');
    if (checkoutBtn) checkoutBtn.textContent = 'Checkout';

    // 先绑定一次，再延迟 0 与 200ms 再“克隆重绑”，彻底清理其他脚本重复绑定
    rebindAddButtons();
    setTimeout(rebindAddButtons, 0);
    setTimeout(rebindAddButtons, 200);

    // 搜索 / 登录 / 购物车
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

    const cartBtn = $('#fz-cart-btn');
    if (cartBtn) cartBtn.addEventListener('click', () => { renderDrawer(); openEl('fz-cart-drawer'); });

    $$('#fz-cart-drawer [data-close="fz-cart-drawer"]').forEach(el => el.addEventListener('click', () => closeEl('fz-cart-drawer')));

    updateBadge();
  });
})();
