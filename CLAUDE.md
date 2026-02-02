# CLAUDE.md - Project Guide for Claude

## Project Overview

This is **Taillour Shopify Theme** (v1.0.4), a custom Shopify 2.0 theme powering OYA Essentials - a luxury aromatherapy and essential oils e-commerce store.

**Key Characteristics:**
- Zero build dependencies - pure Liquid, vanilla JavaScript, and CSS
- Shopify 2.0 JSON template format
- Mobile-first responsive design
- Multilingual support (Romanian/English)
- GSAP animations via CDN

## Tech Stack

- **Liquid** - Shopify's template language
- **Vanilla JavaScript** (ES6+) - No frameworks
- **CSS3** - With CSS custom properties
- **GSAP 3.13.0** - Animation library (CDN)
- **Shopify Storefront API** - Cart operations

## Directory Structure

```
├── assets/           # CSS, JS, images, SVGs (49 files)
├── config/           # Theme settings (settings_schema.json, settings_data.json)
├── layout/           # Master templates (theme.liquid, password.liquid)
├── sections/         # Reusable page sections (60 files)
├── snippets/         # Partial components (20 files)
├── templates/        # Page templates in JSON format (17 files)
└── .shopify/         # Metafields schema
```

## Key Files

| File | Purpose |
|------|---------|
| `layout/theme.liquid` | Master HTML template, loads all CSS/JS |
| `assets/theme.js` | Core JS: menu, accordion, language switcher |
| `assets/cart.js` | Cart quantity updates |
| `assets/cart-sidepanel.js` | Side panel cart functionality |
| `assets/theme.css` | Main stylesheet |
| `assets/mobile.css` | Mobile-specific styles |
| `config/settings_schema.json` | Theme customization options |
| `.shopify/metafields.json` | Product metafield definitions |

## Development Workflow

**Local Development:**
```bash
shopify theme dev
```

**No Build Step Required** - Files sync directly to Shopify.

## CSS Variables (Brand Colors)

```css
--color-brand-cream: #e0d9ba
--color-brand-brown: #1f1518
--color-brand-brown2: #291c1f
--color-brand-green: #587a4f
--color-brand-orange: #cd7f36
--color-brand-orange2: #99451d
```

## Conventions

### Liquid
- Use JSON templates (Shopify 2.0 format) in `templates/`
- Section schemas define customization options
- Use snippets for reusable components

### JavaScript
- Vanilla JS only, no frameworks
- Use data attributes for targeting (e.g., `data-accordion`, `data-submenu-toggle`)
- GSAP for complex animations

### CSS
- Mobile-first approach
- Breakpoint: 768px for mobile/desktop
- Use CSS custom properties for colors
- Separate mobile.css for mobile-specific overrides

### Accessibility
- Always include aria-labels
- Use semantic HTML
- Support keyboard navigation

## Languages

- **Default:** Romanian (RO)
- **Secondary:** English (EN)
- Language switcher in header routes to `/en/*` paths
- Use Shopify's translation filters: `{{ 'key' | t }}`

## External Services

- Meta Pixel (Facebook): ID 2111348929400943
- Google Tag Manager: GT-MBTLFRSN

## Common Tasks

### Add a new section
1. Create `.liquid` file in `sections/`
2. Include schema block at the bottom for settings
3. Reference in template JSON files

### Add a new page template
1. Create `page.{name}.json` in `templates/`
2. Define sections array with order and settings

### Modify product metafields
Edit `.shopify/metafields.json` for custom product data fields

### Update theme settings
Edit `config/settings_schema.json` for admin UI options

## Git Workflow

- **Main branch:** `main`
- **Development branch:** `dev`
- Remote: GitHub (TheMarketingWave/OYA)
