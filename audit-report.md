# Audit Report — my-portfolio
**Date**: March 25, 2026
**Auditor**: Audit Report Agent
**Summary**: 0 critical, 2 high, 4 medium, 4 low findings across security, accessibility, and performance.

---

## Security

### [SEC-01] Missing HTTP Security Headers — High
- **File**: `astro.config.mjs` (line 6)
- **Issue**: No security headers are configured. The Astro `server.headers` / Vite `server.headers` option is absent, meaning the deployed site will serve pages without:
  - `Content-Security-Policy` (CSP) — leaves the door open to XSS injection of third-party scripts.
  - `X-Frame-Options: DENY` — the page can be embedded in an iframe on any origin (clickjacking risk).
  - `X-Content-Type-Options: nosniff` — browsers may MIME-sniff responses.
  - `Referrer-Policy: strict-origin-when-cross-origin` — full URL may leak to third-party origins.
- **Recommendation**: Add a `headers` block to `astro.config.mjs`:
  ```js
  export default defineConfig({
    vite: { plugins: [tailwindcss()] },
    server: {
      headers: {
        "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
        "X-Frame-Options": "DENY",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
    },
  });
  ```
  For static hosting (Netlify, Vercel, Cloudflare Pages) also add the equivalent `_headers` or `vercel.json` rules, as Astro's dev-server headers do not apply at build time.

### [SEC-02] Placeholder External URLs Hardcoded in Source — Low
- **File**: `src/components/organisms/Contact.astro` (lines 22, 29, 36)
- **Issue**: The component ships with `href="https://github.com/yourusername"` and `href="https://linkedin.com/in/yourusername"` as placeholder values. If the site were deployed before these are replaced the links would resolve to real third-party profiles (whoever owns those slugs), which could mislead visitors or expose them to unintended content.
- **Recommendation**: Replace placeholder values with real URLs before any deployment. Consider adding a build-time environment variable check (e.g., via `.env`) or a TypeScript assertion that throws if the placeholder strings are still present.

---

## Accessibility

### [A11Y-01] Missing Skip-Navigation Link — High
- **File**: `src/layouts/Layout.astro` (line 31 — `<body>` opening)
- **Issue**: There is no "Skip to main content" link at the top of the page. Keyboard-only users and screen-reader users must tab through every nav item on every page load before reaching any content. This violates WCAG 2.1 Success Criterion 2.4.1 (Bypass Blocks) at Level A.
- **Recommendation**: Add a visually hidden but focusable skip link as the very first child of `<body>`:
  ```html
  <a
    href="#main-content"
    class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-white focus:text-zinc-900 focus:rounded focus:outline focus:outline-2 focus:outline-cyan-500"
  >
    Skip to main content
  </a>
  ```
  And add `id="main-content"` to the `<main>` element in `src/pages/index.astro`.

### [A11Y-02] Mobile Navigation Inaccessible — High
- **File**: `src/components/organisms/Nav.astro` (line 27)
- **Issue**: The `<ul>` nav link list is hidden on small screens with `hidden sm:flex`. There is no hamburger menu, drawer, or any alternative navigation provided for viewports below `640px`. Keyboard users and screen-reader users on mobile cannot navigate between sections at all.
- **Recommendation**: Implement a mobile menu (a `<button>` that toggles a full-screen or drop-down nav list) or at minimum expose the nav links in a collapsed vertical list on small screens. Ensure the toggle button has a descriptive `aria-label` and the controlled element has `aria-expanded` state.

### [A11Y-03] `text-zinc-500` Fails WCAG AA Contrast on Light Background — Medium
- **File**: `src/components/organisms/Nav.astro` (line 33), `src/components/organisms/Hero.astro` (line 16), `src/components/organisms/Contact.astro` (line 24), `src/components/organisms/Footer.astro` (line 7)
- **Issue**: `text-zinc-500` maps to `#71717a`. On a white (`#ffffff`) background the contrast ratio is approximately **4.48:1**, which falls just below the WCAG 2.1 AA threshold of **4.5:1** for normal text (SC 1.4.3). Affected elements include nav links, the skills list in the hero, the email link in contact, and the footer copyright.
- **Recommendation**: Replace `text-zinc-500` with `text-zinc-600` (`#52525b`, ~7.0:1 contrast on white) for all body-sized text in light mode. Reserve `text-zinc-500` for decorative separators or text above 18px bold / 24px regular (Large Text threshold of 3:1).

### [A11Y-04] Nav Links Missing Focus-Visible Styles — Medium
- **File**: `src/components/organisms/Nav.astro` (line 33)
- **Issue**: The anchor links in the nav only carry `hover:` color-change states. They have no `focus-visible:outline` or equivalent, so keyboard users tabbing through the nav receive no visible focus indicator on those links. Tailwind's preflight resets native outline styles, making this a regression from the browser default. Violates WCAG 2.1 SC 2.4.7 (Focus Visible, Level AA).
- **Recommendation**: Add explicit focus styles to nav links:
  ```html
  class="... focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 rounded-sm"
  ```

