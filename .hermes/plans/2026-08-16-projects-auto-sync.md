# Projects Auto-Sync Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Make the "Things I've Built" section auto-populate from davidsilva131's public GitHub repos, so a new repository appears on the next scheduled rebuild without editing portfolio code.

**Architecture:** Build-time fetch (ADR 0002): `Projects.astro` calls `getProjects()` which fetches the GitHub API once during `astro build`, filters (no forks, no archived), merges the curated overrides file (ADR 0001), and sorts (ranked curated → synced by `pushed_at` desc → unranked curated). Freshness comes from a GitHub Actions cron (daily 00:00 UTC) that POSTs to the Cloudflare Pages deploy hook.

**Tech Stack:** Astro 6 static build, TypeScript, GitHub REST API (unauthenticated), GitHub Actions + Cloudflare Pages deploy hook.

**Decisions recorded in:** `CONTEXT.md`, `docs/adr/0001-synced-projects-with-curated-overrides.md`, `docs/adr/0002-build-time-github-fetch-with-scheduled-rebuild.md` (all untracked — committed under ticket T1).

**Ticket plan:** PRD parent issue; T1 = data layer + UI + docs commit; T2 = CI workflow. Chat in Spanish; every committed artifact in English. No test framework in this repo (repo convention PRD #5): verification = `pnpm run build` + browser QA.

---

## Task 1: Curated overrides data file

**Objective:** Create `src/data/curated-projects.ts` with the day-1 curated entries: 3 standalone (private projects) + 13 enrichment entries (11 public repos with migrated copy + Portafolio to clear its dead homepage).

**Files:**
- Create: `src/data/curated-projects.ts`

**Content** (complete file):

```ts
// Curated project entries — the hand-written side of the content model (ADR 0001).
// Two roles:
//   - Standalone entries (no `repo`): projects the GitHub API cannot provide
//     (private repos, other orgs). Always rendered.
//   - Enrichment entries (`repo` set): patch a synced repo's card with content
//     GitHub does not carry (description, stack, status, flagship, demo link).
// Merge rule: a field set here replaces the synced value; an empty string
// clears the synced value (e.g. a dead homepage). No em-dashes in copy.

export interface CuratedProject {
  /** GitHub repo name this entry enriches. Omit for standalone entries. */
  repo?: string;
  /** Display title; defaults to the repo name for synced entries. */
  title?: string;
  description: string;
  stack?: string[];
  status?: "completed" | "in-progress";
  href?: string;
  source?: string;
  flagship?: boolean;
  /** Lower floats to the top, before synced entries. Unranked entries go last. */
  rank?: number;
}

export const CURATED_PROJECTS: CuratedProject[] = [
  {
    title: "LotoPetsPlay",
    description:
      "Gaming platform themed around pets, featuring user accounts, match history, and real-time data management.",
    stack: ["Next.js", "Tailwind CSS", "Supabase"],
    status: "in-progress",
    flagship: true,
    rank: 0,
  },
  {
    title: "Vikingos",
    description: "VIKINGO'S motorcycle store: catalog, shopping flow and admin on Astro + Supabase.",
    stack: ["Astro", "Tailwind CSS", "Supabase"],
    status: "in-progress",
    href: "https://vikingos-production.up.railway.app",
    rank: 1,
  },
  {
    repo: "Mytodo-back",
    description: "REST API for a todo app: FastAPI, SQLAlchemy 2.0, Alembic migrations and JWT auth.",
    stack: ["FastAPI", "SQLAlchemy", "PostgreSQL", "JWT"],
  },
  {
    repo: "gh-dash",
    description: "GitHub personal dashboard aggregating repos, PRs and activity via the GitHub API.",
    stack: ["Astro", "React", "Tailwind CSS", "shadcn/ui", "GitHub API"],
  },
  {
    repo: "portfolio_ayverson",
    title: "VFX Ayverson",
    description:
      "Professional portfolio for a video designer and editor, showcasing a work gallery and personal brand presentation.",
    stack: ["Astro", "Tailwind CSS"],
    href: "https://portfolio-ayverson.pages.dev",
  },
  {
    repo: "recipes-ia",
    description:
      "Conversational AI recipe generator: chat with a virtual chef, save favorites, and cook with what you have.",
    stack: ["React", "TypeScript", "Tailwind CSS", "shadcn/ui", "Zustand", "AI"],
    href: "https://recipes-ia.davidsilva131.workers.dev/",
  },
  {
    repo: "ruleta-apuestas",
    description:
      "Roulette betting app with 30 themed numbers, automated game scheduling and an admin panel.",
    stack: ["Next.js", "TypeScript", "Tailwind CSS"],
  },
  {
    repo: "apk-divisas",
    description: "Cross-platform currency converter for Bs/USD/EUR with calculator and VAT modes.",
    stack: ["Flutter", "Dart"],
  },
  {
    repo: "academia-futbol",
    title: "Academia Eudalio Arriaga",
    description:
      "Registration landing for Academia de Delanteros Eudalio Arriaga, wiring player profiles to WhatsApp.",
    stack: ["Astro", "Tailwind CSS"],
    href: "https://academiaeudalioarriaga.com/",
  },
  {
    repo: "revil",
    description: "Landing page for an Instagram growth service built with Astro and React.",
    stack: ["Astro", "React", "Tailwind CSS", "TypeScript"],
    href: "https://revil.shop/",
  },
  {
    repo: "Cocktails-Next",
    description: "Cocktail catalog and search app built with Next.js.",
    stack: ["Next.js", "React", "Tailwind CSS"],
  },
  {
    repo: "Quiz-App-With-Zustand",
    description: "Quiz app with React and Zustand state management.",
    stack: ["React", "Zustand"],
  },
  {
    repo: "landing-tesol",
    description: "Marketing landing for a TESOL service (Next.js).",
    stack: ["Next.js", "React", "Tailwind CSS"],
  },
  {
    // Clears the dead homepage (juandavidsilva.com returns 404) so the card
    // keeps its source link only.
    repo: "Portafolio",
    description: "My Portfolio",
    stack: ["JavaScript"],
    href: "",
  },
  {
    title: "food-now",
    description: "Tracking app for meal deliveries to people living on the streets.",
    stack: ["JavaScript"],
    href: "https://food-now.vercel.app",
  },
];
```

**Verify:** `grep -rn -e "—" -e "–" src/data/` must exit 1 (no em-dashes in committed copy).

**Commit:** `docs: add CONTEXT.md and ADRs 0001-0002 (ticket #T1)` — no wait, this task is data only. Docs commit is separate (Task 7).

---

## Task 2: Fetch + merge module

**Objective:** Create `src/data/projects.ts`: `fetchPublicRepos()`, pure `buildProjects(repos)` merge function, and `getProjects()` with graceful fallback.

**Files:**
- Create: `src/data/projects.ts`

**Content** (complete file):

```ts
// Projects section data pipeline (ADR 0001, ADR 0002). At build time we fetch
// the account's public repos from the GitHub API, filter out forks and archived
// repos, merge curated overrides, and sort: ranked curated entries first, then
// synced repos by last push (most recent first), then unranked curated entries.
// If the API is unreachable the section degrades to curated entries only.

import { CURATED_PROJECTS, type CuratedProject } from "./curated-projects";

export interface Project {
  title: string;
  description?: string;
  stack: string[];
  status: "completed" | "in-progress";
  href?: string;
  source?: string;
  flagship: boolean;
}

const GITHUB_USER = "davidsilva131";
// One request covers the account (well under 100 public repos). Unauthenticated
// is fine: a single build makes 1-2 requests against the 60/hour IP limit.
const REPOS_URL = `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=pushed&type=public`;

interface GitHubRepo {
  name: string;
  description: string | null;
  homepage: string | null;
  language: string | null;
  html_url: string;
  pushed_at: string;
  fork: boolean;
  archived: boolean;
}

export async function fetchPublicRepos(): Promise<GitHubRepo[]> {
  const res = await fetch(REPOS_URL, {
    headers: { Accept: "application/vnd.github+json", "User-Agent": "astro-portfolio" },
  });
  if (!res.ok) throw new Error(`GitHub API responded ${res.status}`);
  return (await res.json()) as GitHubRepo[];
}

type SyncedEntry = Project & { name: string; pushedAt: string };

export function buildProjects(repos: GitHubRepo[]): Project[] {
  const synced: SyncedEntry[] = repos
    .filter((r) => !r.fork && !r.archived)
    .map((r) => ({
      name: r.name,
      pushedAt: r.pushed_at,
      title: r.name,
      description: r.description ?? undefined,
      stack: r.language ? [r.language] : [],
      status: "completed" as const,
      href: r.homepage ?? undefined,
      source: r.html_url,
      flagship: false,
    }));

  const byName = new Map(synced.map((s) => [s.name, s]));
  const merged: { project: Project; rank?: number; pushedAt: string }[] = [];

  for (const curated of CURATED_PROJECTS) {
    const target = curated.repo ? byName.get(curated.repo) : undefined;
    if (curated.repo && !target) continue; // repo gone or no longer in the public feed
    const project: Project = target
      ? {
          ...target,
          title: curated.title ?? target.title,
          description: curated.description ?? target.description,
          stack: curated.stack ?? target.stack,
          status: curated.status ?? target.status,
          href: curated.href !== undefined ? curated.href || undefined : target.href,
          source: curated.source ?? target.source,
          flagship: curated.flagship ?? target.flagship,
        }
      : {
          title: curated.title ?? "Untitled",
          description: curated.description,
          stack: curated.stack ?? [],
          status: curated.status ?? "completed",
          href: curated.href || undefined,
          source: curated.source,
          flagship: curated.flagship ?? false,
        };
    merged.push({ project, rank: curated.rank, pushedAt: target?.pushedAt ?? "" });
  }

  for (const s of synced) {
    if (!CURATED_PROJECTS.some((c) => c.repo === s.name)) {
      merged.push({ project: s, pushedAt: s.pushedAt });
    }
  }

  const ranked = merged
    .filter((m) => m.rank !== undefined)
    .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));
  const syncedOnly = merged
    .filter((m) => m.rank === undefined && m.pushedAt !== "")
    .sort((a, b) => b.pushedAt.localeCompare(a.pushedAt));
  const unranked = merged.filter((m) => m.rank === undefined && m.pushedAt === "");

  return [...ranked, ...syncedOnly, ...unranked].map((m) => m.project);
}

export async function getProjects(): Promise<Project[]> {
  try {
    return buildProjects(await fetchPublicRepos());
  } catch (err) {
    console.warn("[projects] GitHub API fetch failed, rendering curated entries only:", err);
    return buildProjects([]);
  }
}
```

**Verify:** `pnpm run build` passes after Task 4 wires it up.

---

## Task 3: ProjectCard optional fields

**Objective:** Make `description` and `stack` optional in `src/components/molecules/ProjectCard.astro` so bare synced cards (no GitHub description) render cleanly.

**Files:**
- Modify: `src/components/molecules/ProjectCard.astro`

**Changes:**
1. Props interface: `description?: string;` and `stack?: string[];`
2. Destructure: `description, stack = [],`
3. Description paragraph: `{description && (<p class="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{description}</p>)}`
4. Stack row: wrap in `{stack.length > 0 && (...)}`

Keep everything else (tinted covers, split title, status label, links row, overlay) byte-identical.

---

## Task 4: Projects section consumes the pipeline

**Objective:** Replace the hardcoded array in `src/components/organisms/Projects.astro` with `await getProjects()`.

**Files:**
- Modify: `src/components/organisms/Projects.astro`

**Changes:**
1. Delete the local `interface Project` and the `const projects: Project[] = [...]` block (14 entries).
2. Add imports: `import { getProjects } from "../../data/projects";`
3. Add: `const projects = await getProjects();`
4. Keep `isTinted`, `visibleItems = projects.slice(0, 4)`, `hiddenItems`, toggle markup and script exactly as they are.

**Verify (full build + QA):**
1. `pnpm run build` — must exit 0.
2. `grep -o "LotoPetsPlay" dist/index.html | head -1` — present.
3. `grep -o "wraplove" dist/index.html | head -1` — present (proves the live API feed is in the HTML).
4. `grep -o "Show [0-9]* more projects" dist/index.html` — expect "Show 16 more projects" (20 cards: 3 standalone curated + 17 public non-fork repos).
5. `grep -rn -e "—" -e "–" src/` — exit 1 (em-dash hygiene).
6. Browser QA: `pnpm preview` on :4321, assert first card is LotoPetsPlay, second Vikingos; toggle reveals the rest; links work (source → github.com, hrefs → validated live URLs).

---

## Task 5: Scheduled rebuild workflow

**Objective:** Create `.github/workflows/refresh-projects.yml` that triggers a Cloudflare Pages rebuild daily at 00:00 UTC (ADR 0002), with a manual `workflow_dispatch` fallback.

**Files:**
- Create: `.github/workflows/refresh-projects.yml`

**Content** (complete file):

```yaml
name: Refresh Projects Section

on:
  schedule:
    - cron: "0 0 * * *"
  workflow_dispatch: {}

jobs:
  rebuild:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Cloudflare Pages deploy hook
        run: curl -sf -X POST "${{ secrets.CLOUDFLARE_PAGES_DEPLOY_HOOK_URL }}"
```

**Verify:** `python -c "import yaml,sys; yaml.safe_load(open('.github/workflows/refresh-projects.yml')); print('yaml ok')"` or `npx --yes yaml-lint` if available. Note: the secret does NOT exist yet — the workflow only errors at runtime, not parse time.

**Operational (manual, David — cannot be automated from this machine):**
1. Cloudflare dashboard → Pages → astro-portfolio project → Settings → Builds & deployments → Deploy hooks → Add deploy hook → name `refresh-projects`, copy the URL.
2. `gh secret set CLOUDFLARE_PAGES_DEPLOY_HOOK_URL --repo davidsilva131/astro-portfolio` (paste URL).
3. Test: GitHub → Actions → Refresh Projects Section → Run workflow, or wait for the daily cron.

---

## Task 6: Commit sequence (orchestrator)

1. `git add CONTEXT.md docs/ && git commit -m "docs: add CONTEXT.md and ADRs 0001-0002 (ticket #T1)"`
2. `git add src/data/curated-projects.ts && git commit -m "feat: curated overrides for projects section (ticket #T1)"`
3. `git add src/data/projects.ts && git commit -m "feat: build-time GitHub sync for projects section (ticket #T1)"`
4. `git add src/components/molecules/ProjectCard.astro src/components/organisms/Projects.astro && git commit -m "feat: render synced projects in Things I've Built (ticket #T1)"`
5. `git add .github/workflows/refresh-projects.yml && git commit -m "ci: scheduled Cloudflare Pages rebuild for projects refresh (ticket #T2)"`
6. Push, then close T1 with "Implemented in <sha>" (T1 commit SHAs), close T2 noting the manual secret step.

## Risks / open items

- **Noise repos appear** (davidsilva131 profile README, portafolio_v2, sprint4, astro-portfolio): accepted trade-off of ADR 0001 ("all public repos"). Follow-up option (not in scope): a `hidden` flag in the curated file.
- **Vikingos href** changed from the stale `:8080` form to the validated `https://vikingos-production.up.railway.app` (200).
- **Ayverson href** fixed from dead `vfx-ayverson.davidsilvac131.workers.dev` (404, typo domain) to `https://portfolio-ayverson.pages.dev` (200).
- **`Portafolio` repo** has a dead homepage (`juandavidsilva.com` → 404): cleared via `href: ""` override.
- **Cron only triggers a rebuild**; the deploy hook URL is a secret David must add once (Task 5 operational).
