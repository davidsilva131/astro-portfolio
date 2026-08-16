## Parent

#14 (PRD: Auto-sync Projects section from GitHub repos)

## What to build

A GitHub Actions workflow that triggers a Cloudflare Pages rebuild of the portfolio daily, so the Projects section (fed by the GitHub API at build time) refreshes even when no commit touches the repo:

- `.github/workflows/refresh-projects.yml` — `schedule` cron `0 0 * * *` (00:00 UTC) plus `workflow_dispatch` for manual refreshes; one job with a single step that POSTs to `secrets.CLOUDFLARE_PAGES_DEPLOY_HOOK_URL`.

The workflow file is the deliverable. The secret itself is a manual operational step (no Cloudflare CLI access on this machine):

1. Cloudflare dashboard → Pages → astro-portfolio project → Settings → Builds & deployments → Deploy hooks → Add deploy hook (name: `refresh-projects`) → copy URL.
2. `gh secret set CLOUDFLARE_PAGES_DEPLOY_HOOK_URL --repo davidsilva131/astro-portfolio` (paste the URL).
3. Test with Actions → Refresh Projects Section → Run workflow (workflow_dispatch).

## Acceptance criteria

- [ ] `.github/workflows/refresh-projects.yml` exists with cron `0 0 * * *` and `workflow_dispatch`.
- [ ] Workflow YAML parses (e.g. `python -c "import yaml; yaml.safe_load(...)"`).
- [ ] The manual secret setup steps are documented in the closing comment on this issue (the secret does not exist yet; the workflow will fail at runtime until it is added).

## Blocked by

#14
