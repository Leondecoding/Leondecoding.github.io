const state={lang:localStorage.getItem("lang")||"en",socials:{youtube:"https://youtube.com/",instagram:"https://instagram.com/"},data:{},currentRoute:location.hash||"#/home"};
async function loadJSON(p){const r=await fetch(p);return r.json();}
function $(s,root=document){return root.querySelector(s);}
function h(t,a={},...c){const e=document.createElement(t);for(const[k,v]of Object.entries(a||{})){if(k.startsWith("on")&&typeof v==="function")e.addEventListener(k.slice(2).toLowerCase(),v);else if(k==="html")e.innerHTML=v;else e.setAttribute(k,v);}for(const x of c){if(x==null)continue;e.append(typeof x==="string"?document.createTextNode(x):x);}return e;}
const routes={"#/home":renderHome,"#/our-story":renderStory,"#/blog":renderBlog,"#/original-art":()=>renderGallery(),"#/art-print":()=>renderShop("prints"),"#/greeting-card":()=>renderShop("cards"),"#/contact":renderContact,"#/login":renderLogin};
window.addEventListener("hashchange",()=>{state.currentRoute=location.hash||"#/home";renderRoute();});
function renderRoute(){(routes[state.currentRoute]||renderHome)();}
async function boot(){state.translations=await loadJSON("data/translations.json");state.data.original_art=await loadJSON("data/original_art.json");state.data.prints=await loadJSON("data/prints.json");state.data.cards=await loadJSON("data/cards.json");state.data.blog=await loadJSON("data/blog.json");$("#ytLink").href=state.socials.youtube;$("#igLink").href=state.socials.instagram;renderNav();renderRoute();}
function renderNav(){const t=state.translations[state.lang].nav;const nav=$("#nav");nav.innerHTML="";[["#/home",t.home],["#/our-story",t.ourStory],["#/blog",t.blog],["#/original-art",t.originalArt],["#/art-print",t.artPrint],["#/greeting-card",t.greetingCard],["#/contact",t.contact]].forEach(([href,label])=>nav.append(h("a",{href,class:location.hash===href?"active":""},label)));nav.append(h("button",{onclick:()=>{state.lang=state.lang==="en"?"zh":"en";localStorage.setItem("lang",state.lang);renderNav();renderRoute();}},state.translations[state.lang].nav.language));nav.append(h("a",{href:"#/login",class:location.hash==="#/login"?"active":""}, state.translations[state.lang].nav.login||"Login"));}
async function renderHome(){const v=$("#view");v.innerHTML="";v.append(h("section",{},h("div",{class:"hero"},h("img",{src:"assets/ph-10.svg",alt:"Hero"}))))}

async function renderStory(){
  const v=$("#view"); v.innerHTML="";
  const section=h("section",{});
  section.innerHTML=`
    <div class="prose">
      <p>Hi, we are FZ Studio, an architectural designer and an artist, currently based in London, UK.
      We enjoy creating art by meditating and experimenting through drawing, painting, photographing and crafting.
      We love nature and wildlife. In our spare time, hiking always refreshes our mind for creativity.</p>
      <p>We also post arts and stories related to nature and life via our
        <a href="\${state.socials.youtube}" target="_blank" rel="noopener">YouTube</a>
        and
        <a href="\${state.socials.instagram}" target="_blank" rel="noopener">Instagram</a>.</p>
      <p>Currently we are introducing our first collection of watercolour greeting cards and art prints.
      We believe watercolour captures the atmosphere of nature and its unpredictability makes it suitable for intuitive creation.</p>
    </div>
    <div class="newsletter">
      <h2>NEW RELEASES & MORE</h2>
      <p class="desc">Sign up with your email address to receive updates for new art releases, ideas from our craft and much more.</p>
      <form id="newsletterForm">
        <input type="text" name="firstName" placeholder="First Name" required />
        <input type="text" name="lastName" placeholder="Last Name" required />
        <input type="email" name="email" placeholder="Email Address" required />
      </form>
      <div class="signup-row"><a href="#" id="signupLink" class="signup-link">SIGN UP</a></div>
      <small>100% spam-free. Unsubscribe at any time. We respect your privacy.</small>
    </div>`;
  v.append(section);
  const form=section.querySelector("#newsletterForm");
  section.querySelector("#signupLink").addEventListener("click",(e)=>{
    e.preventDefault();
    const data=Object.fromEntries(new FormData(form).entries());
    if(!data.email){alert("Please enter your email.");return;}
    const list=JSON.parse(localStorage.getItem("newsletter")||"[]");
    list.push({...data,ts:Date.now()});
    localStorage.setItem("newsletter",JSON.stringify(list));
    form.remove();
    section.querySelector(".signup-row").outerHTML='<p class="desc">Thank you! You\'re on the list.</p>';
  });
}
async function
 renderBlog(){const v=$("#view");v.innerHTML="";const wrap=h("section",{}),grid=h("div",{class:"gallery"});(state.data.blog||[]).forEach(p=>grid.append(h("figure",{class:"thumb"},h("img",{src:p.cover,alt:""}),h("figcaption",{class:"caption"}, "Post"))));wrap.append(grid);v.append(wrap)}
