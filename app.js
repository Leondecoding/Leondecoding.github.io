// ---- Data loader with fallback to /data/*.json ----
const defaultI18n = {
  en: {
    navWorks: "Works",
    navProducts: "Products",
    navAbout: "About",
    navVideos: "Videos",
    ttSearch: "Search",
    ttAccount: "Account",
    ttCart: "Cart",
    headline: "Selected Works",
    filterAll: "All",
    filterOriginal: "Original",
    filterArtPrint: "Art Print",
    filterGreeting: "Greeting Card",
    searchPlaceholder: "Search by title…",
    btnClose: "Close",
  },
  zh: {
    navWorks: "作品",
    navProducts: "产品",
    navAbout: "关于我",
    navVideos: "视频",
    ttSearch: "搜索",
    ttAccount: "账户",
    ttCart: "购物车",
    headline: "精选作品",
    filterAll: "全部",
    filterOriginal: "原作",
    filterArtPrint: "艺术微喷",
    filterGreeting: "贺卡",
    searchPlaceholder: "按标题搜索…",
    btnClose: "关闭",
  }
};

const defaultWorks = [];
for (let i=1;i<=12;i++){
  const id = String(i).padStart(2,'0');
  const catIdx = (i-1)%3;
  const cat = ["Original","Art Print","Greeting Card"][catIdx];
  const zhCat = ["原作","艺术微喷","贺卡"][catIdx];
  defaultWorks.push({
    id,
    category: cat,
    title_en: `${cat} #${id}`,
    title_zh: `${zhCat} #${id}`,
    src: `./assets/images/work-${id}.png`,
  });
}

let I18N = defaultI18n;
let WORKS = defaultWorks;

async function loadJSON(path){
  try{
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) throw new Error(res.statusText);
    return await res.json();
  }catch(e){
    console.warn("Failed to load", path, e);
    return null;
  }
}

async function bootstrap(){
  // Try to load external data; fall back silently
  const i18n = await loadJSON("./data/i18n.json");
  const works = await loadJSON("./data/works.json");
  if (i18n) I18N = i18n;
  if (Array.isArray(works)) WORKS = works;

  init(); // continue with app once data is ready
}

// ---- App state & helpers ----
const state = {
  lang: "en",
  filter: "all",
  query: "",
  visible: [],
  cursor: 0,
};

const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

function t(key){ return I18N[state.lang]?.[key] ?? key; }

function applyI18n(){
  $$("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    el.textContent = t(key);
  });
  $$("[data-i18n-title]").forEach(el => {
    const key = el.getAttribute("data-i18n-title");
    el.title = t(key);
  });
  const input = $("#searchInput");
  if (input) input.placeholder = t("searchPlaceholder");
  document.documentElement.lang = state.lang === "zh" ? "zh-Hans" : "en";
}

function renderGrid(){
  const grid = $("#grid");
  grid.innerHTML = "";
  const q = state.query.trim().toLowerCase();
  const filtered = WORKS.filter(w => {
    const matchFilter = (state.filter === "all") ? true : w.category === state.filter;
    const text = (state.lang === "en" ? w.title_en : w.title_zh).toLowerCase();
    const matchQuery = q ? text.includes(q) : true;
    return matchFilter && matchQuery;
  });
  state.visible = filtered;
  filtered.forEach((w, idx) => {
    const card = document.createElement("article");
    card.className = "card";
    card.setAttribute("tabindex","0");
    card.innerHTML = `
      <div class="card-media">
        <img src="${w.src}" alt="${(state.lang==='en'?w.title_en:w.title_zh)}" loading="lazy" />
        <div class="card-badge">${state.lang==='en'?w.category:(w.category==='Original'?'原作':(w.category==='Art Print'?'艺术微喷':'贺卡'))}</div>
      </div>
      <div class="card-body">
        <h3 class="card-title">${state.lang==='en'?w.title_en:w.title_zh}</h3>
        <p class="card-sub">${state.lang==='en'?'FZ Studio':'FZ 工作室'}</p>
      </div>
    `;
    const open = () => openLightbox(idx);
    card.querySelector("img").addEventListener("click", open);
    card.addEventListener("keydown", (e)=>{ if (e.key==="Enter") open(); });
    grid.appendChild(card);
  });
}

function setFilter(value){
  state.filter = value;
  $$(".chip[data-filter]").forEach(btn => btn.classList.toggle("is-active", btn.getAttribute("data-filter")===value));
  renderGrid();
}

function openLightbox(index){
  state.cursor = index;
  const item = state.visible[state.cursor];
  if (!item) return;
  $("#lightboxImg").src = item.src;
  $("#lightboxCaption").textContent = state.lang==='en'?item.title_en:item.title_zh;
  $("#lightbox").hidden = false;
  document.body.style.overflow = "hidden";
}

function moveLightbox(step){
  if (!state.visible.length) return;
  state.cursor = (state.cursor + step + state.visible.length) % state.visible.length;
  openLightbox(state.cursor);
}

function closeLightbox(){
  $("#lightbox").hidden = true;
  document.body.style.overflow = "";
}

function init(){
  $("#year").textContent = new Date().getFullYear();
  applyI18n();

  $$(".chip[data-filter]").forEach(btn => {
    btn.addEventListener("click", () => setFilter(btn.getAttribute("data-filter")));
  });

  $("#langToggle").addEventListener("click", () => {
    state.lang = (state.lang === "en") ? "zh" : "en";
    applyI18n();
    renderGrid();
  });

  $("#searchBtn").addEventListener("click", () => { $("#searchOverlay").hidden = false; $("#searchInput").focus(); });
  $("#searchClose").addEventListener("click", () => { $("#searchOverlay").hidden = true; state.query=""; $("#searchInput").value=""; renderGrid(); });
  $("#searchOverlay").addEventListener("click", (e) => { if (e.target.id === "searchOverlay") { $("#searchClose").click(); }});
  $("#searchInput").addEventListener("input", (e) => { state.query = e.target.value; renderGrid(); });

  $(".lightbox-close").addEventListener("click", closeLightbox);
  $(".lightbox-nav.prev").addEventListener("click", () => moveLightbox(-1));
  $(".lightbox-nav.next").addEventListener("click", () => moveLightbox(1));
  document.addEventListener("keydown", (e) => {
    const lb = $("#lightbox");
    if (lb.hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") moveLightbox(-1);
    if (e.key === "ArrowRight") moveLightbox(1);
  });

  setFilter("all");
}

document.addEventListener("DOMContentLoaded", bootstrap);
