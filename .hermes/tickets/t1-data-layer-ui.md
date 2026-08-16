## Parent

#14 (PRD: Auto-sync Projects section from GitHub repos)

## What to build

Replace the hardcoded projects array with the build-time data pipeline so the Things I've Built section auto-populates from davidsilva131's public GitHub repos:

1. `src/data/curated-projects.ts` — curated entries file: 3 standalone entries for private projects (LotoPetsPlay rank 0 flagship in-progress, Vikingos rank 1 in-progress with href, food-now) and 13 enrichment entries (11 public repos with the existing curated copy migrated, plus `Portafolio` with `href: ""` to clear its dead homepage).
2. `src/data/projects.ts` — `fetchPublicRepos()` (GitHub API, unauthenticated, `per_page=100&sort=pushed&type=public`), pure `buildProjects(repos)` (filter non-fork non-archived, merge curated by repo name, sort: ranked curated asc, then synced by pushed_at desc, then unranked curated), and `getProjects()` with graceful fallback (API failure → curated-only + console.warn).
3. `src/components/molecules/ProjectCard.astro` — `description` and `stack` become optional; empty values render no paragraph / no stack row. Everything else byte-identical.
4. `src/components/organisms/Projects.astro` — delete the hardcoded 14-entry array and the local interface; import `getProjects` and use `const projects = await getProjects();`. Keep the tinting, 4-visible + "Show N more" toggle, and all markup/script identical.
5. Commit the untracked design docs: `CONTEXT.md`, `docs/adr/0001-synced-projects-with-curated-overrides.md`, `docs/adr/0002-build-time-github-fetch-with-scheduled-rebuild.md`.

Exact code for every file is in the plan: `.hermes/plans/2026-08-16-projects-auto-sync.md` (Tasks 1-4). Follow it verbatim; do not improvise copy, stack lists, or ordering rules.

## Acceptance criteria

- [ ] `pnpm run build` exits 0.
- [ ] `grep -c "LotoPetsPlay" dist/index.html` >= 1 and `grep -c "wraplove" dist/index.html` >= 1 (curated flagship AND live API data both in the static HTML).
- [ ] `grep -o "Show [0-9]* more projects" dist/index.html` shows "Show 16 more projects" (20 cards total).
- [ ] `grep -rn -e "—" -e "–" src/` exits 1 (no em-dashes).
- [ ] Browser QA on `pnpm preview` (:4321): first card LotoPetsPlay (in-progress, pulse dot, no links), second Vikingos (in-progress, live demo link), toggle "Show 16 more projects" reveals the rest, focus management works as before.
- [ ] No dead links: every rendered href resolves (Ayverson → portfolio-ayverson.pages.dev, no `:8080` anywhere, no juandavidsilva.com).
- [ ] `CONTEXT.md` and `docs/adr/` committed (not left untracked).
- [ ] GitHub-facing artifacts in English; no test framework added.

## Blocked by

#14
