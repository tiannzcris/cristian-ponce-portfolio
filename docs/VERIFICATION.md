# Verification record

## Production music and autoplay fallback

The existing user-supplied `public/audio/background.mp3` is configured for both development and production, with no environment restriction. Its specific Git/Vercel ignore entries and the build deletion plugin are removed. The completed production build contains `dist/audio/background.mp3` (5,292,918 bytes), matching the source byte for byte. Asset checks continue to protect the private certificate original and unrelated ignored files. No additional audio was downloaded, and no commit, push, or deployment was performed.

The player owns one looping audio element and makes one startup attempt at 25% volume, restoring saved mute/volume preferences. A saved manual pause takes priority and remains paused until explicit Play, including after reload. Blocked autoplay is caught and presents Play music; only actual media playback changes the UI to Pause. Theme changes, scrolling, unrelated clicks, and mute/volume changes never cause an automatic retry. Loading/error status and explicit retry are available. Controls are in the hero's normal flow, keeping them clear of mobile content and the fixed chibi. Modal/menu control suppression does not replace the audio element.

Current configuration and test details are in [COMPANION.md](COMPANION.md). Earlier records below describe the previous development-only music implementation and are retained as history.

TypeScript, lint (no warnings), and the production build passed. Asset checks verified the exact MP3 copy and preserved private-certificate protection. The production audio suite passed in light/dark at 360px and 1440px: one rejected startup attempt, a truthful Play fallback, successful keyboard/manual playback, native looping, pause persistence through theme/scroll/reload, mute/unmute, keyboard volume, saved preferences, no player/companion overlap, axe checks, and visible missing-file errors with explicit recovery. A separate development StrictMode smoke test verified one element and one startup attempt, successful explicit Play/Pause, and no page errors.

Permitted-autoplay tests started native playback once without prior activation, with saved 40% volume and either mute setting. Chrome autoplay policy flags were confined to QA; the site does not override browser restrictions. Automated browser output was muted at the process level, while the audible-autoplay test media element was unmuted. Physical speaker output and physical phone browsers were not tested. Touch/mobile layout used Chrome emulation. The existing lazy Three.js shared-chunk size advisory remains.

The general portfolio, theme, and companion browser suites also passed with production music present. They covered all six certificate dialogs, five responsive widths, hero controls, stored/startup themes, marquee touch/focus behavior, reduced motion, blocked storage, and WebGL fallback without unexpected console errors. The companion retained zero drift across 1,944 new scroll-position samples and stayed visible at the footer. Desktop/mobile music screenshots were visually inspected in both themes; controls remain in document flow and do not cover the companion or other page controls. Audio reports and captures are in ignored `.qa/audio/`.

Changed for this music update: `.gitignore`, `.vercelignore`, `vite.config.ts`, `src/companion/config.ts`, `src/components/MusicPlayer.tsx`, the player's placement in `src/App.tsx`, music styles in `src/companion/companion.css`, `scripts/verify-audio.mjs`, `scripts/check-assets.mjs`, production-music assertions in `scripts/verify-companion.mjs`, `README.md`, `docs/COMPANION.md`, `docs/ASSETS.md`, and this record. The original MP3 is unchanged and eligible for Git; it has not been staged or committed.

## Fixed viewport companion and direct marquee interaction

The previous companion drift came from `useDockPosition`, which measured surrounding controls on every scroll and selected new bottom/right offsets. An independent section observer suppressed it near the certificate list and footer. Both mechanisms are removed. No existing root/body transform caused the issue; a body portal now also isolates the companion from future page transforms.

The companion uses constant CSS bottom/right offsets of 12px plus safe-area insets, keeps its desktop/mobile dimensions, and remains visible at every section. Its layer is below the navigation and native modal top layer. The wrapper passes input through except for the shaped click/keyboard greeting target. Pause/hide/restore controls and their state are removed; visibility has no storage dependency. Reduced motion stays static, and inactive browser tabs suspend rendering. Character animation, hero controls, and music configuration are unchanged.

The marquee has no visible button. Mouse hover, active touch contact, and keyboard focus pause its existing animation; leaving/releasing/canceling or moving focus away resumes it at the held position. Touch input is distinguished from mouse hover, global release/cancel listeners handle events outside the strip, and native vertical scrolling remains enabled. Reduced motion still uses the static wrapping list.

Chrome verification passed in light and dark at 360px and 1440px. The final companion run sampled 2,242 positions during slow/fast scrolling from top to footer and back, with zero CSS-pixel drift. It remained visible at the footer, escaped a transformed page root, passed transparent-corner click-through, and left footer link centers clickable. The footer reserves static space using the responsive character width; no companion repositioning is involved. Desktop/mobile footer and modal screenshots were visually inspected. Mouse/keyboard greetings, return to dance, static reduced-motion greetings, live motion preferences, the tab-visibility handler with simulated hidden state, same-canvas theme updates, fallback visibility, and automated axe checks passed. Model checks also passed for dance continuity, blinking, waves, grounded feet, framing, and cleanup.

