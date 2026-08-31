# Poolamkoo brand assets

These files use the final SVG artwork supplied for the Poolamkoo identity.

- `poolamkoo-mark.svg` — exact symbol-only SVG master supplied by the project owner. This is the canonical product mark.
- `poolamkoo-dark.svg` — supplied dark-background mark composition.
- `poolamkoo-fa-lockup.svg` — supplied Persian wordmark composition for static/marketing use.
- `poolamkoo-en-lockup.svg` — supplied English wordmark composition for static/international use.

## Runtime decision

The installed PWA/app launcher uses **the symbol only, with no typography**. Launchers already render the app name and wordmarks become unreadable at small sizes or inside maskable crops.

Inside the web app the exact `poolamkoo-mark.svg` is used as a CSS mask and colored with `bg-primary`, so the owner-supplied geometry stays unchanged while the mark follows the active theme.

Expanded product surfaces should pair the mark with the Persian name `پولم‌کو`. `Poolamkoo` remains the canonical Latin spelling for GitHub, URLs, repository metadata and international references. The supplied Persian/English lockup SVGs are kept for static brand/marketing artwork rather than small runtime navigation icons.
