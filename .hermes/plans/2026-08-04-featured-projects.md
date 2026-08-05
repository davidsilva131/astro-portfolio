# Expand Featured Projects Implementation Plan

> **For Hermes:** Implement this plan task-by-task via delegation (TDD where a test framework exists; this is a static Astro site, so verification is `pnpm run build` + browser QA).

**Goal:** Populate the Featured Projects section with every real project the author has built, each with accurate stack, status, and live/repo links.

**Architecture:** Single two-column card grid (as today). `ProjectCard` gains two optional link types (live demo `href`, GitHub `source`). Data is a static array in `Projects.astro` sourced from the GitHub API (languages, README summaries, validated live URLs).

**Tech Stack:** Astro 6, Tailwind CSS v4, TypeScript (`.astro` components). No test framework; verify with `pnpm run build`.

---

## Task 1: Extend ProjectCard with optional live + source links

**Objective:** Let each project card carry an optional live-demo link and an optional GitHub source link.

**Files:**
- Modify: `src/components/molecules/ProjectCard.astro`

**Steps:**
1. Add `source?: string` to the `Props` interface (keep `href?: string` as the live-demo link).
2. In the title row, render an external-arrow `<a>` when `href` exists (already present), and add a GitHub-mark `<a href={source} target="_blank" rel="noopener noreferrer">` when `source` exists. `aria-label` = `"View {title} source on GitHub"`. Use the standard GitHub mark SVG path (octocat), inline, `aria-hidden` on the svg, matching the existing icon style (`h-4 w-4`, `text-zinc-400 hover:text-cyan-600`).
3. Keep index number, status badge, title, description, stack badges exactly as they render today.

**Verify:** `pnpm run build` still passes; no layout regression.

## Task 2: Populate the projects data

**Objective:** List all real own-work projects with accurate stack/status/links.

**Files:**
- Modify: `src/components/organisms/Projects.astro`

**Steps:**
1. Extend the `projects` array with these entries (order = relevance; stack from repo manifests; live URLs only where verified 200):

| title | description | stack | status | href (live) | source (repo) |
|---|---|---|---|---|---|
| LotoPetsPlay | Gaming platform themed around pets with accounts, match history and real-time data. | Next.js, Tailwind CSS, Supabase | in-progress | — | — |
| gh-dash | GitHub personal dashboard aggregating repos, PRs and activity via the GitHub API. | Astro, React, Tailwind CSS, shadcn/ui, GitHub API | completed | — | https://github.com/davidsilva131/gh-dash |
| Vikingos | VIKINGO'S motorcycle store: catalog, shopping flow and admin on Astro + Supabase. | Astro, Tailwind CSS, Supabase | in-progress | https://vikingos-production.up.railway.app | — |
| VFX Ayverson | Portfolio for a video designer and editor with a work gallery and brand presentation. | Astro, Tailwind CSS | completed | https://vfx-ayverson.davidsilvac131.workers.dev/ | — |
| recipes-ia | Conversational AI recipe generator: chat with a virtual chef, save favorites, cook with what you have. | React, TypeScript, Tailwind CSS, shadcn/ui, Zustand, AI | completed | — | https://github.com/davidsilva131/recipes-ia |
| ruleta-apuestas | Roulette betting app with 30 themed numbers, automated game scheduling and an admin panel. | Next.js, TypeScript, Tailwind CSS | completed | — | https://github.com/davidsilva131/ruleta-apuestas |
| Mytodo-back | REST API for a todo app: FastAPI, SQLAlchemy 2.0, Alembic migrations and JWT auth. | FastAPI, SQLAlchemy, PostgreSQL, JWT | completed | — | https://github.com/davidsilva131/Mytodo-back |
| apk-divisas | Cross-platform currency converter for Bs/USD/EUR with calculator and VAT modes. | Flutter, Dart | completed | — | https://github.com/davidsilva131/apk-divisas |
| academia-futbol | Registration landing for Academia de Delanteros Eudalio Arriaga, wiring player profiles to WhatsApp. | Astro, Tailwind CSS | completed | — | https://github.com/davidsilva131/academia-futbol |
| revil | Landing page for an Instagram growth service built with Astro and React. | Astro, React, Tailwind CSS, TypeScript | completed | — | https://github.com/davidsilva131/revil |
| Cocktails-Next | Cocktail catalog and search app built with Next.js. | Next.js, React, Tailwind CSS | completed | — | https://github.com/davidsilva131/Cocktails-Next |
| Quiz-App-With-Zustand | Quiz app with React and Zustand state management. | React, Zustand | completed | — | https://github.com/davidsilva131/Quiz-App-With-Zustand |
| landing-tesol | Marketing landing for a TESOL service (Next.js). | Next.js, React, Tailwind CSS | completed | — | https://github.com/davidsilva131/landing-tesol |
| food-now | Tracking app for meal deliveries to people living on the streets. | JavaScript | completed | https://food-now.vercel.app | — |

2. Keep the existing `grid grid-cols-1 gap-4 sm:grid-cols-2` wrapper and the `index` prop for reveal stagger.
3. Add below the grid a "More on GitHub" link: `https://github.com/davidsilva131?tab=repositories` (`target="_blank"`, styled as a subtle text link with the existing ghost style).

**Verify:** `pnpm run build` passes; the section renders ~14 cards.

## Task 3: Build + browser QA

**Objective:** Prove the shipped UI works, not just builds.

**Steps:**
1. Run `pnpm run build` — must complete with 0 errors (Astro + Tailwind).
2. `pnpm preview --port 4321` then open `http://localhost:4321/`: confirm 14 cards, live links open (200), repo links resolve, no console errors, light and dark themes render, mobile grid collapses to 1 column.
3. Confirm zero em-dashes (`—`) in the new strings; use hyphens.

**Verify:** Real browser pass, report results.

## Task 4: Commit

**Objective:** Land the work cleanly.

**Steps:**
1. Stage only the feature files (`src/components/molecules/ProjectCard.astro`, `src/components/organisms/Projects.astro`) plus any lint fixes.
2. Commit in English referencing the ticket: `feat: populate featured projects with all real repos (ticket #<N>)`.
3. Do NOT push unless asked; report the SHA.

---

## Risks / Open questions
- Live URLs for Vikingos/food-now verified 200 at implementation time; re-verify before shipping.
- The tree contains other uncommitted redesign/SEO work from the same session — the commit above should be scoped to the featured-projects files; the author decides when to commit the rest.
