(() => {
  const params = new URLSearchParams(location.search);
  const DEBUG = params.has('debugNav') || localStorage.getItem('debugNav') === '1';
  const log = (...args) => DEBUG && console.log('[fz-nav]', ...args);
  const warn = (...args) => console.warn('[fz-nav]', ...args);

  const qs = (s, r = document) => r.querySelector(s);

  function setHeaderHeightVar() {
    const header = qs('.site-header');
    if (!header) return 0;
    const h = Math.round(header.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--fz-header-h', `${h}px`);
    return h;
  }

  function initNav() {
    const headerH = setHeaderHeightVar();

    const nav = qs('#fz-site-nav') || qs('.site-header .site-nav');
    const btn = qs('#fz-nav-toggle') || qs('.site-header .nav-toggle');

    log('init', { headerH, navFound: !!nav, btnFound: !!btn });

    if (!nav || !btn) {
      warn('missing elements', { nav, btn });
      return;
    }

    const setOpen = (open) => {
      nav.classList.toggle('is-open', open);
      document.body.classList.toggle('nav-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      nav.setAttribute('aria-hidden', open ? 'false' : 'true');
      log('state', { open, navClass: nav.className, bodyClass: document.body.className });
    };

    // 初始状态
    nav.setAttribute('aria-hidden', 'true');

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const willOpen = !nav.classList.contains('is-open');
      setOpen(willOpen);
    });

    // 点菜单项关闭
    nav.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (a) setOpen(false);
    });

    // ESC 关闭
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setOpen(false);
    });

    // 点击 nav 外部关闭（可选但很实用）
    document.addEventListener('click', (e) => {
      if (!nav.classList.contains('is-open')) return;
      if (nav.contains(e.target) || btn.contains(e.target)) return;
      setOpen(false);
    });

    // resize：更新 header 高度，并在回到桌面宽度时收起
    window.addEventListener('resize', () => {
      setHeaderHeightVar();
      if (window.innerWidth > 900) setOpen(false);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNav);
  } else {
    initNav();
  }
})();
