
// --- State & Utils ---
const state = {
  lang: localStorage.getItem("lang") || "zh",
  socials: {
    youtube: "https://youtube.com/",
    instagram: "https://instagram.com/"
  },
  data: {},
  currentRoute: location.hash || "#/home",
  sessionUser: JSON.parse(localStorage.getItem("sessionUser") || "null")
};

async function loadJSON(path){ const res = await fetch(path); return res.json(); }
function $(sel, root=document){ return root.querySelector(sel); }
function h(tag, attrs={}, ...children){
  const el = document.createElement(tag);
  for(const [k,v] of Object.entries(attrs||{})){
    if(k.startsWith("on") && typeof v === "function"){ el.addEventListener(k.slice(2).toLowerCase(), v); }
    else if(k === "html"){ el.innerHTML = v; }
    else { el.setAttribute(k, v); }
  }
  for(const c of children){ if(c==null) continue; el.append(typeof c==="string"?document.createTextNode(c):c); }
  return el;
}
function t(key){
  const parts = key.split(".");
  let cur = state.translations[state.lang];
  for(const p of parts){ cur = (cur||{})[p]; }
  return cur || key;
}
function setLang(lang){
  state.lang = lang;
  localStorage.setItem("lang", lang);
  renderNav();
  renderRoute();
  $("#brandName").textContent = t("brandName");
  $("#tagline").textContent = t("tagline");
  $("#followLabel").textContent = t("footer.follow");
  $("#ytLink").textContent = t("footer.youtube");
  $("#igLink").textContent = t("footer.instagram");
}

// --- Routing ---
const routes = {
  "#/home": renderHome,
  "#/our-story": renderStory,
  "#/blog": renderBlog,
  "#/original-art": () => renderGallery("original_art"),
  "#/art-print": () => renderShop("prints"),
  "#/greeting-card": () => renderShop("cards"),
  "#/contact": renderContact,
  "#/login": renderLogin
};

window.addEventListener("hashchange", () => {
  state.currentRoute = location.hash || "#/home";
  renderRoute();
});

function renderRoute(){
  const fn = routes[state.currentRoute] || renderHome;
  fn();
}

// --- Nav ---
function renderNav(){
  const nav = $("#nav");
  nav.innerHTML = "";
  const items = [
    ["#/home", t("nav.home")],
    ["#/our-story", t("nav.ourStory")],
    ["#/blog", t("nav.blog")],
    ["#/original-art", t("nav.originalArt")],
    ["#/art-print", t("nav.artPrint")],
    ["#/greeting-card", t("nav.greetingCard")],
    ["#/contact", t("nav.contact")],
  ];
  for(const [href,label] of items){
    const a = h("a", {href, class: location.hash===href ? "active": ""}, label);
    nav.append(a);
  }
  // Language toggle
  const langBtn = h("button", {id:"langBtn", onclick: ()=> setLang(state.lang==="en"?"zh":"en")}, t("nav.language"));
  nav.append(langBtn);
  // Login link
  const loginLink = h("a", {href:"#/login", class: location.hash==="#/login" ? "active": ""}, t("nav.login"));
  nav.append(loginLink);
}

// --- Views ---
async function renderHome(){
  const view = $("#view");
  view.innerHTML = "";
  const wrap = h("section", {},
    h("h1", {}, t("home.title")),
    h("p", {class:"muted"}, t("home.subtitle")),
    h("div", {class:"hero"}, h("img", {src:"assets/ph-10.svg", alt:"Hero"})),
    h("div", {class:"grid", style:"margin-top:20px"},
      ...[..."123456"].map((_,i)=> h("div",{class:"card"},
        h("img",{src:`assets/ph-${i+1}.svg`, alt:""}),
        h("div",{class:"pad"}, h("h3",{}, `Series ${i+1}`), h("p",{class:"muted"},"..."))
      ))
    )
  );
  view.append(wrap);
}

async function renderStory(){
  const view = $("#view"); view.innerHTML = "";
  const wrap = h("section", {},
    h("h1",{}, t("story.title")),
    h("div", {class:"container-text"}, 
      h("p",{}, t("story.body"))
    ),
    h("div", {class:"newsletter", style:"margin-top:24px"},
      h("h3",{}, t("story.newsletterTitle")),
      h("p",{class:"muted"}, t("story.newsletterHint")),
      (function(){
        const form = h("div",{class:"row"},
          h("input",{type:"email", id:"newsEmail", placeholder:t("story.emailPlaceholder"), style:"padding:10px 12px;border:1px solid var(--border);border-radius:12px;"}),
          h("button",{onclick:()=>{
            const email = $("#newsEmail").value.trim();
            if(!/^\S+@\S+\.\S+$/.test(email)){ alert("Please enter a valid email."); return; }
            const list = JSON.parse(localStorage.getItem("newsletter")||"[]");
            list.push({email, ts: Date.now()});
            localStorage.setItem("newsletter", JSON.stringify(list));
            alert("Subscribed!");
          }}, t("story.subscribe"))
        );
        return form;
      })()
    )
  );
  view.append(wrap);
}

