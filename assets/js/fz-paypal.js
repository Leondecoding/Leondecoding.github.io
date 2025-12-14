/* fz-paypal.js — Minimal PayPal Smart Buttons glue for localStorage cart (GBP)
   - Loads PayPal SDK on demand
   - Builds order from localStorage('fz_cart')
   - On approve: capture, clear cart, show success
   - No shipping / no tax (amount = items sum)
*/
(function(){
  const KEY = 'fz_cart';
  const $ = (s, r=document)=> (r||document).querySelector(s);

  // ---------- read cart ----------
  function loadCart(){
    try{ return JSON.parse(localStorage.getItem(KEY)||'[]'); }catch(e){ return []; }
  }
  function pennies(n){ // avoid float drift
    const v = (typeof n==='number') ? n : parseFloat(n||'0');
    return Math.round((isFinite(v)? v:0) * 100);
  }
  function money(p){ return (p/100).toFixed(2); }

  // ---------- SDK loader ----------
  function ensureSdk(cfg, cb){
    if (window.paypal) { cb(); return; }
    if (!cfg || !cfg.clientId || cfg.clientId.indexOf('YOUR-')===0){
      const hint = $('#fz-paypal-hint'); if (hint) hint.textContent = 'PayPal 未配置：请在 _config.yml 设置 paypal_client_id（Sandbox）。';
      return;
    }
    const exists = document.querySelector('script[data-fz="paypal-sdk"]');
    if (exists){ exists.addEventListener('load', cb); return; }
    const qs = new URLSearchParams({
      'client-id': cfg.clientId,
      currency: (cfg.currency||'GBP').toUpperCase(),
      intent: (cfg.intent||'CAPTURE').toUpperCase(),
      components: 'buttons'
    }).toString();
    const s = document.createElement('script');
    s.src = 'https://www.paypal.com/sdk/js?' + qs;
    s.async = true;
    s.defer = true;
    s.dataset.fz = 'paypal-sdk';
    s.addEventListener('load', cb);
    document.head.appendChild(s);
  }

  // ---------- buttons render ----------
  function renderButtons(whereSel){
    const mount = $(whereSel || '#fz-paypal-buttons');
    if (!mount) return;

    // clear previous (avoid "already rendered" errors)
    mount.innerHTML = '';

     // Make PayPal button look like a normal CTA (same width feel as Add to Cart)
mount.style.width = '100%';
mount.style.maxWidth = '260px';
mount.style.margin = '0 auto';
     
    const cfg = (window.FZ_PAYPAL||{});
    ensureSdk(cfg, () => {
      if (!window.paypal) return;
      const cart = loadCart();
      const currency = (cfg.currency || 'GBP').toUpperCase();

      // If empty, give a gentle hint but still render (PayPal will validate at createOrder time)
      const hint = $('#fz-paypal-hint');
      if (hint) {
        hint.textContent = cart.length ? '' : 'Your cart is empty.';
      }

      window.paypal.Buttons({
         
        style: {
  layout: 'vertical',
  shape: 'pill',
  color: 'silver',   // 灰色（最接近你要的 Add to Cart 灰底）
  label: 'paypal',
  height: 46,
  tagline: false
},

        onInit: function(data, actions){
          if (!cart.length) actions.disable();
          // Observe cart changes (optional): re-enable/disable based on emptiness
          const obs = new MutationObserver(()=> {
            const items = loadCart();
            if (items.length) actions.enable(); else actions.disable();
          });
          const content = $('#fz-cart-content'); if (content) obs.observe(content, { childList:true, subtree:true });
        },
        createOrder: function(data, actions){
          const items = loadCart();
          if (!items.length) return actions.reject();

          // sanitize & sum
          let totalP = 0;
          const ppItems = items.map(it => {
            const p = Math.max(0, pennies(it.price));
            const q = Math.max(1, parseInt(it.qty||1,10));
            totalP += p*q;
            const nm = String(it.title||'Item').slice(0,127);
            return {
              name: nm,
              sku: (it.sku||'').slice(0,127),
              unit_amount: { currency_code: currency, value: money(p) },
              quantity: String(q)
            };
          });

          return actions.order.create({
            intent: (cfg.intent||'CAPTURE').toUpperCase(),
            purchase_units: [{
              amount: {
                currency_code: currency,
                value: money(totalP),
                breakdown: { item_total: { currency_code: currency, value: money(totalP) } }
              },
              items: ppItems
            }],
            application_context: {
              shipping_preference: 'NO_SHIPPING',
              brand_name: 'FZ Studio',
              user_action: 'PAY_NOW'
            }
          });
        },
        onApprove: async function(data, actions){
          try{
            const details = await actions.order.capture();
            // clear cart
            localStorage.setItem(KEY, '[]');
            // badge (if exists)
            const badge = document.querySelector('#fz-cart-count');
            if (badge) { badge.textContent = '0'; badge.hidden = true; }
            // success UI
            const box = $('#fz-cart-content');
            if (box) {
              const tx = (details && details.id) ? `Transaction: ${details.id}` : 'Payment completed.';
              box.innerHTML = `<div style="padding:12px 0;">
                <h3 style="margin:0 0 6px 0;">Thank you! 🎉</h3>
                <p style="margin:0 0 6px 0;">Your payment was successful.</p>
                <p style="color:#666;margin:0;">${tx}</p>
              </div>`;
            }
            const btns = $('#fz-paypal-buttons'); if (btns) btns.innerHTML = '';
            const hint = $('#fz-paypal-hint'); if (hint) hint.textContent = '';
          }catch(e){
            console.error(e);
            const hint = $('#fz-paypal-hint'); if (hint) hint.textContent = 'Payment failed. Please try again.';
          }
        },
        onCancel: function(){ const h=$('#fz-paypal-hint'); if(h) h.textContent='Payment cancelled.'; },
        onError: function(err){ console.error(err); const h=$('#fz-paypal-hint'); if(h) h.textContent='PayPal error. Please retry.'; }
      }).render(mount);
    });
  }

  // ---------- when to render ----------
  function boot(){
    // 1) Drawer opened → render
    document.addEventListener('click', function(ev){
      const btn = ev.target.closest('#fz-cart-btn');
      if (btn) {
        // render a tick after drawer opens
        setTimeout(()=>renderButtons('#fz-paypal-buttons'), 60);
      }
    }, true);

    // 2) If checkout page present, render on load
    if (document.querySelector('.fz-checkout-page #fz-paypal-buttons')){
      renderButtons('.fz-checkout-page #fz-paypal-buttons');
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
