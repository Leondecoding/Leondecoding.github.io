# FZ Studio — v16 refined

这是一个**静态网页打包**（无需后端），包含：

- 头部导航（品牌“FZ Studio”、搜索、账户、购物车图标）
- 语言切换 EN / 中文（默认英文）
- 过滤标签：All / Original / Art Print / Greeting Card
- 自适应网格（缩略图居中、等比裁切）
- 点击缩略图进入大图预览（左右箭头切换）
- 简单搜索（按标题即时过滤）

> 根据你在“网站调整与更新”里的要求整理，便于你直接在 GitHub Pages 上线。

---

## 使用方法

1. 把本文件夹上传到你的 GitHub 仓库（例如：`fz-studio-site`）。
2. 打开仓库 **Settings → Pages**，把 **Source** 设为 `main` 分支的根目录（或 `docs`）。
3. 稍等片刻，GitHub 会生成一个 Pages 网址。

> 如果你已有项目结构，也可以把 `index.html / styles.css / app.js / assets/images` 拖进你的项目中覆盖/合并。

---

## 替换作品图片

- 把你的图片放到 `assets/images/` 目录。
- 文件名可以沿用 `work-01.png`、`work-02.png` …（或在 `app.js` 里改构建数据的方式）。
- 建议尺寸：**1600×1200**，JPG/PNG 均可。

---

## 修改：文字 & 语言

- 所有可翻译的文案在 `app.js` 的 `i18n` 字典里，默认 `lang: "en"`。
- 导航“作品/产品/关于我/视频”只在切换到中文时才显示中文。

---

## 调整 Logo 大小

- 在 `styles.css` 里找到 `.logo`，修改 `font-size`（默认 24px）。

---

## 网格仍然“竖排”怎么办？

- 这个打包使用了**原生 CSS Grid**：`grid-template-columns: repeat(auto-fit, minmax(260px, 1fr))`。
- 如果你在自己的项目里仍然只有**一列**，多半是：
  1) 容器宽度被限制了（比如某个父级 `width: 320px`）。
  2) 某个全局样式覆盖了 `.grid { display: grid; }`。
  3) Tailwind/其它框架的类（如 `grid-cols-1`）覆盖了网格定义。

> 解决：在浏览器 DevTools 里选中网格容器 `#grid`，检查**计算样式**与父容器宽度。

---

## 自定义字体

- 页面引入了 Google Fonts：`Inter`（英文字体）与 `Noto Serif SC`（中文）。
- 如果你在国内环境访问受限，可改为本地字体或去掉 `<link rel="stylesheet" ...>`。

---

## 与电商/支付对接（可选）

- 目前“账户/购物车”是图标占位。后续你可以：
  - 把 Products 页面链接到你的商店（Shopify、Etsy 或自建）。
  - 在卡片中加入“加入购物车”按钮并对接 PayPal/Stripe。

---

## 目录结构

```
FZ-Studio-v16-refined/
├─ index.html
├─ styles.css
├─ app.js
└─ assets/
   └─ images/
      ├─ work-01.png … work-12.png
```

祝上线顺利！
