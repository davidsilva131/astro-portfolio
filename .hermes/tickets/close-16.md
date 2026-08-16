Implemented in `6f9056b`.

`.github/workflows/refresh-projects.yml` now triggers a Cloudflare Pages rebuild daily at 00:00 UTC (cron `0 0 * * *`), plus a manual `workflow_dispatch` trigger, by POSTing to `secrets.CLOUDFLARE_PAGES_DEPLOY_HOOK_URL`.

**One manual step remains (cannot be automated from this machine — no Cloudflare CLI access):**

1. Cloudflare dashboard → Pages → astro-portfolio project → Settings → Builds & deployments → Deploy hooks → **Add deploy hook** (name: `refresh-projects`) → copy the URL.
2. Set the secret so the workflow can use it:
   `gh secret set CLOUDFLARE_PAGES_DEPLOY_HOOK_URL --repo davidsilva131/astro-portfolio` (paste the URL).
3. Test: Actions → **Refresh Projects Section** → **Run workflow** (or wait for the daily cron). Note: until the secret exists, the workflow run will fail at the curl step.

Optional (recommended if builds ever hit GitHub API rate limits): add a `GITHUB_TOKEN` env var in the Cloudflare Pages project settings (Settings → Environment variables). The site fetch honors it when present; anonymous works fine otherwise.