async function renderBlog(){
  const view = $("#view"); view.innerHTML="";
  const posts = state.data.blog || [];
  const wrap = h("section", {},
    h("h1",{}, t("blog.title")),
  );
  if(!posts.length){
    wrap.append(h("p",{class:"muted"}, t("blog.empty")));
  }else{
    const grid = h("div",{class:"grid"});
    for(const p of posts){
      const title = state.lang==="en"?p.title_en:p.title_zh;
      const excerpt = state.lang==="en"?p.excerpt_en:p.excerpt_zh;
      const card = h("article",{class:"card"},
        h("img",{src:p.cover, alt:title}),
        h("div",{class:"pad"},
          h("h3",{}, title),
          h("p",{class:"muted"}, new Date(p.date).toLocaleDateString()),
          h("p",{}, excerpt),
          p.video_url ? embedVideoPreview(p.video_url) : null
        )
      );
      grid.append(card);
    }
    wrap.append(grid);
  }
  view.append(wrap);
}

function embedVideoPreview(url){
  // Simple YouTube/Vimeo embed
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([A-Za-z0-9_\-]+)/);
  if(yt){
    return h("div",{style:"margin-top:8px;aspect-ratio:16/9;"},
      h("iframe", {width:"100%", height:"100%", src:`https://www.youtube.com/embed/${yt[1]}`, title:"Video preview", frameborder:"0", allow:"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture", allowfullscreen:"true"})
    );
  }
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if(vm){
    return h("div",{style:"margin-top:8px;aspect-ratio:16/9;"},
      h("iframe",{width:"100%", height:"100%", src:`https://player.vimeo.com/video/${vm[1]}`, frameborder:"0", allow:"autoplay; fullscreen; picture-in-picture", allowfullscreen:"true"})
    );
  }
  return h("a",{href:url,target:"_blank",rel:"noopener"}, url);
}

async function renderGallery(kind){
  const view = $("#view"); view.innerHTML="";
  const items = state.data.original_art || [];
  const wrap = h("section", {}, h("h1",{}, t("nav.originalArt")));
  const grid = h("div",{class:"gallery"});
  items.forEach((it, idx)=>{
    const el = h("div",{class:"thumb", onclick:()=> openLightbox(items, idx)},
      h("img",{src:it.image, alt: it.title_en})
    );
    grid.append(el);
  });
  wrap.append(grid);
  view.append(wrap);
}

function openLightbox(items, index){
  const lb = h("div",{class:"lightbox", onclick:(e)=>{ if(e.target===lb) lb.remove(); }});
  const inner = h("div",{class:"lb-inner"});
  const imgWrap = h("div",{class:"lb-img"});
  const caption = h("div",{class:"lb-caption"});
  const closeBtn = h("button",{class:"lb-close", onclick:()=>lb.remove()}, "✕");
  const prevBtn = h("button",{class:"lb-prev", onclick:()=> go(-1)}, t("gallery.prev"));
  const nextBtn = h("button",{class:"lb-next", onclick:()=> go(1)}, t("gallery.next"));

  function update(){
    const it = items[index];
    imgWrap.innerHTML = "";
    imgWrap.append(h("img",{src: it.image, alt: it.title_en}));
    caption.textContent = (state.lang==="en"?it.title_en:it.title_zh) + " – " + (state.lang==="en"?it.description_en:it.description_zh);
  }
  function go(dir){
    index = (index + dir + items.length) % items.length;
    update();
  }
  document.addEventListener("keydown", onKey);
  function onKey(e){ if(e.key==="Escape"){ lb.remove(); document.removeEventListener("keydown", onKey); }
                     if(e.key==="ArrowLeft") go(-1);
                     if(e.key==="ArrowRight") go(1); }
  lb.append(inner);
  inner.append(imgWrap, caption, closeBtn, prevBtn, nextBtn);
  document.body.append(lb);
  update();
}

async function renderShop(kind){
  const view = $("#view"); view.innerHTML="";
  const items = state.data[kind] || [];
  const titleKey = kind==="prints" ? "nav.artPrint" : "nav.greetingCard";
  const wrap = h("section", {}, h("h1",{}, t(titleKey)));
  const grid = h("div",{class:"gallery"});
  items.forEach((it)=>{
    const el = h("div",{class:"thumb", onclick:()=> openProduct(it, items)},
      h("img",{src:it.image, alt: it.title_en})
    );
    grid.append(el);
  });
  wrap.append(grid);
  view.append(wrap);
}

