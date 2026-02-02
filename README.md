# OYA Essentials - Shopify Theme

A custom Shopify 2.0 theme for [OYA Essentials](https://oyaessentials.ro), a luxury aromatherapy and essential oils e-commerce store.

Based on [Taillour Shopify Theme](https://taillourtheme.com) by Ketan Mistry.

## Features

- **Zero Dependencies** - Pure Liquid, vanilla JavaScript, and CSS
- **Shopify 2.0** - Modern JSON template architecture
- **Mobile-First** - Responsive design with dedicated mobile styles
- **Multilingual** - Romanian and English language support
- **GSAP Animations** - Smooth scroll animations and interactions
- **Side Panel Cart** - Seamless shopping experience
- **Product Metafields** - Extended product information (rituals, precautions, sustainability)

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Liquid | Shopify templating |
| Vanilla JS | Interactivity (no frameworks) |
| CSS3 | Styling with custom properties |
| GSAP 3.13 | Animations (CDN) |

## Project Structure

```
├── assets/           # CSS, JavaScript, images, SVGs
├── config/           # Theme settings and metafields
├── layout/           # Master templates
├── sections/         # Reusable page sections
├── snippets/         # Partial components
└── templates/        # Page templates (JSON format)
```

## Development

### Prerequisites

- [Shopify CLI](https://shopify.dev/docs/themes/tools/cli)

### Local Development

```bash
shopify theme dev
```

This starts a local development server with hot reload.

### Deployment

Theme files sync directly to Shopify - no build step required.

## Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Cream | `#e0d9ba` | Backgrounds |
| Brown | `#1f1518` | Primary text |
| Green | `#587a4f` | Accents |
| Orange | `#cd7f36` | CTAs, highlights |

## License

MIT License - See [LICENSE](LICENSE) for details.

## Credits

- Theme Base: [Taillour Theme](https://taillourtheme.com) by Ketan Mistry
- Store: [OYA Essentials](https://oyaessentials.ro)
