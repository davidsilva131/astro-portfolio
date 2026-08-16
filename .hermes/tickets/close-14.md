Feature shipped. Implementation: tickets #15 (`255610b`) and #16 (`6f9056b`).

Delivered:
- Projects section auto-syncs from the account's public GitHub repos at build time (ADR 0001 content model + ADR 0002 refresh mechanism).
- Curated overrides file for private projects and enrichment (`src/data/curated-projects.ts`).
- Daily 00:00 UTC rebuild via Cloudflare Pages deploy hook (pending the manual secret setup documented in #16).
- Design docs in repo: `CONTEXT.md`, `docs/adr/0001-*`, `docs/adr/0002-*`.

Verified: `pnpm run build` exit 0, 20 cards rendered, live API data in static HTML, all links validated, em-dash scan clean.
