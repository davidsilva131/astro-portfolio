# PRD: Auto-sync Projects section from GitHub repos

## Problem Statement

The "Things I've Built" section hardcodes 14 projects in `src/components/organisms/Projects.astro`. Every new repository requires editing code and redeploying manually. The user wants new GitHub repos to appear in the portfolio automatically, without touching the codebase.

## Solution

Replace the hardcoded array with a build-time data pipeline:

1. `src/data/projects.ts` fetches the account's public repos from the GitHub API during `astro build`, filters out forks and archived repos, and maps them to cards (title = repo name, stack = language, source = repo URL, href = repo homepage when set).
2. `src/data/curated-projects.ts` is the hand-written curated file with two roles (ADR 0001): standalone entries for projects the API cannot provide (private repos: LotoPetsPlay, Vikingos, food-now) and enrichment entries that patch any synced repo with content GitHub does not carry (description, stack, in-progress status, flagship flag, demo link).
3. Ordering: ranked curated entries first (LotoPetsPlay flagship at top), then synced repos by last push (most recent first), then unranked curated entries.
4. Freshness (ADR 0002): a GitHub Actions workflow runs daily at 00:00 UTC and POSTs to the Cloudflare Pages deploy hook, rebuilding the static site. Manual `workflow_dispatch` trigger available.

## User Stories

- As David, when I create a new public GitHub repo, it appears in my portfolio within 24h without editing portfolio code.
- As a visitor, I see a Projects section that always lists my latest work, with rich cards where descriptions exist and clean minimal cards where they do not.
- As David, I can curate any project (private or public) via a data file that never requires touching component code.

## Implementation Decisions

- Build-time fetch (static HTML, no JS, no CSP changes), not client-side fetching (ADR 0002).
- All public repos, filtered to non-fork, non-archived; curated overrides merged by repo name (ADR 0001).
- GitHub API unauthenticated: 1-2 requests per build, well under the 60/hour limit. No secrets in the site pipeline.
- Graceful fallback: if the API fails at build time, the section renders curated entries only, with a console warning.
- Empty GitHub descriptions render as no paragraph; empty stack renders as no row (ProjectCard fields become optional).
- Existing curated copy for the 11 featured public repos is migrated into the curated file so the section loses no quality on day 1. Dead links found during migration were replaced: Ayverson demo now `https://portfolio-ayverson.pages.dev` (old workers.dev URL is 404), Vikingos drops the stale `:8080` port, and the `Portafolio` repo's dead homepage (`juandavidsilva.com`, 404) is cleared via an empty-string override.

## Testing Decisions

No test framework in this repo (repo convention): verification is `pnpm run build` + browser QA of the built output. Checks: build exits 0; `dist/index.html` contains a synced repo name from the live API (e.g. `wraplove`) and the curated flagship (`LotoPetsPlay`); "Show N more" toggle counts 20 cards (17 synced + 3 standalone curated); em-dash scan over `src/` stays clean; browser QA asserts order (LotoPetsPlay, Vikingos first) and working links.

## Out of Scope

- Hiding specific public repos (profile README repo, old portfolio versions, school projects) via a blocklist or `hidden` flag. They will appear as synced cards; this is the accepted trade-off of "all public repos". A `hidden` flag can be added later in the curated file.
- Fetching private repos via a fine-grained PAT (rejected in ADR 0001: credential in the build pipeline for marginal gain).
- Client-side refresh/hybrid rendering (rejected in ADR 0002).
- The Cloudflare Pages deploy hook secret itself (manual step: add a deploy hook in the CF dashboard, then `gh secret set CLOUDFLARE_PAGES_DEPLOY_HOOK_URL`).

## Further Notes

- Design docs produced by the grilling session: `CONTEXT.md` (glossary: Project, Synced project, Curated project, Source of truth) and ADRs 0001-0002 under `docs/adr/`. Committed under ticket T1.
- Implementation plan: `.hermes/plans/2026-08-16-projects-auto-sync.md`.
