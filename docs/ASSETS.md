# Asset inventory

## Music

The user-supplied `public/audio/background.mp3` (5,292,918 bytes) is the only music track. It is configured for development and production and copied unchanged to `dist/audio/background.mp3`. No additional audio was downloaded. The asset and audio checks compare the production copy with the source file.

## Technology logos

`public/icons/technologies/` contains seventeen local SVG assets for PHP, Laravel, HTML, CSS, JavaScript, React, C#, .NET, MySQL, Microsoft SQL Server, MongoDB, Express, Node.js, Flutter, Dart, Git, and GitHub. ASP.NET MVC and NativePHP use clear text labels in the marquee rather than an unverified logo. The SVG data comes from the installed Devicon/Devicon Plain Iconify packages; `scripts/prepare-tech-icons.mjs` regenerates the files. These are CSS masks with theme-aware colors, so logos retain legibility in either palette. The Devicon MIT notice is included at `public/icons/technologies/LICENSE.txt`. Sources: [Devicon](https://github.com/devicons/devicon), [MIT license](https://github.com/devicons/devicon/blob/master/LICENSE).

Inspected visually on October 27, 2026. The filenames below map the user's supplied assets to their displayed content. Original non-sensitive files are retained under `assets/originals/`, and optimized public copies have descriptive names.

| Original filename                                                             | Verified content                                                                                               | Public derivative                                              |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `866203952_1691749402591555_8313694872604414415_n.jpg`                        | Champion, Web Development Competition, IT Days 2025, April 23, 2025                                            | `images/certificates/web-development-champion.webp`            |
| `871017688_1142228098576805_6868662248075544614_n.jpg`                        | 3rd Placer, Image Editing Competition, IT Days 2026, April 6, 2026                                             | `images/certificates/image-editing-third-place.webp`           |
| `858839172_3020808361621626_5897120912859495022_n.jpg`                        | Certificate of Completion, DEVCON Legazpi × Sui Code Camp 2026, July 30, 2026                                  | `images/certificates/devcon-sui-completion.webp`               |
| `858839172_1401957398675053_108402588353596018_n.jpg`                         | Participation: Future of Cloud Computing / Cloud Computing and the Future of Web Services, November 13, 2024   | `images/certificates/cloud-computing-participation.webp`       |
| `861843290_1440036214898004_8295058484538189910_n.jpg`                        | Participation: Animation & Application Development / Character Animation and Motion Capture, November 13, 2024 | `images/certificates/animation-participation.webp`             |
| TOPCIT original, moved to ignored `.private/topcit-original.jpg`              | Assessment result, Level 2; test date July 23, 2026                                                            | `images/certificates/topcit-level-2-redacted.webp`             |
| `portrait.jpg`                                                                | Cristian seated at an event, intentionally blurred original                                                    | Original JPEG plus `portrait-480.webp` and `portrait-800.webp` |
| `projects/E-LIKAS.png`                                                        | E-LIKAS desktop dashboard with two mobile screen mockups                                                       | `images/projects/e-likas.webp`                                 |
| `projects/server-disctionary.png`                                             | Windows Server Dictionary with search, categories and terminology cards                                        | `images/projects/windows-server.webp`                          |
| New public-page capture: `assets/originals/projects/sui-code-camp-public.png` | The code camp proof-of-learning portfolio, captured read-only                                                  | `images/projects/sui-code-camp.webp`                           |

Each certificate has a matching `-thumb.webp` derivative. Only the championship thumbnail is loaded in the main layout; other full certificate images are requested when their dialog opens. Certificate images are never cropped in the viewer.

## TOPCIT handling

The original was removed from public assets before starting a server or production build. It is retained in `.private/`, excluded from both Git and Vercel upload, and denied by Vite's development file serving. The redaction is burned into the raster pixels, covering both personal fields and the machine-readable verification regions. The public image and thumbnail were visually checked. Other certificate content is unchanged apart from image encoding/thumbnail sizing. Do not regenerate this public asset directly from the private original without reviewing redaction again.

## Public project verification

All three URLs returned HTTP 200 in Chrome during read-only verification on October 27, 2026:

- [E-LIKAS](https://e-likasligao.online/): public disaster preparedness landing page with hazard maps, alerts, evacuation centers, directions and offline access descriptions. The supplied dashboard screenshot is used. The brief supplies the staff capabilities, backend stack and PHP-ML details; these were not independently tested behind authentication. No city adoption, measured impact, leadership, or sole authorship claims were added.
- [Windows Server Dictionary](https://windows-server-dictionary.vercel.app/): public searchable terminology reference with categories such as identity, networking, security, storage and virtualization. No framework or backend is inferred.
- [DEVCON Sui Move Code Camp project](https://devconsui-move-code-camp2026-level1-sable-nu.vercel.app/): a public proof-of-learning portfolio introducing its participant and Sui Move, with a link to a blockchain learning record. It is presented as a code camp project. The blockchain transaction and authorship claims were not independently verified, so the portfolio does not assert production blockchain expertise.

Public-page screenshots and inspection output are saved under ignored `.qa/projects/`. The provided TikTok caption informed the visual concept only; the original video was not inspected.
