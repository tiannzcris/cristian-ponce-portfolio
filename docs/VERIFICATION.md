# Verification record

## Light/dark theme and marquee update

The update adds shared semantic color palettes, accessible sun/moon navigation controls, device-preference defaults, persisted explicit choices, startup theme selection before React loads, in-place Three.js material updates, and thirteen local SVG technology logos in a continuous strip.

`npm run test:themes` verifies light and dark at 360px and 1440px, theme persistence after reload, explicit choices overriding device preference, correct startup backgrounds while the React module is blocked, and a single reused 3D canvas. It also checks marquee pause/resume, hover/focus pause, a single accessible list of thirteen names, static wrapping lists and paused 3D under reduced motion, full-image certificate dialogs with focus return, and automated axe WCAG A/AA checks in both themes. A 3840px test confirms complete marquee coverage, consistent item gaps, one animation, and less than one pixel of position difference across the loop boundary. Blocked localStorage and unavailable WebGL are tested together in both palettes. No browser exceptions, console errors, or broken local resources were found.

The existing browser suite also passes across 360px, 390px, 768px, 1024px, and 1440px, including all six certificate viewers, navigation, image loading, reduced motion, offscreen/hidden-tab rendering, and WebGL fallback. Theme-specific screenshots and the machine-readable report are kept under `.qa/themes/`. No content images, certificates, portrait processing, or project URLs were changed.

Changed files for this update:

- Theme startup and styling: `index.html`, `src/main.tsx`, `src/theme.ts`, `src/themes.css`, `src/styles.css`.
- Components and placement: `src/App.tsx`, `src/components/Navigation.tsx`, `src/components/ThemeToggle.tsx`, `src/components/HeroVisual.tsx`, `src/components/NetworkScene.ts`, `src/components/TechnologyMarquee.tsx`.
- Technology content/assets: `src/content.ts`, thirteen SVGs and `LICENSE.txt` under `public/icons/technologies/`.
- Generation/checks/configuration: `scripts/prepare-tech-icons.mjs`, `scripts/verify-themes.mjs`, `eslint.config.js`, `package.json`, `package-lock.json`.
- Documentation: `README.md`, `docs/ASSETS.md`, `docs/VERIFICATION.md`.

Verified locally on October 27, 2026 with Node.js 22.19.0, npm, and installed Chrome through Playwright. The site has not been pushed or deployed.

## Build and source checks

- TypeScript: passed (`tsc -b`, also run by the build).
- ESLint: passed, no warnings or errors.
- Prettier formatting: passed.
- Production build: passed; Vite 7.3.7 emitted the static site to `dist/`.
- Dependency audit after updates: zero reported vulnerabilities.
- Asset references and privacy check: passed; all 20 public files checked, and the unredacted TOPCIT original is absent from public/build output.

The main JavaScript bundle is about 126 kB gzipped; the separately loaded Three.js scene is about 124 kB gzipped. The two self-hosted variable fonts total about 71 kB. Images are lazy-loaded where appropriate; full certificate images load when their dialog opens. These are build sizes, not a Lighthouse performance score.

## Production browser checks

`npm run test:browser` passed against the local production preview:

- 1440px desktop and 360px, 390px, 768px, and 1024px responsive layouts.
- No horizontal overflow, broken images, browser exceptions, console errors, or failing local asset responses.
- All navigation anchors exist and land below the sticky header (subject to native end-of-page scroll limits).
- Mobile navigation works with Enter, Escape, focus return, touch, and link selection.
- Every project and social link has a complete HTTPS destination and safe new-tab attributes.
- All six certificate dialogs show the full image without cropping, provide a close button and full-resolution link, support Escape, wrap keyboard focus, and restore focus to the triggering button.
- Automated axe WCAG A/AA checks pass on desktop, 360px mobile, and the mobile certificate dialog.
- The procedural 3D scene renders and its pause/play control works. Rendering pauses offscreen and in the tab-visibility handler.
- Reduced motion disables continuous rendering, GSAP motion, and smooth scrolling.
- Simulated WebGL unavailability leaves the static network illustration and all content/controls usable.

An additional development smoke test verified a single canvas under React StrictMode, no page errors, private-source access denied with HTTP 403, and the static fallback after an actual WebGL context-loss event.

Visual review covered the desktop hero and full page, phone hero, portrait crop, desktop/mobile TOPCIT dialogs, and static fallback. The original portrait blur is preserved; the face remains visible. TOPCIT redactions were reviewed in the public derivative and in the viewers.

Screenshots and the machine-readable test report are retained locally under ignored `.qa/`. The repeatable browser test lives at `scripts/verify.mjs`.

## Content and external verification

All supplied certificate images were inspected, and the award categories and dates match them. The TOPCIT record is an assessment result, not a license. No assets remain missing: a public-page screenshot was captured for the code camp project.

All three project homepages returned HTTP 200 and were visually inspected without logging in or making changes. The E-LIKAS staff features, backend stack, and analytics implementation are supplied facts; authenticated features were not exercised. Cristian's exact individual capstone responsibilities and project repository URLs remain unspecified, so the portfolio does not invent them. The code camp's linked blockchain record was not independently verified.
