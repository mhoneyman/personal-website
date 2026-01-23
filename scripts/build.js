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
  <main>
    ${cvHtml}
  </main>
</body>
</html>`;

// Write output
const outPath = path.join(DIST, 'index.html');
fs.writeFileSync(outPath, html);

console.log(`Built: ${outPath}`);
