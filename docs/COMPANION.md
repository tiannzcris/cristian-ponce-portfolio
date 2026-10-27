# Portfolio companion and local music

## Character

The active companion is a procedural Three.js character: 57 real meshes, 14 shared geometries, and 11 shared materials. It has an oversized rounded head, dark tousled hair, warm medium skin, anime-inspired eyes, and a black suit with white shirt and tie. It is an original simplified likeness inspired by the supplied portrait; the portrait itself is unchanged.

`src/companion/proceduralCharacter.ts` owns the character and joint animation. Its hierarchy includes torso/head, shoulders/elbows, hips/knees/ankles, and separate eyes. Time-based movement combines alternating near-ground steps, body sway, independent arm swings, head movement, blinks, and occasional waves. The base dance period is 8/3 seconds. Blinks and occasional waves run on separate continuous timers. A greeting lasts 2.8 seconds and blends back into the dance. Reduced-motion greetings change to a static waving pose without enabling an animation loop.

## Viewport placement, greeting, and rendering

- `PortfolioCompanion.tsx` handles lazy loading, the accessible click/keyboard greeting, and live reduced-motion preferences. It portals the companion directly into `document.body`, outside page transforms. There are no pause, hide, or restore buttons and no stored visibility preference.
- `companionScene.ts` owns the transparent renderer, camera, restrained lights, theme updates, timing, and resource cleanup. It never uses real-time shadows or postprocessing. The small contact ellipse is a mesh, not a shadow pass.
- `companion.css` anchors the outer wrapper with `position: fixed`, 12px bottom/right offsets plus safe-area insets, and a layer below navigation and native modal dialogs. There are no scroll listeners, docking calculations, position transitions, or section/footer observers. The compact wrapper passes pointer events through; only the character's shaped greeting hit area receives clicks.
- `renderBudget.ts` coordinates the hero and companion: while both animate, the hero is capped at 30 fps desktop / 24 fps mobile and the companion at 24 fps desktop / 20 fps mobile. With the hero offscreen, the companion can use 30/24 fps. Animation uses elapsed seconds, independently of these caps.

The desktop stage is 156×188 CSS pixels, framing approximately 160 pixels of character height. Mobile uses a 108×120 stage, framing approximately 100 pixels of character height. The pixel ratio is capped at 1.5 desktop / 1.25 mobile. Each renderer has one owned animation loop. Reduced motion and inactive browser tabs stop continuous renders. Themes and explicit static-pose greetings may request a single repaint.

The companion remains in the same viewport position throughout the page, including the certificate section and footer. The footer reserves a static rail using the shared responsive character width, keeping its text and links clear. Certificate dialogs use the native modal top layer, so their content and backdrop receive input above the companion; modal focus trapping remains unchanged. Mobile navigation also has a higher layer.

Reduced-motion visits use a static pose, and greeting activation produces a static waving pose without starting a loop. Live preference changes stop or resume the dance. No legacy hidden state is read or saved.

When WebGL is unavailable or loses context, an inline lightweight SVG illustration remains visible. Its greeting hit area is disabled. It is used only as the fallback; the active character is lit three-dimensional geometry.

## Replacing the procedural character with a GLB

`src/companion/types.ts` defines the character adapter contract: `root`, `update(seconds)`, `greet(seconds, animated)`, `rest()`, and `dispose()`. A future rigged GLB adapter can load its verified asset, return a normalized `THREE.Group`, update an `AnimationMixer` from elapsed time, and map greeting/rest to animation clips. Replace the character factory dependency in `companionScene.ts`; the React controls and rendering state do not depend on the procedural joint structure. Normalize the loaded character to the same ground origin and approximately 2.8-unit height, then recheck camera bounds. The adapter must dispose its textures and other owned model resources.

No missing model path, external character download, or paid asset is referenced.

The current production build emits Vite's size advisory for the shared Three.js chunk (approximately 524 kB minified / 134 kB gzipped). It is lazy-loaded once and shared by both scenes. The character-specific scene/rig module is approximately 8 kB minified. This implementation is a stylized procedural likeness; no GLB is supplied or loaded.

## Music in development and production

The existing user-supplied track is `public/audio/background.mp3`, configured as `/audio/background.mp3` in `src/companion/config.ts` for both development and production. No additional audio was downloaded. Vite copies it unchanged to `dist/audio/background.mp3`; the MP3 is eligible for Git and Vercel uploads. Private certificate originals, secrets, and other unrelated exclusions remain protected.

The player owns one looping audio element. A fresh page attempts playback once at 25% volume with sound enabled unless saved preferences say otherwise. The `play()` rejection is caught: blocked autoplay leaves the audio paused and shows a clear Play music button. Only the native `playing` event switches the UI to Pause. Theme changes, scrolling, mute/volume changes, and unrelated clicks never retry playback. No browser restrictions are overridden by the application.

Play/Pause, Mute/Unmute, a labeled volume slider, volume percentage, and a live status message are visible in the hero's normal document flow. This avoids covering mobile content or the fixed companion. Media loading and errors are reported in the same place; after the file becomes available, explicit Play can retry. The element uses metadata preload, and cleanup pauses it, releases its source, and invalidates pending play requests. Development StrictMode does not cause a second startup attempt.

Preferences are stored under `cnp-music-preferences`: `volume` (0–1), `muted`, and `pausedByUser`. A manual pause stays paused through scrolling, theme changes, and reloads until Play is pressed; a saved manual pause therefore suppresses the next startup attempt. Malformed or unavailable storage falls back to in-memory defaults. Dialogs and mobile navigation can hide the controls without replacing the audio element or restarting playback.

## Verification

```sh
npm run typecheck
npm run lint
npm run build
npm run check:assets
npm run preview
npm run test:companion
```

For audio checks, run `npm run test:audio` against the production preview at `http://127.0.0.1:4173`, or set `PORTFOLIO_TEST_URL`. No separate development server is required. Browser tests use installed Chrome, or `PLAYWRIGHT_CHANNEL=msedge`.

The audio tests use controlled Chrome policies to exercise both a blocked attempt and permitted autoplay, with audio output muted at the browser-process level during automated QA. The media element itself is unmuted in the audible-autoplay case. Native decoding, playback time, looping, control state, and promise rejection are checked; physical speaker output and real phone browsers are not verified. Visitors' browsers and device settings ultimately decide whether audible autoplay is allowed. The application falls back to explicit Play rather than trying again automatically.

The model test samples 20 seconds at 30 fps for desktop/mobile camera clipping, grounded feet, independent joints, loop continuity, wave/blink behavior, and geometry/material disposal. Browser checks exercise actual rendering, automatic dance, mouse/keyboard greeting, fixed placement during slow/fast scrolling in both directions, footer visibility, transformed-root isolation, transparent-area click-through, inactive-tab suspension, modal layering, reduced motion, theme changes, fallback visibility, and axe checks. Screenshots and reports are local under ignored `.qa/companion/`.