### [A11Y-05] `<section>` Elements Lack Accessible Names — Low
- **File**: `src/components/organisms/Experience.astro` (line 32), `src/components/organisms/Projects.astro` (line 37), `src/components/organisms/Resume.astro` (line 5), `src/components/organisms/Contact.astro` (line 4)
- **Issue**: Each `<section>` has an `id` but no `aria-labelledby` pointing to its heading. Screen readers announce these as generic "region" landmarks with no name, making it harder to navigate by landmark. WCAG 2.1 SC 1.3.6 (Identify Purpose, Level AAA) and best practice for SC 1.3.1.
- **Recommendation**: Add `aria-labelledby` referencing the section's heading `id`:
  ```html
  <section id="experience" aria-labelledby="experience-heading">
    <h2 id="experience-heading">Projects I've Worked On</h2>
  ```

### [A11Y-06] `<nav>` Missing `aria-label` — Low
- **File**: `src/components/organisms/Nav.astro` (line 18)
- **Issue**: The `<nav>` element inside `<header>` has no `aria-label` attribute. While this is not critical when only one `<nav>` exists, it is best practice and required to become WCAG-conformant if a second nav (e.g., footer nav) is added later.
- **Recommendation**: Add `aria-label="Main navigation"` to the `<nav>` element.

---

## Performance

### [PERF-01] CV PDF Files Missing from `/public` — Medium
- **File**: `src/components/organisms/Resume.astro` (lines 23, 27)
- **Issue**: `Button` components link to `/cv-en.pdf` and `/cv-es.pdf`, but neither file exists in the `public/` directory. All download buttons on the Resume section are silently broken; users will receive a 404 response. This directly degrades user experience and Core Web Vitals (failed navigations affect engagement metrics).
- **Recommendation**: Add `cv-en.pdf` and `cv-es.pdf` to `public/`. Until the files are ready, disable or visually indicate the buttons as "coming soon" to avoid broken interactions.

### [PERF-02] `transition-colors duration-300` on `<body>` — Low
- **File**: `src/layouts/Layout.astro` (line 30)
- **Issue**: The `transition-colors` utility is applied to the `<body>` element, which means every color-bearing CSS property on every descendant participates in a 300ms transition whenever the dark/light class toggles. While the visual effect is intentional, this triggers a browser repaint cascade across the entire DOM each time the theme changes. On low-end devices this can cause a perceptible jank spike.
- **Recommendation**: Scope the transition to only the properties that need it. Apply the transition to a dedicated wrapper `<div>` that only holds background-color/color, or use a `transition-[background-color,color] duration-300` shorthand instead of the broad `transition-colors` on the root body.

### [PERF-03] No Static Asset Cache Policy Configured — Low
- **File**: `astro.config.mjs` (line 6)
- **Issue**: No cache-control headers are defined for static assets (CSS, JS bundles, the favicon, or future PDF files). Browsers will apply heuristic caching at best. Without explicit `Cache-Control: public, max-age=31536000, immutable` for fingerprinted assets, repeat visitors will re-download unchanged files.
- **Recommendation**: For deployment targets that support custom headers (Netlify `_headers`, Vercel `vercel.json`, Cloudflare Workers), configure long-lived caching for `/_astro/*` (Astro fingerprints these files) and shorter TTLs for `public/` root files like PDFs that may change.

### [PERF-04] No `<link rel="preconnect">` for Future Third-Party Origins — Low
- **File**: `src/layouts/Layout.astro` (head section)
- **Issue**: Currently there are no third-party resources. However, the architecture is likely to gain Google Fonts, analytics, or CDN assets. Without preconnect hints these would add one full round-trip to Time to First Byte (TTFB) per new origin. Low severity now but worth establishing the pattern.
- **Recommendation**: When any external origin is added, include the corresponding `<link rel="preconnect" href="https://origin" crossorigin>` in the `<head>` of `Layout.astro`.

---

## Summary Table

| ID | Domain | Severity | Title |
|----|--------|----------|-------|
| SEC-01 | Security | High | Missing HTTP Security Headers |
| SEC-02 | Security | Low | Placeholder External URLs Hardcoded in Source |
| A11Y-01 | Accessibility | High | Missing Skip-Navigation Link |
| A11Y-02 | Accessibility | High | Mobile Navigation Inaccessible |
| A11Y-03 | Accessibility | Medium | `text-zinc-500` Fails WCAG AA Contrast on Light Background |
| A11Y-04 | Accessibility | Medium | Nav Links Missing Focus-Visible Styles |
| A11Y-05 | Accessibility | Low | `<section>` Elements Lack Accessible Names |
| A11Y-06 | Accessibility | Low | `<nav>` Missing `aria-label` |
| PERF-01 | Performance | Medium | CV PDF Files Missing from `/public` |
| PERF-02 | Performance | Low | `transition-colors duration-300` on `<body>` |
| PERF-03 | Performance | Low | No Static Asset Cache Policy Configured |
| PERF-04 | Performance | Low | No `<link rel="preconnect">` for Future Third-Party Origins |