async function renderGallery(){const v=$("#view");v.innerHTML="";const wrap=h("section",{},h("h1",{},"Original Art"));const grid=h("div",{class:"gallery"});const items=state.data.original_art||[];items.forEach((it,idx)=>grid.append(h("figure",{class:"thumb",onclick:()=>openLightbox(items,idx)},h("img",{src:it.image,alt:it.title_en}),h("figcaption",{class:"caption"}, it.title_en || (kind==="prints"?"name of painting":(kind==="original"?"name of painting":"name of card"))))));wrap.append(grid);v.append(wrap)}
function openLightbox(items,index){const lb=h("div",{class:"lightbox",onclick:(e)=>{if(e.target===lb){lb.remove();document.removeEventListener('keydown',onKey);}}});const inner=h("div",{class:"lb-inner"}),imgWrap=h("div",{class:"lb-img"}),cap=h("div",{class:"lb-caption"});const close=h("button",{class:"lb-close",onclick:()=>{lb.remove();document.removeEventListener('keydown',onKey);}},"✕");const prev=h("button",{class:"lb-prev",onclick:()=>go(-1)},"‹");const next=h("button",{class:"lb-next",onclick:()=>go(1)},"›");function update(){const it=items[index];imgWrap.innerHTML="";imgWrap.append(h("img",{src:it.image,alt:it.title_en}));cap.textContent=it.title_en;}function go(d){index=(index+d+items.length)%items.length;update();}function onKey(e){if(e.key==="Escape"){lb.remove();document.removeEventListener('keydown',onKey);}if(e.key==="ArrowLeft")go(-1);if(e.key==="ArrowRight")go(1);}document.addEventListener("keydown",onKey);inner.append(imgWrap,cap,close,prev,next);lb.append(inner);document.body.append(lb);update();}
async function renderShop(kind){const v=$("#view");v.innerHTML="";const title= kind==="prints" ? "Art Prints" : "Greeting Cards";const wrap=h("section",{},h("h1",{},title));const grid=h("div",{class:"gallery"});const items= state.data[kind] || [];items.forEach((it,idx)=>grid.append(h("figure",{class:"thumb",onclick:()=>openProduct(kind,items,idx)},h("img",{src:it.image,alt:it.title_en}),h("figcaption",{class:"caption"}, it.title_en || (kind==="prints"?"name of painting":(kind==="original"?"name of painting":"name of card"))))));wrap.append(grid);v.append(wrap)}
function openProduct(kind,items,index){const item=items[index];const modal=h("div",{class:"lightbox",onclick:(e)=>{if(e.target===modal){modal.remove();document.removeEventListener('keydown',onKey);}}});const inner=h("div",{class:"lb-inner",style:"max-width:min(96vw,1200px)"});const panel=h("div",{class:"product-panel"});const title=item.title_en;panel.append(h("div",{class:"image"},h("img",{src:item.image,alt:title})),h("div",{class:"info"},h("h2",{},title),h("p",{style:"margin:8px 0;text-align:center"}, item.description_en||""),h("div",{class:"row"},h("label",{},"Size:"),(function(){const sel=h("select",{id:"sizeSel",onchange:()=>updatePrice()});for(const s of item.sizes||[]) sel.append(h("option",{value:s},s));return sel;})()),h("div",{class:"row"},h("strong",{},"Price: "),h("span",{id:"pPrice"},"")),h("div",{class:"row"},h("strong",{},"Product Info: "),h("span",{id:"pInfo"}, item.info_en||"")),h("div",{class:"row"},h("button",{class:"buy",onclick:()=>{const size=document.getElementById('sizeSel').value;const link=(item.paypalLinks||{})[size]; if(!link){alert('Missing PayPal link for '+size);return;} window.open(link,'_blank','noopener');}},"Buy via PayPal"))));const close=h("button",{class:"lb-close",onclick:()=>{modal.remove();document.removeEventListener('keydown',onKey);}},"✕");const prev=h("button",{class:"lb-prev",onclick:()=>go(-1)},"‹");const next=h("button",{class:"lb-next",onclick:()=>go(1)},"›");function updatePrice(){const size=document.getElementById('sizeSel').value;const price=(item.prices||{})[size]||"";const p=document.getElementById('pPrice'); if(p) p.textContent=price;}function go(d){index=(index+d+items.length)%items.length; modal.remove(); openProduct(kind,items,index);}function onKey(e){if(e.key==='Escape'){modal.remove();document.removeEventListener('keydown',onKey);} if(e.key==='ArrowLeft') go(-1); if(e.key==='ArrowRight') go(1);}document.addEventListener('keydown',onKey);inner.append(panel,close,prev,next);modal.append(inner);document.body.append(modal);setTimeout(updatePrice,0);}
function renderContact(){const v=$("#view");v.innerHTML="";v.append(h("section",{},h("h1",{},"Contact"),h("p",{style:"text-align:center"},"For commissions or questions, email us:"),h("p",{style:"text-align:center"},h("a",{href:"mailto:hello@example.com"},"Send Email"))))}
function renderLogin(){const v=$("#view");v.innerHTML="";v.append(h("section",{},h("h1",{},"Login / Sign up")))} boot();

