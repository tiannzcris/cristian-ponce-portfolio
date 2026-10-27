# Portfolio companion and local music

## Character

The active companion is a procedural Three.js character: 57 real meshes, 14 shared geometries, and 11 shared materials. It has an oversized rounded head, dark tousled hair, warm medium skin, anime-inspired eyes, and a black suit with white shirt and tie. It is an original simplified likeness inspired by the supplied portrait; the portrait itself is unchanged.

`src/companion/proceduralCharacter.ts` owns the character and joint animation. Its hierarchy includes torso/head, shoulders/elbows, hips/knees/ankles, and separate eyes. Time-based movement combines alternating near-ground steps, body sway, independent arm swings, head movement, blinks, and occasional waves. The base dance period is 8/3 seconds. Blinks and occasional waves run on separate continuous timers. A greeting lasts 2.8 seconds and blends back into the dance. Paused/reduced-motion greetings change to a static waving pose without enabling an animation loop.

## Controls and rendering

- `PortfolioCompanion.tsx` handles lazy loading and accessible greeting, pause/resume, hide, and restore controls. Hide moves keyboard focus to Restore; Restore returns it to the character.
- `companionScene.ts` owns the transparent renderer, camera, restrained lights, theme updates, timing, and resource cleanup. It never uses real-time shadows or postprocessing. The small contact ellipse is a mesh, not a shadow pass.
- `useDockPosition.ts` keeps the bottom-right dock clear of visible interactive elements, including footer links and the hero's controls. The outer wrapper passes pointer events through; only the character's shaped hit area and controls receive clicks.
- `renderBudget.ts` coordinates the hero and companion: while both animate, the hero is capped at 30 fps desktop / 24 fps mobile and the companion at 24 fps desktop / 20 fps mobile. With the hero offscreen, the companion can use 30/24 fps. Animation uses elapsed seconds, independently of these caps.

The desktop stage is 156×188 CSS pixels, framing approximately 160 pixels of character height. Mobile uses a 108×120 stage, framing approximately 100 pixels of character height. The pixel ratio is capped at 1.5 desktop / 1.25 mobile. Each renderer has one owned animation loop. Hidden, paused, dialog-suppressed, or inactive-tab companions stop issuing continuous renders. Themes and explicit static-pose changes may request a single repaint.

Certificate dialogs and the mobile navigation suppress the companion without destroying its scene. Closing them restores its previous movement state. Reduced-motion first visits start with a static pose; the Play control explicitly enables movement. If the OS subsequently turns on reduced motion, the character stops until movement is explicitly enabled again.

The companion also tucks away automatically while the dense certificate list or footer is in view, where there may be no safe space for a full character without covering text or controls. It returns when those areas leave the viewport. This temporary suppression preserves the user's movement and manual hide choices.

When WebGL is unavailable or loses context, an inline lightweight SVG illustration remains, with functional hide/restore controls. The greeting and motion buttons are disabled for this static fallback. It is used only as the fallback; the active character is lit three-dimensional geometry.

## Replacing the procedural character with a GLB

`src/companion/types.ts` defines the character adapter contract: `root`, `update(seconds)`, `greet(seconds, animated)`, `rest()`, and `dispose()`. A future rigged GLB adapter can load its verified asset, return a normalized `THREE.Group`, update an `AnimationMixer` from elapsed time, and map greeting/rest to animation clips. Replace the character factory dependency in `companionScene.ts`; the React controls and rendering state do not depend on the procedural joint structure. Normalize the loaded character to the same ground origin and approximately 2.8-unit height, then recheck camera bounds. The adapter must dispose its textures and other owned model resources.

No missing model path, external character download, or paid asset is referenced.

The current production build emits Vite's size advisory for the shared Three.js chunk (approximately 524 kB minified / 134 kB gzipped). It is lazy-loaded once and shared by both scenes. The character-specific scene/rig module is approximately 8 kB minified. This implementation is a stylized procedural likeness; no GLB is supplied or loaded.

## Development-only music

The local test track is `public/audio/background.mp3`, served as `/audio/background.mp3` by `npm run dev`. `src/companion/config.ts` selects it only when `import.meta.env.DEV` is true. No public-use track is currently configured.

The MP3 is excluded by `.gitignore` and `.vercelignore`. A Vite build hook also removes this exact private filename from `dist/audio/background.mp3` after Vite copies public assets, preventing it from appearing in the production artifact. The asset check and audio browser test verify this. The local original is retained and never changed by the build. Do not force-add it to Git.

The music component checks for a successful local audio response and valid metadata before showing controls. Missing/invalid audio leaves the player hidden. It uses metadata preload only, never autoplay. Playback requires an explicit Play click; reloading never resumes it automatically. Pause, mute, and a labeled volume slider are provided, initially at 25%. Playback rejection is caught, and the element is paused and released on unmount. No audio was downloaded or extracted.

For a future track permitted for public website use, add it under a different public filename, for example `public/audio/approved-background.mp3`, and set `publicTrack` in `src/companion/config.ts` to its `/audio/` URL. The private `background.mp3` filename remains excluded. Public playback still requires an explicit Play click.

## Verification

```sh
npm run typecheck
npm run lint
npm run build
npm run check:assets
npm run preview
npm run test:companion
```

For audio checks, also start `npm run dev` in a separate terminal and run `npm run test:audio`. The default URLs are development `http://127.0.0.1:5173` and production preview `http://127.0.0.1:4173`; override them with `PORTFOLIO_DEV_URL` and `PORTFOLIO_TEST_URL`. Browser tests use installed Chrome, or `PLAYWRIGHT_CHANNEL=msedge`.

The model test samples 20 seconds at 30 fps for desktop/mobile camera clipping, grounded feet, independent joints, loop continuity, wave/blink behavior, and geometry/material disposal. Browser checks exercise actual rendering, automatic dance, mouse/keyboard greeting, pause/hide/restore, inactive tabs, dialog/menu suppression, reduced-motion opt-in, theme changes, fallback controls, and axe checks. Screenshots and reports are local under ignored `.qa/companion/`.
