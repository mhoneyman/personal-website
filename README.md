# Personal Website

A minimal static site that converts your CV from Markdown to HTML.

## Quick Start

```bash
npm install
npm run build
```

Open `docs/index.html` to preview locally.

## Editing Your CV

Edit `src/cv.md` in any text editor, then run `npm run build`.

## Deployment

1. Push this repo to GitHub
2. Go to repo Settings → Pages
3. Set Source to "Deploy from branch"
4. Select `main` branch and `/docs` folder
5. Save

Every push to `main` will automatically rebuild and deploy.

## Structure

```
├── src/cv.md          # Your CV in Markdown (edit this)
├── css/style.css      # Styling
├── scripts/build.js   # Converts MD → HTML
└── docs/              # Built site (served by GitHub Pages)
```