/* === v9: override openProduct with left/right navigation === */
(function(){
  const Q = (s,el=document)=>el.querySelector(s);
  window.openProduct = function(kind, items, index){
    const item = items[index];
    const lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.style.position='fixed'; lb.style.inset='0'; lb.style.background='rgba(255,255,255,0.98)';
    lb.style.zIndex='9999'; lb.style.overflow='auto';
    const wrap = document.createElement('div');
    wrap.style.maxWidth='1040px'; wrap.style.margin='40px auto'; wrap.style.padding='0 16px';
    function render(){
      wrap.innerHTML='';
      const title = document.createElement('h2'); title.textContent = item.title_en || 'name of painting';
      title.style.margin='0 0 12px'; title.style.fontWeight='300'; title.style.color='#999';
      const row = document.createElement('div'); row.style.display='grid'; row.style.gridTemplateColumns='1fr 1fr'; row.style.gap='20px';
      const fig = document.createElement('figure'); fig.style.margin='0';
      const img = document.createElement('img'); img.src=item.image; img.style.width='100%'; img.style.display='block';
      fig.appendChild(img);
      const info = document.createElement('div');
      const sizeLabel = document.createElement('div'); sizeLabel.innerHTML = '<strong>Size:</strong> ' + (item.size_text || 'TBD');
      const price = document.createElement('div'); price.innerHTML = '<strong>Price:</strong> ' + (item.price_text || 'TBD');
      const btnRow = document.createElement('div'); btnRow.style.marginTop='12px';
      const pay = document.createElement('a'); pay.textContent='Buy via PayPal'; pay.target='_blank'; pay.rel='noopener';
      pay.href = item.paypal || item.paypal_url || '#';
      pay.style.border='1px solid #ddd'; pay.style.padding='8px 12px'; pay.style.textDecoration='none'; pay.style.color='#333';
      btnRow.appendChild(pay);
      info.append(sizeLabel, price, btnRow);
      row.append(fig, info);
      wrap.append(title, row);
    }
    function nav(dir){
      let i = index + dir;
      if(i<0) i = items.length-1;
      if(i>=items.length) i = 0;
      index = i;
      Object.assign(item, items[index]);
      render();
    }
    const prev = document.createElement('button'); prev.textContent='‹'; prev.style.position='fixed'; prev.style.left='12px'; prev.style.top='50%'; prev.style.transform='translateY(-50%)'; prev.style.fontSize='28px'; prev.style.border='0'; prev.style.background='transparent'; prev.style.cursor='pointer';
    const next = document.createElement('button'); next.textContent='›'; next.style.position='fixed'; next.style.right='12px'; next.style.top='50%'; next.style.transform='translateY(-50%)'; next.style.fontSize='28px'; next.style.border='0'; next.style.background='transparent'; next.style.cursor='pointer';
    const close = document.createElement('button'); close.textContent='×'; close.style.position='fixed'; close.style.right='12px'; close.style.top='8px'; close.style.fontSize='28px'; close.style.border='0'; close.style.background='transparent'; close.style.cursor='pointer';
    prev.addEventListener('click', ()=>nav(-1)); next.addEventListener('click', ()=>nav(1)); close.addEventListener('click', ()=>lb.remove());
    lb.append(wrap, prev, next, close);
    document.body.appendChild(lb);
    render();
    document.addEventListener('keydown', function onKey(e){
      if(e.key==='Escape'){ lb.remove(); document.removeEventListener('keydown', onKey); }
      if(e.key==='ArrowLeft'){ nav(-1); }
      if(e.key==='ArrowRight'){ nav(1); }
    });
  };
})();