The theme suite passed mouse hover/leave, real browser touch hold/release and native vertical panning with pointer cancellation, keyboard focus, and resuming the same animation at its held position. Outside-section pointer release/cancel edge cases were dispatched synthetically. Touch verification used Chrome mobile emulation, not physical phone hardware. Both palettes, static reduced-motion lists, theme persistence, dialogs, startup colors, and the gap-free 3840px loop passed, with no browser exceptions or console errors. TypeScript, lint, production build, asset exclusions, and formatting checks passed. The existing lazy Three.js shared-chunk size advisory remains. No commit, push, or deployment was performed.

The general browser suite also passed at 360px, 390px, 768px, 1024px, and 1440px, including all six certificate dialogs, navigation, the unchanged hero animation controls, image loading, WebGL fallback, and no overflow or broken local responses. At that stage, music configuration and its development-only exclusions were unchanged; production had no local-test audio element or track requests.

Changed files: `src/App.tsx`, `src/companion/PortfolioCompanion.tsx`, `src/companion/companion.css`, removed `src/companion/useDockPosition.ts`, `src/components/TechnologyMarquee.tsx`, `src/styles.css`, `scripts/verify-companion.mjs`, `scripts/verify-themes.mjs`, `README.md`, `docs/COMPANION.md`, and this record. Earlier records below describe the previous implementations.

## Experience categories and expanded marquee

The central content now separates the Laravel, .NET, and MERN web stacks, Flutter/Dart mobile experience, PHP/Laravel/NativePHP desktop experience, and Git/GitHub tools. Laravel is described as a framework and .NET as a platform. Networking and cybersecurity remain learning interests. Profile wording and Skills use these categories; named project content, tags, links, portrait assets, and certificates are unchanged.

The marquee now has nineteen unique accessible names, seventeen local SVG logos, and clear text labels for ASP.NET MVC and NativePHP. Express, Node.js, Flutter, and Dart logos come from the already installed Devicon packages. The existing theme browser suite passed at 360px and 1440px in both palettes, including all logo responses, controls, hover/focus pause, reduced motion, theme persistence, dialogs, and axe checks. Its 3840px test passed full coverage, consistent spacing, one animation, and less than one pixel of difference across the loop boundary. No browser exceptions, console errors, or broken local resources were found.

The general browser regression suite also passed across 360px, 390px, 768px, 1024px, and 1440px, including navigation, every certificate dialog, image loading, the 3D hero, and WebGL fallback. The updated Skills and static technology list were visually reviewed in light/mobile and dark/desktop renders; text wraps cleanly and all nineteen technology names are readable. At that stage, production had no audio element. Review captures are retained locally at `.qa/skills-*.png` and `.qa/technologies-*.png`.

TypeScript, lint, and the production build passed. The existing lazy Three.js shared chunk still triggers Vite's advisory for chunks over 500 kB (approximately 134 kB gzipped). The asset check passed and confirmed the local test MP3 was excluded from production output at that stage. No commit, push, or deployment was performed.

Changed for this update: `src/content.ts`, `src/App.tsx`, `src/components/TechnologyMarquee.tsx`, `src/styles.css`, `scripts/prepare-tech-icons.mjs`, `scripts/verify-themes.mjs`, four SVGs under `public/icons/technologies/`, `README.md`, `docs/ASSETS.md`, and this record. Companion and music source/configuration are preserved.

## Procedural 3D companion and private local audio

The active companion is made from 57 real Three.js meshes with 11 shared materials and 14 geometries. Model checks passed for independent joints, a seamless base dance cycle, wave/blink behavior, grounded stepping, sampled desktop/mobile camera bounds over 20 seconds, and disposal of every owned material and geometry. Sampled foot clearance remained between approximately 0.0003 and 0.0385 units above the ground.

Actual Chrome renders were inspected at desktop and mobile sizes in both light and dark themes, including enlarged detail views. The companion browser suite passed automatic movement, mouse/keyboard greeting followed by a return to dancing, pause/hide/restore, inactive-tab suspension, certificate and mobile-menu suppression, reduced-motion first visit and explicit movement opt-in, existing-canvas theme updates, no-WebGL fallback, and automated axe checks. There were no page exceptions or console errors in these companion runs. Actual WebGL draw calls were monitored to confirm the paused character issues no draws; this avoids mistaking the animated hero visible through the transparent canvas for character movement.

Before the production music update above, the audio suite passed against local development with the supplied `public/audio/background.mp3`: no autoplay, explicit Play/Pause, mute, volume adjustment, no playback after reload, and graceful hidden-player behavior for a simulated missing file. Production then had no audio element, no music controls, and no track requests. The test MP3 was not Git-tracked, was covered by both ignore files, and was absent from that production artifact. No public-use track was configured at that stage.

The existing portfolio and theme browser suites also passed after integration, including all certificate dialogs, mobile navigation, five responsive widths, saved color preference and startup behavior, static WebGL fallbacks, and the wide-screen marquee. Final docking checks cover all sections: the companion avoids interactive controls and temporarily stows for the dense certificate list and footer, restoring its previous state when those areas leave view.

See [companion and audio implementation notes](COMPANION.md) for the GLB adapter contract and development configuration. Screenshots and the companion browser report are retained in ignored `.qa/companion/`. The original portrait and portfolio content assets are unchanged.

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
