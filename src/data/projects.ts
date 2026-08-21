// Projects section data pipeline (ADR 0001, ADR 0002). At build time we fetch
// the account's public repos from the GitHub API, filter out forks and archived
// repos, merge curated overrides, and sort: ranked curated entries first, then
// synced repos by last push (most recent first), then unranked curated entries.
// If the API is unreachable the section degrades to curated entries only.
//
// Uses node:https instead of fetch() on purpose: undici (Node's fetch) leaves a
// socket handle open at process exit and crashes Node on Windows after Astro
// builds (libuv "async.c, line 76" assertion). The https module has no
// connection pool, so teardown is clean everywhere.

import https from "node:https";
import { CURATED_PROJECTS } from "./curated-projects";

export interface Project {
  title: string;
  description?: string;
  stack: string[];
  status: "completed" | "in-progress";
  art?: string;
  href?: string;
  source?: string;
  flagship: boolean;
}

const GITHUB_USER = "davidsilva131";
// One request covers the account (well under 100 public repos). Unauthenticated
// is the default; an optional GITHUB_TOKEN/GH_TOKEN env var is honored when
// present, since shared build IPs can exhaust the anonymous 60/hour limit.
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
  const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "astro-portfolio",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const raw = await new Promise<string>((resolve, reject) => {
    const req = https.get(REPOS_URL, { headers }, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk: string) => (body += chunk));
      res.on("end", () => {
        if (res.statusCode && res.statusCode >= 400) {
          const detail = body.trim().slice(0, 200);
          reject(new Error(`GitHub API responded ${res.statusCode}: ${detail}`));
          return;
        }
        resolve(body);
      });
    });
    req.on("error", reject);
  });

  return JSON.parse(raw) as GitHubRepo[];
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
          art: curated.art ?? target.art,
        }
      : {
          title: curated.title ?? "Untitled",
          description: curated.description,
          stack: curated.stack ?? [],
          status: curated.status ?? "completed",
          href: curated.href || undefined,
          source: curated.source,
          flagship: curated.flagship ?? false,
          art: curated.art,
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
