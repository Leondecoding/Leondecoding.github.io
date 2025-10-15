
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