---

## Remediation Summary
**Fixed by**: Security Fixer Agent
**Date**: March 25, 2026

| ID | Severity | Fix Applied | File(s) Changed |
|----|----------|-------------|-----------------|
| SEC-01 | High | Added `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy` headers under `vite.server.headers` and `vite.preview.headers` | `astro.config.mjs` |
| SEC-02 | Low | Replaced `https://github.com/yourusername` and `https://linkedin.com/in/yourusername` with `href="#"` + `aria-disabled="true"` and added `TODO` comments to prevent accidental live deployment with unintended third-party links | `src/components/organisms/Contact.astro` |

### Manual Actions Required
- [ ] **SEC-01 (production headers)**: Vite `server.headers` only applies to the dev server and `astro preview`. For the live deployment, add equivalent headers in your hosting configuration:
  - **Netlify**: create `public/_headers` with the same directives for `/*`
  - **Vercel**: add a `headers` array in `vercel.json`
  - **Cloudflare Pages**: add a `public/_headers` file
- [ ] **SEC-02**: Before publishing, replace the `href="#"` placeholders in `src/components/organisms/Contact.astro` with your real GitHub and LinkedIn URLs, and restore `target="_blank" rel="noopener noreferrer"` on those links.
- [ ] Rotate any secrets that were previously hardcoded before this fix was applied (none found in this codebase at audit time).

---

## A11y & Performance Remediation Summary
**Fixed by**: A11y & Perf Fixer Agent
**Date**: March 25, 2026

| ID | Domain | Severity | Fix Applied | File(s) Changed |
|----|--------|----------|-------------|-----------------|
| A11Y-01 | Accessibility | High | Added `<a href="#main-content">Skip to main content</a>` as first child of `<body>`; added `id="main-content"` to `<main>` | `src/layouts/Layout.astro`, `src/pages/index.astro` |
| A11Y-02 | Accessibility | High | Added hamburger toggle button with `aria-label`, `aria-expanded`, `aria-controls`; added hidden mobile `<ul>` menu panel; JS script to toggle open/close state and close on link click | `src/components/organisms/Nav.astro` |
| A11Y-03 | Accessibility | Medium | Replaced `text-zinc-500` with `text-zinc-600` in light mode on nav links, hero skills list, contact social links, and footer text; adjusted dark mode to `dark:text-zinc-400` where needed | `src/components/organisms/Nav.astro`, `Hero.astro`, `Contact.astro`, `Footer.astro` |
| A11Y-04 | Accessibility | Medium | Added `focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 rounded-sm` to all nav anchor links and the logo link | `src/components/organisms/Nav.astro` |
| A11Y-05 | Accessibility | Low | Added `aria-label` with human-readable section name to all `<section>` elements | `src/components/organisms/Experience.astro`, `Projects.astro`, `Resume.astro`, `Contact.astro`, `Hero.astro` |
| A11Y-06 | Accessibility | Low | Added `aria-label="Main navigation"` to the `<nav>` element | `src/components/organisms/Nav.astro` |
| PERF-01 | Performance | Medium | NEEDS MANUAL REVIEW — PDF files must be added to `/public` by the user | — |
| PERF-02 | Performance | Low | Replaced `transition-colors` with `transition-[background-color,color]` on `<body>` to scope repaint cascade to only the two properties that change | `src/layouts/Layout.astro` |
| PERF-03 | Performance | Low | Created `public/_headers` with `Cache-Control: public, max-age=31536000, immutable` for `/_astro/*` (fingerprinted bundles) and `max-age=3600` for root files; also carries production security headers for Netlify deployments | `public/_headers` |
| PERF-04 | Performance | Low | No external origins currently used — no action needed | — |

### Manual Actions Required
- [ ] **PERF-01**: Place `cv-en.pdf` and `cv-es.pdf` in `public/` before publishing. Resume download buttons are currently broken.
- [ ] **PERF-03 (Vercel)**: If deploying to Vercel instead of Netlify, translate `public/_headers` into a `headers` array in `vercel.json`.
- [ ] Verify color contrast for any updated text colors in a browser accessibility tool (e.g., Chrome DevTools contrast checker).
- [ ] Test keyboard navigation end-to-end (Tab, Enter, Escape on mobile menu) after nav changes.
- [ ] Confirm the skip link renders correctly and focuses `#main-content` when activated.

