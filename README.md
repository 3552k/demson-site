# Demson — marketing site

A single static page. No build step, no dependencies, no JS.

## Run it locally

Any static file server works. From this folder:

```
npx serve .
```

or just open `index.html` directly in a browser.

## Deploy

Point Netlify or Vercel at this folder. No build command, no output directory
setting needed — it's already a static site (`index.html` + `styles.css`).

## Theme

Light/dark follows the OS/browser setting (`prefers-color-scheme`) only —
there's no manual toggle by design. To preview the other theme, switch your
OS appearance setting, or in Chrome DevTools: Rendering tab → "Emulate CSS
media feature prefers-color-scheme."

## Where to swap images

Two placeholder slots in `index.html`, each a `div.image-placeholder`:

- `#img-hero` — hero shot, 16:9. Garment on a figure.
- `#img-detail` — supporting detail shot, 1:1. Close-up of the sensor fabric.

To swap one in, replace the placeholder div's contents with an `<img>`:

```html
<div id="img-hero" class="image-placeholder ratio-16-9">
  <img src="hero.jpg" alt="">
</div>
```

Keep the `ratio-16-9` / `ratio-1-1` class (or add a new one in `styles.css`)
so the layout doesn't jump once the real image is in.

## Where to change copy

All copy lives directly in `index.html`, in reading order: nav → hero →
problem → what it does → status → footer. No CMS, no data file — edit the
text in place.

## Colors, type, spacing

All design tokens (background, surface, text, accent, shadow) are CSS custom
properties at the top of `styles.css`, defined once for light and again
inside the `prefers-color-scheme: dark` block. Change a color in one place,
it updates everywhere. Typeface is Figtree (Google Fonts, loaded via the
`<link>` tags in `index.html`'s `<head>`), with a system-font fallback stack
so the page still reads correctly offline or if the font fails to load.

## Verified at

375px, 768px, 1440px — single-column layout throughout, hero type scales
with `clamp()`, no horizontal scroll at any width.
