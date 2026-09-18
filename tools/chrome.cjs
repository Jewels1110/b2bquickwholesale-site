module.exports = { head: (title, description, page, extraCss = "", extraStyle = "") => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="https://b2bquickwholesale.com/${page}">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=IBM+Plex+Mono:wght@500&family=Inter:wght@400;500;600;650&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/site.css">${extraCss}
${extraStyle}</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>

<header class="masthead">
  <div class="wrap masthead__inner">
    <a class="logo" href="/">
      <span class="logo__chip">B2B</span>
      <span class="logo__word">Quick <span>Wholesale</span></span>
    </a>
    <button class="nav-toggle" type="button" data-nav-toggle aria-expanded="false" aria-controls="nav">Menu</button>
    <nav class="nav" id="nav" data-nav aria-label="Main">
      <a href="features.html"${page === "features.html" ? ' aria-current="page"' : ""}>Features</a>
      <a href="demo.html"${page === "demo.html" ? ' aria-current="page"' : ""}>See it work</a>
      <a href="setup.html"${page === "setup.html" ? ' aria-current="page"' : ""}>Setup guide</a>
      <a href="pricing.html"${page === "pricing.html" ? ' aria-current="page"' : ""}>Pricing</a>
      <a href="faq.html"${page === "faq.html" ? ' aria-current="page"' : ""}>FAQ</a>
      <a class="btn btn--sm" href="pricing.html#install">Install on Shopify</a>
    </nav>
  </div>
</header>

<main id="main">
`, foot: (scripts = "") => `</main>

<footer class="footer">
  <div class="wrap">
    <div class="footer__grid">
      <div>
        <a class="logo" href="/"><span class="logo__chip">B2B</span><span class="logo__word">Quick <span>Wholesale</span></span></a>
        <p class="small" style="margin-top:.9rem;max-width:30ch">Wholesale ordering for Shopify's native B2B. Built by Superfine Designs.</p>
      </div>
      <div><h4>Product</h4><ul>
        <li><a href="features.html">Features</a></li>
        <li><a href="demo.html">See it work</a></li>
        <li><a href="pricing.html">Pricing</a></li>
        <li><a href="requirements.html">Requirements</a></li>
      </ul></div>
      <div><h4>Help</h4><ul>
        <li><a href="setup.html">Setup guide</a></li>
        <li><a href="faq.html">FAQ</a></li>
        <li><a href="support.html">Support</a></li>
      </ul></div>
      <div><h4>Legal</h4><ul>
        <li><a href="privacy.html">Privacy policy</a></li>
        <li><a href="terms.html">Terms of service</a></li>
      </ul></div>
    </div>
    <div class="footer__legal">
      <span class="tiny">© <span data-year>2026</span> Superfine Designs. Not affiliated with Shopify Inc.</span>
      <span class="tiny">Questions? <a href="mailto:b2bquickwholesale@gmail.com">b2bquickwholesale@gmail.com</a></span>
    </div>
  </div>
</footer>

<script src="assets/site.js" defer></script>${scripts}
</body>
</html>
` };
