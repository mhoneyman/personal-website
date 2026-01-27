#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'docs'); // GitHub Pages serves from /docs
const CSS = path.join(ROOT, 'css');

// Ensure marked is available
try {
  require.resolve('marked');
} catch (e) {
  console.log('Installing marked...');
  execSync('npm install marked', { cwd: ROOT, stdio: 'inherit' });
}

const { marked } = require('marked');

// Configure marked for clean output
marked.setOptions({
  gfm: true,
  breaks: false,
});

// Create dist directory
if (!fs.existsSync(DIST)) {
  fs.mkdirSync(DIST, { recursive: true });
}

// Read and convert CV markdown
const cvPath = path.join(SRC, 'cv.md');
const cvMarkdown = fs.readFileSync(cvPath, 'utf-8');
const cvHtml = marked.parse(cvMarkdown);

// Read CSS
const cssPath = path.join(CSS, 'style.css');
const css = fs.readFileSync(cssPath, 'utf-8');

// NHS Logo SVG (simplified NHS text logo) - for the Easter egg button
const nhsLogoSvg = `<svg viewBox="0 0 40 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path fill="#005eb8" d="M0 0h40v16H0z"/>
  <path fill="#fff" d="M3.9 1.5h4.4l2.6 9h.1l1.8-9h3.3l-2.8 13H9l-2.7-9h-.1l-1.8 9H1.1M17.3 1.5h3.6l-1 4.9h4L25 1.5h3.5l-2.7 13h-3.5l1.1-5.6h-4.1l-1.2 5.6h-3.4M37.7 4.4c-.7-.3-1.6-.6-2.9-.6-1.4 0-2.5.2-2.5 1.3 0 1.8 5.1 1.2 5.1 5.1 0 3.6-3.3 4.5-6.4 4.5-1.3 0-2.9-.3-4-.7l.8-2.7c.7.4 2.1.7 3.2.7s2.8-.2 2.8-1.5c0-2.1-5.1-1.3-5.1-5 0-3.4 2.9-4.4 5.8-4.4 1.6 0 3.1.2 4 .6"/>
</svg>`;

// NHS Header component (shown only when NHS theme is active)
const nhsHeader = `
<header class="nhsuk-header" role="banner">
  <div class="nhsuk-header__container">
    <div class="nhsuk-header__logo">
      <svg class="nhsuk-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 16" aria-hidden="true" focusable="false">
        <path fill="#fff" d="M0 0h40v16H0z"/>
        <path fill="#005eb8" d="M3.9 1.5h4.4l2.6 9h.1l1.8-9h3.3l-2.8 13H9l-2.7-9h-.1l-1.8 9H1.1M17.3 1.5h3.6l-1 4.9h4L25 1.5h3.5l-2.7 13h-3.5l1.1-5.6h-4.1l-1.2 5.6h-3.4M37.7 4.4c-.7-.3-1.6-.6-2.9-.6-1.4 0-2.5.2-2.5 1.3 0 1.8 5.1 1.2 5.1 5.1 0 3.6-3.3 4.5-6.4 4.5-1.3 0-2.9-.3-4-.7l.8-2.7c.7.4 2.1.7 3.2.7s2.8-.2 2.8-1.5c0-2.1-5.1-1.3-5.1-5 0-3.4 2.9-4.4 5.8-4.4 1.6 0 3.1.2 4 .6"/>
      </svg>
    </div>
    <div class="nhsuk-header__service">
      <span class="nhsuk-header__service-name">Matthew Honeyman</span>
    </div>
  </div>
</header>`;

// NHS Footer component (shown only when NHS theme is active)
const nhsFooter = `
<footer class="nhsuk-footer" role="contentinfo">
  <div class="nhsuk-footer__container">
    <div class="nhsuk-footer__meta">
      <h2 class="nhsuk-u-visually-hidden">Support links</h2>
      <ul class="nhsuk-footer__list">
        <li class="nhsuk-footer__list-item"><a class="nhsuk-footer__list-item-link" href="#">Accessibility statement</a></li>
        <li class="nhsuk-footer__list-item"><a class="nhsuk-footer__list-item-link" href="#">Contact</a></li>
        <li class="nhsuk-footer__list-item"><a class="nhsuk-footer__list-item-link" href="#">Privacy policy</a></li>
        <li class="nhsuk-footer__list-item"><a class="nhsuk-footer__list-item-link" href="#">Terms and conditions</a></li>
      </ul>
      <p class="nhsuk-footer__copyright">&copy; Crown copyright</p>
    </div>
  </div>
</footer>`;

// NHS toggle JavaScript
const nhsToggleScript = `
<script>
(function() {
  var btn = document.querySelector('.nhs-egg');
  var root = document.documentElement;
  var key = 'nhs-theme-active';

  // Restore saved preference
  if (localStorage.getItem(key) === 'true') {
    root.classList.add('nhs-theme');
  }

  btn.addEventListener('click', function() {
    root.classList.toggle('nhs-theme');
    localStorage.setItem(key, root.classList.contains('nhs-theme'));
  });
})();
</script>`;

// Generate HTML page
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Matthew Honeyman - CV</title>
  <meta name="description" content="Personal website and CV of Matthew Honeyman">
  <style>${css}</style>
</head>
<body>
  ${nhsHeader}
  <div class="nhsuk-width-container">
    <main class="nhsuk-main-wrapper" id="main-content" role="main">
      <div class="nhsuk-grid-row">
        <div class="nhsuk-grid-column-two-thirds">
          <div class="cv-content">
            ${cvHtml}
          </div>
        </div>
      </div>
    </main>
  </div>
  ${nhsFooter}
  <button class="nhs-egg" aria-label="Toggle NHS theme" title="Toggle NHS theme">
    ${nhsLogoSvg}
  </button>
  ${nhsToggleScript}
</body>
</html>`;

// Write output
const outPath = path.join(DIST, 'index.html');
fs.writeFileSync(outPath, html);

console.log(`Built: ${outPath}`);