function openProduct(item, items){
  const modal = h("div",{class:"lightbox", onclick:(e)=>{ if(e.target===modal) modal.remove(); }});
  const inner = h("div",{class:"lb-inner", style:"max-width: min(96vw, 1100px)"});
  const panel = h("div",{class:"product-panel"});
  const title = state.lang==="en"?item.title_en:item.title_zh;
  const desc = state.lang==="en"?item.description_en:item.description_zh;
  panel.append(
    h("div",{class:"image"}, h("img",{src:item.image, alt:title})),
    h("div",{class:"info"},
      h("h2",{}, title),
      h("p",{style:"margin:8px 0"}, desc),
      h("div",{class:"row"},
        h("label",{}, t("product.size")+":"),
        (function(){
          const sel = h("select",{id:"sizeSel"});
          for(const s of item.sizes||[]){ sel.append(h("option",{value:s}, s)); }
          return sel;
        })()
      ),
      h("div",{class:"row"},
        h("button",{class:"buy", onclick:()=>{
          const size = $("#sizeSel").value;
          const link = (item.paypalLinks||{})[size];
          if(!link){ alert("Missing PayPal link for size: "+size); return; }
          window.open(link, "_blank", "noopener");
        }}, t("product.buy"))
      ),
      h("div",{class:"row muted"}, t("product.info"))
    )
  );
  // Prev/Next arrows
  const idx = items.findIndex(x=>x.id===item.id);
  const prevBtn = h("button",{class:"lb-prev", onclick:()=>{ modal.remove(); openProduct(items[(idx-1+items.length)%items.length], items); }}, t("gallery.prev"));
  const nextBtn = h("button",{class:"lb-next", onclick:()=>{ modal.remove(); openProduct(items[(idx+1)%items.length], items); }}, t("gallery.next"));
  const closeBtn = h("button",{class:"lb-close", onclick:()=> modal.remove()}, "✕");
  inner.append(panel, closeBtn, prevBtn, nextBtn);
  modal.append(inner);
  document.body.append(modal);
}

function renderContact(){
  const view = $("#view"); view.innerHTML = "";
  const wrap = h("section", {},
    h("h1",{}, t("contact.title")),
    h("p",{}, t("contact.body")+" "),
    h("p",{}, h("a",{href:"mailto:hello@example.com"}, t("contact.sendEmail")))
  );
  view.append(wrap);
}

function renderLogin(){
  const view = $("#view"); view.innerHTML="";
  const wrap = h("section", {},
    h("h1",{}, t("auth.title")),
    (function(){
      if(state.sessionUser){
        return h("div",{},
          h("p",{}, "Hello, "+state.sessionUser.email),
          h("button",{onclick:()=>{
            localStorage.removeItem("sessionUser");
            state.sessionUser = null; renderLogin();
          }}, t("auth.logout")),
          h("p",{class:"muted", style:"margin-top:8px"}, t("auth.note"))
        );
      }
      const email = h("input",{type:"email", placeholder:t("auth.email"), id:"authEmail", style:"padding:10px;border:1px solid var(--border);border-radius:12px;margin-right:8px"});
      const pass = h("input",{type:"password", placeholder:t("auth.password"), id:"authPass", style:"padding:10px;border:1px solid var(--border);border-radius:12px;margin-right:8px"});
      const loginBtn = h("button",{onclick:()=> auth("login")}, t("auth.login"));
      const signupBtn = h("button",{onclick:()=> auth("signup")}, t("auth.signup"));
      const row = h("div",{class:"row"}, email, pass, loginBtn, signupBtn);
      const msg = h("div",{id:"authMsg", class:"muted", style:"margin-top:8px"}, t("auth.note"));
      function auth(kind){
        const e = email.value.trim(), p = pass.value;
        if(!/^\S+@\S+\.\S+$/.test(e) || p.length<4){ msg.textContent = "Invalid email or password"; msg.className="error"; return; }
        const users = JSON.parse(localStorage.getItem("users")||"{}");
        if(kind==="signup"){
          if(users[e]){ msg.textContent = "User exists"; msg.className="error"; return; }
          users[e] = {email:e, hash: btoa(p)};
          localStorage.setItem("users", JSON.stringify(users));
          msg.textContent = "Account created. You can log in now."; msg.className="success";
        }else{
          if(!users[e] || users[e].hash !== btoa(p)){ msg.textContent = "Wrong email or password"; msg.className="error"; return; }
          localStorage.setItem("sessionUser", JSON.stringify({email:e}));
          state.sessionUser = {email:e};
          renderLogin();
        }
      }
      return h("div",{}, row, msg);
    })()
  );
  view.append(wrap);
}

// --- Boot ---
(async function(){
  // Load translations & data
  state.translations = await loadJSON("data/translations.json");
  state.data.blog = await loadJSON("data/blog.json");
  state.data.original_art = await loadJSON("data/original_art.json");
  state.data.prints = await loadJSON("data/prints.json");
  state.data.cards = await loadJSON("data/cards.json");

  // Apply socials
  $("#ytLink").href = state.socials.youtube;
  $("#igLink").href = state.socials.instagram;

  setLang(state.lang);
  renderNav();
  renderRoute();
})();
