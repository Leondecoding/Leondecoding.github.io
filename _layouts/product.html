---
layout: default
---

<div class="container product-page">
  <!-- 保持两列布局（即使站点样式未加载也能成立） -->
  <div class="product-grid" style="display:grid;grid-template-columns:minmax(260px,1fr) minmax(320px,1fr);gap:64px;align-items:start;padding-left:30px;">

    <!-- 左侧：作品主图（字段多路 + 标题/slug 兜底） -->
    <div class="product-gallery">
      {% assign candidates = '' | split: '' %}
      {% if page.image %}{% assign candidates = candidates | push: page.image %}{% endif %}
      {% if page.featured_image %}{% assign candidates = candidates | push: page.featured_image %}{% endif %}
      {% if page.cover %}{% assign candidates = candidates | push: page.cover %}{% endif %}
      {% if page.hero %}{% assign candidates = candidates | push: page.hero %}{% endif %}
      {% if page.thumbnail %}{% assign candidates = candidates | push: page.thumbnail %}{% endif %}
      {% if page.thumb %}{% assign candidates = candidates | push: page.thumb %}{% endif %}
      {% if page.picture %}{% assign candidates = candidates | push: page.picture %}{% endif %}
      {% if page.photo %}{% assign candidates = candidates | push: page.photo %}{% endif %}
      {% if page.images and page.images.size > 0 %}{% assign candidates = candidates | push: page.images[0] %}{% endif %}
      {% if page.photos and page.photos.size > 0 %}{% assign candidates = candidates | push: page.photos[0] %}{% endif %}

      {% assign title_dash = page.title | replace: ' ', '-' %}
      {% assign slug_dash  = page.title | slugify %}
      {% capture cand1 %}/assets/images/originals/{{ title_dash }}.jpg{% endcapture %}
      {% capture cand2 %}/assets/images/originals/{{ title_dash }}-1.jpg{% endcapture %}
      {% capture cand3 %}/assets/images/originals/{{ slug_dash }}.jpg{% endcapture %}
      {% capture cand4 %}/assets/images/originals/{{ slug_dash }}-1.jpg{% endcapture %}
      {% assign candidates = candidates | push: cand1 | push: cand2 | push: cand3 | push: cand4 %}

      {% assign main_image_url = nil %}
      {% for c in candidates %}
        {% if c %}
          {% assign p = c | strip %}
          {% if p != '' %}
            {% unless p contains '://' %}
              {% assign first_char = p | slice: 0, 1 %}
              {% if first_char != '/' %}{% assign p = '/' | append: p %}{% endif %}
            {% endunless %}
            {% assign main_image_url = p %}
            {% break %}
          {% endif %}
        {% endif %}
      {% endfor %}

      <img class="product-main-image" src="{{ main_image_url | relative_url }}" alt="{{ page.title | escape }}" style="max-width:100%;height:auto;display:block;"/>

      {% if page.images and page.images.size > 1 %}
        <div class="product-thumbs" style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">
          {% for t in page.images %}
            {% if t %}
              {% assign tpath = t %}
              {% unless tpath contains '://' %}
                {% assign first_char = tpath | slice: 0, 1 %}
                {% if first_char != '/' %}{% assign tpath = '/' | append: tpath %}{% endif %}
              {% endunless %}
              <img class="product-thumb" src="{{ tpath | relative_url }}" alt="{{ page.title | escape }} thumbnail" style="width:72px;height:auto;border:1px solid #eee;padding:2px;"/>
            {% endif %}
          {% endfor %}
        </div>
      {% endif %}
    </div>

    <!-- 右侧：信息（严格顺序） -->
    <div class="product-info" style="margin-top: 32px;">
      {% assign file_display = main_image_url | split: '/' | last %}
      {% if file_display == '' or file_display == nil %}{% assign file_display = page.title %}{% endif %}
      <h1 class="product-title" style="margin:0 0 8px 0;">{{ file_display }}</h1>

      {%- comment -%} 价格（默认链兜底，显示在标题下/税务提示上） {%- endcomment -%}
      {% assign price_raw = page.price | default: page.price_gbp | default: page.priceGBP | default: page.amount | default: page.cost | default: page.Price %}
      {% assign curr = page.currency | upcase | default: site.currency | upcase %}
      {% assign sym = '' %}
      {% if curr == 'GBP' %}{% assign sym = '£' %}{% elsif curr == 'USD' %}{% assign sym = '$' %}{% elsif curr == 'EUR' %}{% assign sym = '€' %}{% elsif curr == 'CNY' or curr == 'JPY' %}{% assign sym = '¥' %}{% elsif curr == 'HKD' %}{% assign sym = 'HK$' %}{% elsif curr == 'TWD' %}{% assign sym = 'NT$' %}{% endif %}
      {% if price_raw %}
        <div class="product-price" style="font-size:1.125rem;font-weight:600;margin-bottom:6px;">{% if sym != '' %}{{ sym }}{{ price_raw }}{% else %}{{ price_raw }}{% if curr %} {{ curr }}{% endif %}{% endif %}</div>
      {% endif %}

      <div class="product-taxes" style="color:#555;margin-bottom:12px;">Taxes included.</div>

      {% assign default_size = page.selected_size | default: page.size | default: 'A4' %}

      <div class="product-actions" style="display:flex;flex-direction:column;gap:8px;max-width:420px;">
        <!-- 注意：不设置 action/method；按钮用 type="button"，避免站内 POST 触发 405 -->
        <form class="product-paypal">
          <input type="hidden" name="item_name" value="{{ page.title | default: file_display }}">
          {% if price_raw %}<input type="hidden" name="amount" value="{{ price_raw }}">{% endif %}
          <input type="hidden" name="os0" value="{{ default_size }}">
          <button type="button" style="width:100%;padding:12px 16px;">Pay via PayPal</button>
        </form>

        <form class="product-cart">
          <input type="hidden" name="title" value="{{ page.title | default: file_display }}">
          {% if price_raw %}<input type="hidden" name="price" value="{{ price_raw }}">{% endif %}
          <input type="hidden" name="size" value="{{ default_size }}">
          <button type="button" style="width:100%;padding:12px 16px;">Add to Cart</button>
        </form>
      </div>

      {% assign content_raw = content %}
      {% if content_raw contains '---' and content_raw contains 'layout:' %}
        {% assign parts = content_raw | split: '---' %}
        {% if parts.size > 2 %}{% assign content_clean = parts[2] %}{% else %}{% assign content_clean = content_raw %}{% endif %}
      {% else %}
        {% assign content_clean = content_raw %}
      {% endif %}
      <div class="product-description" style="margin-top:16px;max-width:65ch;">{{ content_clean }}</div>
    </div>

  </div>
