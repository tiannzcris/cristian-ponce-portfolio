# Cristian N. Ponce — Portfolio

A responsive personal portfolio built with React 19, TypeScript, Vite, GSAP/ScrollTrigger, and a procedural Three.js hero. Static hosting only; no database, authentication, external models, or API keys.

## Local development

Use Node.js **22.19 or newer** (Node 22 LTS recommended) and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite, normally `http://127.0.0.1:5173`. In Windows PowerShell with script execution disabled, use `npm.cmd` in place of `npm`.

```sh
npm run typecheck
npm run lint
npm run build
npm run check:assets
npm run preview
```

The production build goes to `dist/`. The preview URL is normally `http://127.0.0.1:4173`.

## Browser verification

With the production preview running, run:

```sh
npm run test:browser
```

The Playwright test uses installed Google Chrome by default. Set `PLAYWRIGHT_CHANNEL=msedge` to use Microsoft Edge instead. Set `PORTFOLIO_TEST_URL` to test a different local URL. Screenshots and the verification report go to the Git-ignored `.qa/` directory.

The checks cover 360px, 390px, 768px, 1024px and 1440px layouts, overflow, image loading, menu keyboard/touch use, sticky-header anchors, all six certificate dialogs, Escape/focus return, reduced motion, WebGL fallback, pause/resume, offscreen rendering, the tab-visibility handler, link attributes, console errors, and automated WCAG A/AA checks with axe. Automated checks complement visual and keyboard review; they do not establish complete accessibility conformance.

`node scripts/inspect-projects.mjs` performs read-only visits to the three project URLs and saves screenshots and page text under `.qa/projects/`. It never logs in or submits anything.

## Structure and content

- `src/content.ts`: typed profile, navigation, skills, projects, certificate records, dates, image paths, and social links.
- `src/App.tsx`: page sections and reusable project presentation.
- `src/components/`: navigation, accessible native certificate dialog, hero illustration, and Three.js scene.
- `src/hooks/useAnimations.ts`: scoped GSAP animations with cleanup and reduced-motion handling.
- `src/styles.css`: design tokens, layouts, interaction states, and responsive styling.
- `public/images/`: optimized images actually served to visitors.
- `assets/originals/`: retained non-sensitive certificate and screenshot sources, outside the public/build directory.
- `docs/ASSETS.md`: original filename mapping, redaction notes, and project verification details.

Edit `src/content.ts` to update text, projects, skills, links, or certificates. Add an optimized screenshot to `public/images/projects/` and set its `image` and `imageAlt`; omitting `image` uses a typographic project cover. Repository links are intentionally absent because exact project repositories were not supplied or verified. No email, résumé, phone number, or contact form is fabricated.

The code camp screenshot is a real capture of its public page. The E-LIKAS and Windows Server images are the supplied local screenshots. All three project homepages were accessible during verification on October 27, 2026. E-LIKAS is described as a capstone system with project capabilities, without attributing every feature to Cristian. The other projects' technology stacks are not inferred. Future project availability and back-end behavior are outside this portfolio's control.

## Image handling and privacy

The original portrait is preserved at `public/images/portrait.jpg`. Responsive WebP versions use only resizing and encoding: no sharpening, extra blur, or facial alteration. CSS cropping keeps the face visible.

Full-resolution certificate derivatives preserve the full image; the dialog uses `object-fit: contain` and offers the same redacted public file at full resolution. Thumbnails are separate smaller assets.

**The unredacted TOPCIT original is preserved locally at `.private/topcit-original.jpg`. Never put it in `public/`, a repository, or a deployment archive.** `.private/` is excluded in `.gitignore` and `.vercelignore`, and Vite's development file server denies it. The publicly served image has opaque, flattened raster redactions over the date of birth, certificate number, and machine-readable verification codes. The retained source in `assets/originals/certificates/topcit-redacted.png` is already redacted. No CSS overlays are used for privacy. Clean clones do not require the private original.

`node scripts/prepare-assets.mjs` regenerates the optimized assets from the retained originals. It never reads the private TOPCIT source. The code camp screenshot is regenerated from `assets/originals/projects/sui-code-camp-public.png`; refresh that original from a new inspected public capture if needed. The source portrait, readable certificate masters, and project screenshots are retained for future edits.

## Animation and performance

The headline, navigation, and buttons are normal HTML and immediately available. The Three.js module is loaded on demand when the hero approaches the viewport. An SVG network illustration is visible before load and when WebGL is unavailable or loses context. The scene uses a small procedural mesh, instanced nodes, three orbital rings, and a capped pixel ratio (1.6 desktop, 1.25 mobile). Mobile animation is capped at approximately 30 fps.

Rendering pauses offscreen, while the document is hidden, with the pause button, and under `prefers-reduced-motion`. Reduced motion shows a single rendered frame and disables GSAP and smooth scrolling. Pointer response is restricted to fine pointers. Native scrolling/touch remain intact. Cleanup disposes geometries, materials, the renderer, observers, listeners, animation loops, and GSAP contexts/ScrollTriggers. Content starts visible; animation loading is never a prerequisite for reading it. Fonts are self-hosted.

## Deploy from GitHub to Vercel

Nothing has been pushed or deployed by this implementation.

1. Create a GitHub repository for this workspace. If needed, initialize Git here, add the project, review staged files, commit, and push to your chosen repository. `.private/`, `.qa/`, `node_modules/`, and `dist/` must stay untracked.
2. In Vercel, choose **Add New → Project** and import that GitHub repository.
3. Use the repository root as the Root Directory and **Vite** as the Framework Preset.
4. Use `npm ci` for installation, `npm run build` for the Build Command, and **`dist`** as the Output Directory. Select Node.js **22.x**.
5. Deploy when ready. `vercel.json` also declares the framework, build command, output directory, basic security headers, and immutable caching for hashed assets.

There is no client-side router, so hash navigation works on static hosting without rewrites. No environment variables are required. The favicon and 1200×630 social preview are included. No production URL is invented: canonical/`og:url` metadata is omitted until an actual URL is configured. Once Vercel supplies `VERCEL_PROJECT_PRODUCTION_URL`, the build uses that real URL for canonical and absolute social metadata. You can alternatively set `PORTFOLIO_SITE_URL` to your actual public origin. Local builds keep relative preview-image paths.

Treat Git commits and deployment as separate deliberate actions. Keep a separate private backup of the original TOPCIT document; ignored files are not included in GitHub backups.
