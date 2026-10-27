# Cristian N. Ponce — Portfolio

A responsive personal portfolio built with React 19, TypeScript, Vite, GSAP/ScrollTrigger, and a procedural Three.js hero. Static hosting only; no database, authentication, external models, or API keys.

The portfolio also includes a fixed procedural 3D chibi companion with dance/wave animation and an accessible click/keyboard greeting. See [companion architecture, greeting, GLB replacement, and music playback](docs/COMPANION.md). The existing user-supplied `public/audio/background.mp3` is included in development and production. Music attempts autoplay once at 25% volume; browsers may require the visible Play music button instead. Saved mute/volume preferences and explicit manual pauses are respected.

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
npm run test:themes
npm run test:audio
```

The Playwright test uses installed Google Chrome by default. Set `PLAYWRIGHT_CHANNEL=msedge` to use Microsoft Edge instead. Set `PORTFOLIO_TEST_URL` to test a different local URL. Screenshots and the verification report go to the Git-ignored `.qa/` directory.

The checks cover 360px, 390px, 768px, 1024px and 1440px layouts, overflow, image loading, menu keyboard/touch use, sticky-header anchors, all six certificate dialogs, Escape/focus return, reduced motion, WebGL fallback, pause/resume, offscreen rendering, the tab-visibility handler, link attributes, console errors, and automated WCAG A/AA checks with axe. Automated checks complement visual and keyboard review; they do not establish complete accessibility conformance.

`node scripts/inspect-projects.mjs` performs read-only visits to the three project URLs and saves screenshots and page text under `.qa/projects/`. It never logs in or submits anything.

The theme suite checks light/dark at 360px and 1440px, stored choices after reload, pre-React startup colors, theme updates on the existing 3D canvas, blocked storage, both static fallbacks, marquee hover/touch/keyboard focus, outside release/cancellation, native touch scrolling, a gap-free 3840px loop, reduced motion, and dialogs. Theme screenshots and its report are saved in `.qa/themes/`.

The audio suite tests the production preview with blocked and permitted Chrome autoplay policies, actual manual playback and looping, pause persistence, mute/volume preferences, keyboard controls, both themes, mobile/desktop layout, missing-file recovery, and an unchanged MP3 in `dist/audio/background.mp3`. Browser policy flags are used only in tests. The controls sit in the hero's document flow, avoiding a floating overlay on mobile content. Reports and captures are retained in `.qa/audio/`.

## Themes and technology strip

The sun/moon control stays available in desktop and mobile navigation. On first visit the palette follows `prefers-color-scheme`; an explicit choice is stored under `cnp-theme`. With no saved choice, later device preference changes are followed too. The small inline head script selects the theme before styles and React load. Storage failures fall back to an in-memory choice. All website colors are shared CSS variables in `src/themes.css`, including the SVG fallback and the material palette read by Three.js. Theme changes update existing materials and repaint paused scenes without replacing the canvas or starting a second rendering loop.

The technology strip follows the hero and preserves the categorized Skills section. Its content lives in `technologies` in `src/content.ts`. It uses locally served SVG masks with theme-aware colors, two matching visual groups, and enough sequence copies to fill any measured viewport. One linear Web Animation traverses exactly one group's width. Mouse hover, active touch contact, and keyboard focus pause it; leaving, releasing/canceling the touch, or moving keyboard focus away resumes the same animation from its held position. It has no visible control or tap toggle. Touch scrolling is native, and release/cancellation is handled even outside the strip. Reduced-motion users see the single accessible list as a static wrapping layout. Visual duplicates are hidden from assistive technology. Logo files are generated at development time and never fetched from external icon services at runtime.

## Structure and content

- `src/content.ts`: typed profile, navigation, skills, projects, certificate records, dates, image paths, and social links.
- `src/App.tsx`: page sections and reusable project presentation.
- `src/components/`: navigation, accessible native certificate dialog, hero illustration, and Three.js scene.
- `src/hooks/useAnimations.ts`: scoped GSAP animations with cleanup and reduced-motion handling.
- `src/styles.css`: design tokens, layouts, interaction states, and responsive styling.
- `src/themes.css` and `src/theme.ts`: shared light/dark palettes, startup preference handling, persistence, and theme subscriptions.
- `src/components/TechnologyMarquee.tsx`: continuous technology strip, pointer/keyboard pause behavior, and reduced-motion list.
- `public/icons/technologies/`: seventeen local Devicon SVGs plus their MIT attribution. ASP.NET MVC and NativePHP use clear text labels, for nineteen technologies in total. Regenerate icons with `node scripts/prepare-tech-icons.mjs`.
- `public/images/`: optimized images actually served to visitors.
- `assets/originals/`: retained non-sensitive certificate and screenshot sources, outside the public/build directory.
- `docs/ASSETS.md`: original filename mapping, redaction notes, and project verification details.

Edit `src/content.ts` to update text, projects, skills, links, or certificates. Add an optimized screenshot to `public/images/projects/` and set its `image` and `imageAlt`; omitting `image` uses a typographic project cover. Repository links are intentionally absent because exact project repositories were not supplied or verified. No email, résumé, phone number, or contact form is fabricated.

Skills are grouped into the Laravel, .NET, and MERN web stacks, Flutter/Dart mobile development, PHP/Laravel/NativePHP desktop development, and Git/GitHub tools. Laravel is identified as a framework and .NET as a platform. Networking and cybersecurity are separate learning interests. Flutter and NativePHP are not attributed to a named project without confirmed project content.

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
