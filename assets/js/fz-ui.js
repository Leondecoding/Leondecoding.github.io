
// 文件：assets/js/fz-ui.js
(function () {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const panels = {
    search: $('#fz-search-panel'),
    loginMenu: $('#fz-login-menu'),
    cart: $('#fz-cart-drawer'),
  };

  const buttons = {
    search: $('#fz-search-btn'),
    login: $('#fz-login-btn'),
    cart: $('#fz-cart-btn'),
  };

  function show(el) { if (el) el.hidden = false; }
  function hide(el) { if (el) el.hidden = true; }

  // 搜索
  buttons.search?.addEventListener('click', () => {
    show(panels.search);
    const input = panels.search?.querySelector('input[type="search"]');
    setTimeout(() => input?.focus(), 0);
  });

  // 登录菜单
  buttons.login?.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = !panels.loginMenu.hidden;
    if (open) {
      hide(panels.loginMenu);
      buttons.login.setAttribute('aria-expanded', 'false');
    } else {
      show(panels.loginMenu);
      buttons.login.setAttribute('aria-expanded', 'true');
    }
  });

  // 购物篮
  buttons.cart?.addEventListener('click', () => show(panels.cart));

  // Backdrop / 关闭按钮
  $$('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-close');
      const t = document.getElementById(id);
      hide(t);
      if (id === 'fz-login-menu') buttons.login?.setAttribute('aria-expanded', 'false');
    });
  });

  // ESC 键关闭
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      [panels.search, panels.cart, panels.loginMenu].forEach(hide);
      buttons.login?.setAttribute('aria-expanded', 'false');
    }
  });

  // 点击空白处收起登录菜单
  document.addEventListener('click', (e) => {
    if (!panels.loginMenu.hidden) {
      const withinMenu = panels.loginMenu.contains(e.target);
      const withinBtn = buttons.login.contains(e.target);
      if (!withinMenu && !withinBtn) {
        hide(panels.loginMenu);
        buttons.login.setAttribute('aria-expanded', 'false');
      }
    }
  });
})();
/* === Add to Cart (minimal, localStorage) === */
(function () {
  const $ = (s, c=document)=>c.querySelector(s);
  const $$ = (s, c=document)=>Array.from(c.querySelectorAll(s));
  const storeKey = 'fz_cart';

  function getCart(){ try { return JSON.parse(localStorage.getItem(storeKey) || '[]'); } catch(e){ return []; } }
  function setCart(arr){ localStorage.setItem(storeKey, JSON.stringify(arr)); updateBadge(); }
  function updateBadge(){
    const count = getCart().reduce((n,i)=>n+(i.qty||1),0);
    const el = $('#fz-cart-count');
    if(!el) return;
    if(count>0){ el.hidden=false; el.textContent=String(count); } else { el.hidden=true; }
  }
  function renderDrawer(){
    const box = $('#fz-cart-content'); if(!box) return;
    const cart = getCart();
    if(cart.length===0){ box.innerHTML = '<p>当前为空（占位）。</p>'; return; }
    box.innerHTML = cart.map(i => `
      <div style="display:flex;gap:10px;align-items:center;margin:8px 0;">
        ${i.image ? `<img src="${i.image}" alt="${i.title}" style="width:56px;height:56px;object-fit:cover;border:1px solid #eee;border-radius:6px;">` : ''}
        <div style="flex:1;">
          <div>${i.title}</div>
          <div style="color:#666;font-size:.9rem;">${i.currency || ''}${i.price} × ${i.qty||1}</div>
        </div>
        <button data-remove="${i.sku}" class="fz-btn" style="padding:.3rem .6rem;">Remove</button>
      </div>
    `).join('');
    $('#fz-cart-content')?.addEventListener('click', (e)=>{
      const btn = e.target.closest('[data-remove]'); if(!btn) return;
      const sku = btn.getAttribute('data-remove');
      const next = getCart().filter(x=>x.sku!==sku); setCart(next); renderDrawer();
    }, {once:true});
  }

  // 绑定“Add to Cart”
  $$('.js-add-to-cart').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const item = {
        sku: btn.dataset.sku, title: btn.dataset.title,
        price: parseFloat(btn.dataset.price||'0'),
        currency: btn.dataset.currency, image: btn.dataset.image, qty: 1
      };
      const cart = getCart();
      const exist = cart.find(x=>x.sku===item.sku);
      if(exist){ exist.qty=(exist.qty||1)+1; } else { cart.push(item); }
      setCart(cart);
    });
  });

  // 打开购物篮时刷新
  $('#fz-cart-btn')?.addEventListener('click', renderDrawer);
  updateBadge();
})();
