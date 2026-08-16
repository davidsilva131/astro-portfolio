Implemented in `255610b` (plus `d62fe7c`, `c5fac79`, `9f94b72`).

The Things I've Built section now syncs from the account's public GitHub repos at build time:

- `src/data/curated-projects.ts` — curated entries: standalone entries for private projects (LotoPetsPlay, Vikingos, food-now) and enrichment for public repos (migrated copy, dead-homepage cleanup for Portafolio, landing-tesol, Quiz-App-With-Zustand, Cocktails-Next, sprint4).
- `src/data/projects.ts` — GitHub API fetch (optional `GITHUB_TOKEN`/`GH_TOKEN` env honored), filter (no forks, no archived), merge, sort (ranked curated -> pushed_at desc -> unranked curated), graceful fallback to curated-only on API failure.
- `ProjectCard` — description/stack now optional (bare synced cards render cleanly).
- `Projects.astro` — consumes `getProjects()`; toggle and tinting unchanged.
- Design docs committed: `CONTEXT.md`, ADRs 0001-0002.

Verification: `pnpm run build` exit 0; 20 cards rendered (3 curated + 17 synced); live API data present in static HTML; all rendered demo/source links validated live; em-dash scan clean.
