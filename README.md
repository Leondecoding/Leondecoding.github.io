
# Art Website (Bilingual, Static, GitHub Pages-ready)

This is a **static** bilingual portfolio + shop for watercolor artwork. It matches the user's requirements:

- Top sticky summary area with brand icon and tagline.
- Sections: Home, Our Story, Blog (with video preview), Original Art (gallery + lightbox with arrows),
  Art Print & Greeting Card (gallery -> product modal with size selector + PayPal link), Contact, Language toggle, Login.
- Social icons (YouTube, Instagram) at the bottom of every page.
- Easy-to-edit content in `data/*.json`.
- Pure static files — deployable on GitHub Pages.

## Quick Start

1. Download this folder and open `index.html` locally to preview.
2. Replace images in `assets/` with your artworks.
3. Edit text and labels in `data/translations.json`.
4. Edit content in:
   - `data/blog.json` — add posts with `cover` image and optional `video_url` (YouTube/Vimeo).
   - `data/original_art.json` — originals shown in the gallery & lightbox.
   - `data/prints.json` and `data/cards.json` — add product `sizes` and **PayPal links** per size.
5. Set your social links in `app.js` (`state.socials`).

## PayPal

For each size, put its hosted PayPal link in the product's `paypalLinks` dict.
Clicking **Buy via PayPal** opens that link in a new tab.

## Login (Demo)

A demo-only localStorage login is included so visitors can **create an account** and **login**,
but it's not secure. For real auth on a free static site, consider services like Firebase Auth or Supabase.

## GitHub Pages Deployment

1. Create a GitHub repo (e.g., `art-website`).
2. Copy all files to the repo root and commit.
3. In the repo settings, enable **Pages** → **Source: Deploy from a branch** → Branch: `main` (root).
4. After GitHub builds the site, your website URL will appear in the Pages settings.

> Tip: If your repo uses a subfolder (`/docs`) for Pages, move all files into `docs/` and adjust the Pages setting accordingly.

## File Structure

```
.
├── index.html
├── styles.css
├── app.js
├── assets/
│   ├── logo.jpg              # Provided logo (replace as needed)
│   └── ph-*.svg              # Placeholder images — replace with your artwork
└── data/
    ├── translations.json
    ├── blog.json
    ├── original_art.json
    ├── prints.json
    └── cards.json
```

## Customize

- Colors, spacing, and typography tokens are set in `styles.css` under `:root`.
- Nav items and route mapping are in `app.js` (`routes`).
- To keep the top summary visible on every page, the header is sticky.

## License

You may use and modify this template for your personal art site.
