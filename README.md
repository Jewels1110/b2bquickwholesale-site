# b2bquickwholesale.com

The marketing and documentation site for the **B2B Quick Wholesale** Shopify app.
Plain HTML, CSS and a little JavaScript. No build step, no framework, no npm install:
edit a file, save it, and that's the change.

## Editing it

| If you want to change… | Edit |
| --- | --- |
| Home page wording | `index.html` |
| The feature list | `features.html` |
| The setup instructions | `setup.html` |
| Price or what's included | `pricing.html` |
| Plans, themes, limits | `requirements.html` |
| Questions and answers | `faq.html` |
| Support wording | `support.html` |
| Privacy policy / terms | `privacy.html`, `terms.html` |
| Colours, type, spacing | `assets/site.css` (design tokens at the top) |
| The interactive order form | `assets/demo.js` (product list at the top), `assets/demo.css` |

Every page shares the same header and footer. If you change the navigation, change it
in each page, or run the helper in `tools/chrome.cjs` which holds the shared markup.

### Looking at it before you publish

Open `index.html` in a browser by double-clicking it. Links between pages work. For
the interactive demo to behave exactly as it will live, serve the folder instead:

```bash
python3 -m http.server 4700   # or any simple static server
```

## Publishing

The site is hosted free on **GitHub Pages** from this repository.

1. Commit and push (GitHub Desktop → Commit → Push origin).
2. GitHub rebuilds the site within a minute or two.

The domain is set by `CNAME` in this folder (`b2bquickwholesale.com`). Don't delete it.

### DNS (already set up, kept here for reference)

At the domain registrar (GoDaddy), for `b2bquickwholesale.com`:

| Type | Name | Value |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | jewels1110.github.io |

In the repository: **Settings → Pages → Custom domain** = `b2bquickwholesale.com`, and
tick **Enforce HTTPS** once the certificate is issued (can take up to an hour).

## House rules for this site

- **No invented proof.** No fake review counts, no logos of stores that aren't
  customers, no "trusted by X brands" until it's true.
- **Accuracy about Shopify.** Plans, limits and click paths were checked against
  Shopify's own documentation on 17 September 2026. Re-check before big edits;
  Shopify moves things.
- **No tracking.** No analytics, no cookies, no third-party scripts except Google
  Fonts. If you add analytics, update `privacy.html` the same day.
- **Accessibility.** Text meets WCAG AA contrast, every page has one `h1`, the site
  works with a keyboard and at 320px wide. Keep it that way.
