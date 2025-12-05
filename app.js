
const CURRENCY = "GBP";
const BUSINESS_EMAIL = "your-paypal-email@example.com"; // ← replace with your PayPal email

function qs(s,r=document){return r.querySelector(s)}
function qsa(s,r=document){return Array.from(r.querySelectorAll(s))}
function money(n){return new Intl.NumberFormat('en-GB',{style:'currency',currency:CURRENCY}).format(n)}

const CART_KEY='fz_cart_v1';
function readCart(){try{return JSON.parse(localStorage.getItem(CART_KEY)||"[]")}catch{return[]}}
function writeCart(items){localStorage.setItem(CART_KEY, JSON.stringify(items)); updateCartBadge()}
function addToCart(item){const c=readCart();const f=c.find(x=>x.id===item.id);if(f){f.qty+=item.qty||1}else{c.push({...item,qty:item.qty||1})}writeCart(c);openCart()}
function removeFromCart(id){writeCart(readCart().filter(x=>x.id!==id)); renderCart()}
function updateCartBadge(){const n=readCart().reduce((s,i)=>s+i.qty,0); qs('#cartBtn')?.setAttribute('data-count', n)}
function cartTotal(){return readCart().reduce((s,i)=>s+i.price*i.qty,0)}
function paypalCartUrl(){const c=readCart(); const u=new URL('https://www.paypal.com/cgi-bin/webscr'); u.searchParams.set('cmd','_cart'); u.searchParams.set('upload','1'); u.searchParams.set('business', BUSINESS_EMAIL); u.searchParams.set('currency_code', CURRENCY); c.forEach((it,i)=>{const n=i+1; u.searchParams.set(`item_name_${n}`, it.title); u.searchParams.set(`amount_${n}`, it.price.toFixed(2)); u.searchParams.set(`quantity_${n}`, String(it.qty));}); return u.toString();}

function ensureCartUI(){ if(qs('#cartDrawer')) return; const wrap=document.createElement('div'); wrap.className='drawer'; wrap.id='cartDrawer'; wrap.innerHTML=`
  <div class="mask" data-close></div>
  <div class="panel">
    <header><strong>Cart</strong><button data-close class="icon-btn" aria-label="Close">&times;</button></header>
    <div class="items" id="cartItems"></div>
    <footer>
      <div class="total"><span>Subtotal</span><span id="cartSubtotal">£0.00</span></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <a id="paypalLink" class="btn" target="_blank" rel="noopener">Checkout with PayPal</a>
        <button class="btn link" id="clearCart">Clear</button>
      </div>
    </footer>
  </div>`; document.body.appendChild(wrap);
  wrap.addEventListener('click',(e)=>{if(e.target.hasAttribute('data-close')) closeCart()});
  qs('#clearCart').addEventListener('click',()=>{writeCart([]); renderCart()});
}
function renderCart(){ensureCartUI(); const list=readCart(); const cont=qs('#cartItems'); cont.innerHTML=''; list.forEach(it=>{ const el=document.createElement('div'); el.className='item'; el.innerHTML=`<img src="${it.src}" alt="${it.title}"><div><div class="title">${it.title}</div><div class="meta">Qty ${it.qty} · ${money(it.price)}</div></div><button class="icon-btn" aria-label="Remove">&times;</button>`; el.querySelector('button').onclick=()=>removeFromCart(it.id); cont.appendChild(el); }); qs('#cartSubtotal').textContent=money(cartTotal()); qs('#paypalLink').href=paypalCartUrl(); updateCartBadge(); }
function openCart(){ensureCartUI(); qs('#cartDrawer').setAttribute('open',''); renderCart()}
function closeCart(){qs('#cartDrawer')?.removeAttribute('open')}

document.addEventListener('DOMContentLoaded', () => {
  // 页脚年份
  const y = qs('#year');
  if (y) y.textContent = new Date().getFullYear();

  // 当前导航高亮（沿用你现在的 .nav a 选择器）
  const path = location.pathname.split('/').pop() || 'index.html';
  qsa('.nav a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href.endsWith(path)) {
      a.classList.add('active');
    }
  });

  // 购物车角标
  updateCartBadge();

  // ✅ 保留你原来的第 43 行：给购物车按钮绑事件
  const cartBtn = qs('#cartBtn');
  if (cartBtn) {
    cartBtn.addEventListener('click', openCart);
  }

  // === 移动端导航：汉堡菜单 ===
  const header = qs('.site-header');
  const nav    = qs('.site-header nav, .site-nav, .nav');
  const navBtn = qs('.nav-toggle');

  if (header && nav && navBtn) {
    const closeNav = () => {
      header.classList.remove('nav-open');
      document.body.classList.remove('nav-open');
      navBtn.setAttribute('aria-expanded', 'false');
    };

    navBtn.addEventListener('click', () => {
      const willOpen = !header.classList.contains('nav-open');
      header.classList.toggle('nav-open', willOpen);
      document.body.classList.toggle('nav-open', willOpen);
      navBtn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    });

    // 点菜单里的链接后自动收起
    nav.addEventListener('click', (e) => {
      if (e.target.matches('a')) {
        closeNav();
      }
    });

    // 按 ESC 关闭菜单（可选）
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeNav();
      }
    });
  }
});
