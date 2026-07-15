# AGENTS.md — peleccom.github.io

Personal GitHub Pages site for Alexander Pitkin. Jekyll static site, Minimal Mistakes remote theme v4.28.0.

## Dev server (Docker only)

Ruby/Jekyll are NOT installed on the host. Everything runs in Docker.

```bash
docker compose up -d          # start dev server at http://localhost:4000
docker compose logs -f        # follow Jekyll rebuild logs
docker compose restart         # restart after Gemfile changes
```

The container auto-rebuilds on file changes (`--watch --force_polling`).

## Architecture

- **Data-driven content** — structured data in `_data/*.yml`:
  - `skills.yml` — ~70 skills across 8 sections, each with `name`, `icon`, `description`
  - `terminal.yml` — terminal hero schemes and command lines
  - `navigation.yml` — site nav items
- **Pages** use `layout: single` with `author_profile: true` (except blog which uses `layout: posts`)
- **`_includes/`** — page-level includes: `tech-stack.html` (skills grid), `terminal-hero.html` (homepage), `project-cards.html` (hardcoded), `head/custom.html` (FA kit + favicons)
- **Terminal** (`_includes/terminal-hero.html` + `assets/js/terminal.js`) — jQuery Terminal v2.46.1 widget. Single JS file handles virtual filesystem, boot animation, tab completion, and interactive commands. Config driven by `_data/terminal.yml`.
- **`assets/css/main.scss`** — all custom styles. Imports Minimal Mistakes theme first, then overrides.
- **CV page** (`alexander_pitkin_cv.html`) is a redirect to https://rxresu.me/peleccom/alexander-pitkin-cv

## Icon system

- Icons from [xandemon/developer-icons](https://github.com/xandemon/developer-icons) via jsDelivr CDN (`@v7.0.1`)
- Font Awesome fallback for icons with `fa-` or `fab-` prefix
- To check availability: probe `https://cdn.jsdelivr.net/gh/xandemon/developer-icons@v7.0.1/icons/{name}.svg`
- All icon lookups go through `_data/skills.yml`

## Google Analytics

- Only enabled in production (GitHub Pages). Locally disabled.
- Handled by Minimal Mistakes' built-in analytics (jekyll.environment guard), not a custom snippet
- Tracking ID set in `_config.yml` under `analytics.google.tracking_id`

## LinkedIn badge

- Two placements: sidebar (`linkedin-badge-wrapper`, hidden on mobile) and homepage bottom (`linkedin-badge-bottom`, hidden on desktop)
- Controlled via CSS media queries in `assets/css/main.scss`

## What's NOT here

- No tests, no CI configuration, no build step beyond `jekyll build`
- No linting, type checking, codegen, or JS bundler
- No database, API server, or dynamic state
