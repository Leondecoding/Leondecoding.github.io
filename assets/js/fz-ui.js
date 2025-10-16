/* === Cart: capture selected option (Size) === */
(function () {
  const $$ = (s,c=document)=>Array.from(c.querySelectorAll(s));
  function getSelectedValue(btn){
    const inputName = btn.dataset.optionInput; // e.g. "size"
    if(!inputName) return '';
    const wrap = btn.closest('.fz-product') || document;
    const picked = wrap.querySelector(`input[name="${inputName}"]:checked`);
    return picked ? picked.value : '';
  }

  $$('.js-add-to-cart').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const storeKey = 'fz_cart';
      const getCart = ()=>{ try { return JSON.parse(localStorage.getItem(storeKey)||'[]'); } catch(e){ return []; } };
      const setCart = (arr)=>localStorage.setItem(storeKey, JSON.stringify(arr));
      const badge = document.getElementById('fz-cart-count');
      const updateBadge = ()=>{ const cnt = getCart().reduce((n,i)=>n+(i.qty||1),0); if(badge){ badge.hidden = cnt<=0; badge.textContent = String(cnt); } };

      const optionName = btn.dataset.optionName || '';
      const optionValue = getSelectedValue(btn);
      const title = btn.dataset.title + (optionValue ? ` - ${optionValue}` : '');
      const sku = (btn.dataset.sku || 'item') + (optionValue ? `-${optionValue}` : '');

      const item = {
        sku, title,
        price: parseFloat(btn.dataset.price||'0'),
        currency: btn.dataset.currency || '',
        image: btn.dataset.image || '',
        qty: 1,
        options: optionValue ? [{ name: optionName || 'Option', value: optionValue }] : []
      };

      const cart = getCart();
      const exist = cart.find(x=>x.sku===item.sku);
      if(exist){ exist.qty=(exist.qty||1)+1; } else { cart.push(item); }
      setCart(cart); updateBadge();
    });
  });
})();
