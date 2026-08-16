# Projects section refresh: build-time GitHub fetch + scheduled Cloudflare Pages rebuild

The portfolio is a fully static Astro site deployed on Cloudflare Pages. To make new repositories appear without code edits, the Projects section fetches the account's public repos from the GitHub API during `astro build` and renders the cards into the static HTML. Freshness comes from a GitHub Actions scheduled workflow that POSTs to the Cloudflare Pages deploy hook, triggering a rebuild.

We rejected client-side fetching (JS in the browser calls api.github.com on page load) because the site is deliberately static and typographic: it would make the section JS-dependent, require opening `connect-src` in the CSP, break the no-JS experience, and add layout shift. A rebuild delay of hours is an acceptable price for keeping the section static. The deploy hook URL lives as a GitHub Actions secret — the site itself needs no required environment variables.

Two refinements from implementation: (1) the fetch honors an optional `GITHUB_TOKEN`/`GH_TOKEN` env var when present, because shared build IPs can exhaust the anonymous 60/hour rate limit (observed in practice); unauthenticated remains the default. (2) The request uses Node's `https` module instead of `fetch()`: undici leaves a socket handle open at process exit and crashes Node on Windows after Astro builds (libuv "async.c, line 76" assertion, exit code 3221226505). If the API is unreachable, the section degrades to curated entries only, with a console warning.

Status: accepted
