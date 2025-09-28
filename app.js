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
async function renderGallery(){const v=$("#view");v.innerHTML="";const wrap=h("section",{},h("h1",{},"Original Art"));const grid=h("div",{class:"gallery"});const items=state.data.original_art||[];items.forEach((it,idx)=>grid.append(h("figure",{class:"thumb",onclick:()=>openLightbox(items,idx)},h("img",{src:it.image,alt:it.title_en}),h("figcaption",{class:"caption"}, it.title_en || (kind==="cards"?"name of card":"name of painting")))));wrap.append(grid);v.append(wrap)}
function openLightbox(items,index){const lb=h("div",{class:"lightbox",onclick:(e)=>{if(e.target===lb){lb.remove();document.removeEventListener('keydown',onKey);}}});const inner=h("div",{class:"lb-inner"}),imgWrap=h("div",{class:"lb-img"}),cap=h("div",{class:"lb-caption"});const close=h("button",{class:"lb-close",onclick:()=>{lb.remove();document.removeEventListener('keydown',onKey);}},"✕");const prev=h("button",{class:"lb-prev",onclick:()=>go(-1)},"‹");const next=h("button",{class:"lb-next",onclick:()=>go(1)},"›");function update(){const it=items[index];imgWrap.innerHTML="";imgWrap.append(h("img",{src:it.image,alt:it.title_en}));cap.textContent=it.title_en;}function go(d){index=(index+d+items.length)%items.length;update();}function onKey(e){if(e.key==="Escape"){lb.remove();document.removeEventListener('keydown',onKey);}if(e.key==="ArrowLeft")go(-1);if(e.key==="ArrowRight")go(1);}document.addEventListener("keydown",onKey);inner.append(imgWrap,cap,close,prev,next);lb.append(inner);document.body.append(lb);update();}
async function renderShop(kind){const v=$("#view");v.innerHTML="";const title= kind==="prints" ? "Art Prints" : "Greeting Cards";const wrap=h("section",{},h("h1",{},title));const grid=h("div",{class:"gallery"});const items= state.data[kind] || [];items.forEach((it,idx)=>grid.append(h("figure",{class:"thumb",onclick:()=>openProduct(kind,items,idx)},h("img",{src:it.image,alt:it.title_en}),h("figcaption",{class:"caption"}, it.title_en || (kind==="cards"?"name of card":"name of painting")))));wrap.append(grid);v.append(wrap)}
function openProduct(kind,items,index){const item=items[index];const modal=h("div",{class:"lightbox",onclick:(e)=>{if(e.target===modal){modal.remove();document.removeEventListener('keydown',onKey);}}});const inner=h("div",{class:"lb-inner",style:"max-width:min(96vw,1200px)"});const panel=h("div",{class:"product-panel"});const title=item.title_en;panel.append(h("div",{class:"image"},h("img",{src:item.image,alt:title})),h("div",{class:"info"},h("h2",{},title),h("p",{style:"margin:8px 0;text-align:center"}, item.description_en||""),h("div",{class:"row"},h("label",{},"Size:"),(function(){const sel=h("select",{id:"sizeSel",onchange:()=>updatePrice()});for(const s of item.sizes||[]) sel.append(h("option",{value:s},s));return sel;})()),h("div",{class:"row"},h("strong",{},"Price: "),h("span",{id:"pPrice"},"")),h("div",{class:"row"},h("strong",{},"Product Info: "),h("span",{id:"pInfo"}, item.info_en||"")),h("div",{class:"row"},h("button",{class:"buy",onclick:()=>{const size=document.getElementById('sizeSel').value;const link=(item.paypalLinks||{})[size]; if(!link){alert('Missing PayPal link for '+size);return;} window.open(link,'_blank','noopener');}},"Buy via PayPal"))));const close=h("button",{class:"lb-close",onclick:()=>{modal.remove();document.removeEventListener('keydown',onKey);}},"✕");const prev=h("button",{class:"lb-prev",onclick:()=>go(-1)},"‹");const next=h("button",{class:"lb-next",onclick:()=>go(1)},"›");function updatePrice(){const size=document.getElementById('sizeSel').value;const price=(item.prices||{})[size]||"";const p=document.getElementById('pPrice'); if(p) p.textContent=price;}function go(d){index=(index+d+items.length)%items.length; modal.remove(); openProduct(kind,items,index);}function onKey(e){if(e.key==='Escape'){modal.remove();document.removeEventListener('keydown',onKey);} if(e.key==='ArrowLeft') go(-1); if(e.key==='ArrowRight') go(1);}document.addEventListener('keydown',onKey);inner.append(panel,close,prev,next);modal.append(inner);document.body.append(modal);setTimeout(updatePrice,0);}
function renderContact(){const v=$("#view");v.innerHTML="";v.append(h("section",{},h("h1",{},"Contact"),h("p",{style:"text-align:center"},"For commissions or questions, email us:"),h("p",{style:"text-align:center"},h("a",{href:"mailto:hello@example.com"},"Send Email"))))}
function renderLogin(){const v=$("#view");v.innerHTML="";v.append(h("section",{},h("h1",{},"Login / Sign up")))} boot();
(function(){
  window.openProduct = function(kind, items, index){
    let i = index;
    const lb = document.createElement('div'); lb.className='lightbox';
    Object.assign(lb.style,{position:'fixed',inset:'0',background:'rgba(255,255,255,0.98)',zIndex:'9999',overflow:'auto'});
    const wrap = document.createElement('div'); Object.assign(wrap.style,{maxWidth:'1040px',margin:'40px auto',padding:'0 16px'});
    const prevBtn = document.createElement('button'); prevBtn.className='arrow prev'; prevBtn.textContent='‹';
    const nextBtn = document.createElement('button'); nextBtn.className='arrow next'; nextBtn.textContent='›';
    const closeBtn = document.createElement('button'); closeBtn.className='close'; closeBtn.textContent='×';
    function getItem(){ return items[i]; }
    function render(){
      const it = getItem();
      wrap.innerHTML='';
      const title = document.createElement('h2'); title.textContent = it.title_en || (kind==='cards'?'name of card':'name of painting'); title.style.margin='0 0 12px'; title.style.fontWeight='300'; title.style.color='#999';
      const row = document.createElement('div'); row.style.display='grid'; row.style.gridTemplateColumns='1fr 1fr'; row.style.gap='20px';
      const fig = document.createElement('figure'); const img = document.createElement('img'); img.src = it.image; img.style.width='100%'; img.style.display='block'; fig.appendChild(img);
      const info = document.createElement('div');
      info.innerHTML = '<div><strong>Size:</strong> '+(it.size_text||it.size||'TBD')+'</div>' +
                       '<div><strong>Price:</strong> '+(it.price_text||it.price||'TBD')+'</div>';
      const pay = document.createElement('a'); pay.textContent='Buy via PayPal'; pay.target='_blank'; pay.rel='noopener'; pay.href= it.paypal || it.paypal_url || '#';
      Object.assign(pay.style,{display:'inline-block',marginTop:'12px',padding:'8px 12px',border:'1px solid #ddd',textDecoration:'none',color:'#333'});
      info.appendChild(pay);
      row.append(fig, info);
      wrap.append(title, row);
    }
    function nav(d){ i+=d; if(i<0) i=items.length-1; if(i>=items.length) i=0; render(); }
    prevBtn.onclick=()=>nav(-1); nextBtn.onclick=()=>nav(1); closeBtn.onclick=()=>lb.remove();
    lb.append(wrap, prevBtn, nextBtn, closeBtn); document.body.appendChild(lb); render();
    function onKey(e){ if(e.key==='Escape'){lb.remove();document.removeEventListener('keydown',onKey)}; if(e.key==='ArrowLeft'){nav(-1)}; if(e.key==='ArrowRight'){nav(1)} }
    document.addEventListener('keydown', onKey);
  };
})();
