---
layout: default
---

<div class="container product-page">
  <!-- 两列布局（保持与你之前一致） -->
  <div class="product-grid" style="display:grid;grid-template-columns:minmax(260px,1fr) minmax(320px,1fr);gap:64px;align-items:start;padding-left:30px;">

    <!-- 左侧：作品主图（多字段候选 + 标题/slug 兜底） -->
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

    <!-- 右侧：信息（顺序保持不变） -->
    <div class="product-info fz-product" style="margin-top: 32px;">
      {% assign file_display = main_image_url | split: '/' | last %}
      {% if file_display == '' or file_display == nil %}{% assign file_display = page.title %}{% endif %}
      <h1 class="product-title" style="margin:0 0 8px 0;">{{ file_display }}</h1>

      {% assign price_raw = page.price | default: page.price_gbp | default: page.priceGBP | default: page.amount | default: page.cost | default: page.Price %}
      {% assign curr = page.currency | upcase | default: site.currency | upcase %}
      {% assign sym = '' %}
      {% if curr == 'GBP' %}{% assign sym = '£' %}{% elsif curr == 'USD' %}{% assign sym = '$' %}{% elsif curr == 'EUR' %}{% assign sym = '€' %}{% elsif curr == 'CNY' or curr == 'JPY' %}{% assign sym = '¥' %}{% elsif curr == 'HKD' %}{% assign sym = 'HK$' %}{% elsif curr == 'TWD' %}{% assign sym = 'NT$' %}{% endif %}
      {% if price_raw %}
        <div class="product-price" style="font-size:1.125rem;font-weight:600;margin-bottom:6px;">{% if sym != '' %}{{ sym }}{{ price_raw }}{% else %}{{ price_raw }}{% if curr %} {{ curr }}{% endif %}{% endif %}</div>
      {% endif %}

      <div class="product-taxes" style="color:#555;margin-bottom:12px;">Taxes included.</div>

      {% assign default_size = page.selected_size | default: page.size | default: 'A4' %}
      {% assign currency_code = page.currency | default: site.currency | default: 'GBP' %}
      {% assign sku_base = page.sku | default: page.slug | default: page.title | slugify %}

      <div class="product-actions" style="display:flex;flex-direction:column;gap:8px;max-width:420px;">
        <!-- PayPal 按钮（先留口；未配置账号时不跳转） -->
        <form class="product-paypal">
          <input type="hidden" name="item_name" value="{{ page.title | default: file_display }}">
          {% if price_raw %}<input type="hidden" name="amount" value="{{ price_raw }}">{% endif %}
          <input type="hidden" name="os0" value="{{ default_size }}">
          <button type="button" style="width:100%;padding:12px 16px;">Pay via PayPal</button>
        </form>

        <!-- Add to Cart：完全按 fz-ui.js 的约定对接 -->
        <!-- getSelectedValue() 会在 .fz-product 内查找 name="size" 的选中项，所以提供一个隐藏单选即可。:contentReference[oaicite:1]{index=1} -->
        <form class="product-cart">
          <input type="radio" name="size" value="{{ default_size }}" checked hidden>
          <button
            type="button"
            class="js-add-to-cart"
            data-title="{{ page.title | default: file_display | escape }}"
            {% if price_raw %}data-price="{{ price_raw }}"{% endif %}
            data-currency="{{ currency_code }}"
            data-image="{{ main_image_url | relative_url }}"
            data-sku="{{ sku_base }}"
            data-option-input="size"
            data-option-name="Size"
            style="width:100%;padding:12px 16px;"
          >Add to Cart</button>
        </form>
      </div>

      <!-- 描述正文；去掉意外出现的 '--- layout: default ---' 文本 -->
      {% assign content_safe = content | replace: '--- layout: default ---', '' %}
      <div class="product-description" style="margin-top:16px;max-width:65ch;">{{ content_safe }}</div>
    </div>

  </div>
</div>