</div>

<!-- 仅做两件事：1) Add to Cart 写入 localStorage（不弹支付） 2) 立即购买直达 PayPal（若配置） -->
<script>
(function () {
  // —— 读取 Jekyll 变量（安全转义）——
  var MODE             = {{ site.paypal_mode | default: 'disabled' | jsonify }}; // 'sandbox' | 'live' | 'disabled'
  var BUSINESS_LIVE    = {{ site.paypal_business | jsonify }};
  var BUSINESS_SANDBOX = {{ site.paypal_business_sandbox | jsonify }};
  var ITEM_NAME        = {{ page.item_name | default: page.title | jsonify }};
  var AMOUNT_RAW       = {{ price_raw | jsonify }};
  var CURRENCY_CODE    = {{ page.currency | default: site.currency | default: 'GBP' | jsonify }};
  var DEFAULT_SIZE     = {{ default_size | jsonify }};
  var MAIN_IMAGE       = {{ main_image_url | jsonify }};

  // —— PayPal 端点（仅用于“立即购买”）——
  var endpoint = MODE === "sandbox"
    ? "https://www.sandbox.paypal.com/cgi-bin/webscr"
    : "https://www.paypal.com/cgi-bin/webscr";
  var business = MODE === "sandbox" ? (BUSINESS_SANDBOX || BUSINESS_LIVE) : BUSINESS_LIVE;

  // —— 读取尺寸（os0）——
  function readSize() {
    var hidden = document.querySelector('.product-paypal input[name="os0"]');
    return hidden ? hidden.value : (DEFAULT_SIZE || "");
  }

  // —— 本地购物车（最小实现，不影响全站其它脚本）——
  var CART_KEY = "fz_cart"; // 若你的头部脚本使用别的键名，请告诉我再对齐
  function loadCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); } catch(e) { return []; }
  }
  function saveCart(items) { localStorage.setItem(CART_KEY, JSON.stringify(items)); }
  function addCurrentToCart() {
    var items = loadCart();
    var size  = readSize();
    var item = {
      name: ITEM_NAME || document.title || "Artwork",
      size: size,
      amount: AMOUNT_RAW,
      currency: CURRENCY_CODE || "GBP",
      quantity: 1,
      image: MAIN_IMAGE
    };
    items.push(item);
    saveCart(items);

    // 派发一个自定义事件，便于全站其它脚本（若有）更新购物车徽标
    var ev = new CustomEvent("fz:cart:updated", { detail: { count: items.length, items: items } });
    document.dispatchEvent(ev);

    // 轻提示（不打断用户流程，也不弹支付）
    try {
      var btn = document.querySelector(".product-cart button");
      if (btn) {
        btn.disabled = true;
        var old = btn.textContent;
        btn.textContent = "Added ✓";
        setTimeout(function(){ btn.textContent = old; btn.disabled = false; }, 1200);
      }
    } catch(_) {}
  }

  // —— 立即购买（_xclick）——
  function directBuy() {
    if (!business) {
      alert("PayPal 尚未配置。请先使用右上角购物车收集作品，等账号就绪后再支付。");
      return;
    }
    var size = readSize();
    var form = document.createElement("form");
    form.method = "post";
    form.action = endpoint;
    form.target = "_blank";

    function add(n,v){ if(v==null||v==="") return; var i=document.createElement("input"); i.type="hidden"; i.name=n; i.value=String(v); form.appendChild(i); }
    add("cmd", "_xclick");
    add("business", business);
    add("item_name", ITEM_NAME || document.title || "Artwork");
    add("amount", AMOUNT_RAW);
    add("currency_code", CURRENCY_CODE || "GBP");
    add("os0", size);

    document.body.appendChild(form);
    form.submit();
    form.remove();
  }

  // —— 仅绑定本页两个按钮；不接管 Header 上的搜索/登录/购物车 —— 
  document.addEventListener("DOMContentLoaded", function () {
    var buyBtn  = document.querySelector(".product-paypal button");
    var cartBtn = document.querySelector(".product-cart button");
    if (buyBtn)  buyBtn.addEventListener("click", function(e){ e.preventDefault(); directBuy(); });
    if (cartBtn) cartBtn.addEventListener("click", function(e){ e.preventDefault(); addCurrentToCart(); });
  });
})();
</script>
