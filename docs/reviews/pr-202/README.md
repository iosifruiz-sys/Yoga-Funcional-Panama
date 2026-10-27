# PR #202 verification — 2026-10-27

Baseline: main 9e8930efb12e1b32dc1cfe8d9dff3f5022212f9e. Existing PR branch retained; no merge, auto-merge or production publication.

## Figma comparison and correction

Reference: https://www.figma.com/design/nHfmelI3LCp6Z6HlGQjS3f/yoga-func?node-id=56-25

Read text layers 56:25, 56:26, 56:27 and reference image 56:24. Corrected the initial PR's undersized text and spacing, only inside the ES desktop offer rules. At 1920px: League Gothic 40px heading, Inter 20px description, 20px/500 final line, -3% tracking, 648px description width. Text x=52px; title-to-description=90px; description-to-final=64px; title-to-orange stripe=267px. These match the reference layer offsets relative to its orange stripe. Smaller widths use fluid sizes within the existing 62rem breakpoint. Approved copy, punctuation and emoji remain verbatim; reference case styling is represented in the approved data.

Desktop ES screenshots inspected: no text overlap or horizontal overflow, original two columns and open space above the text retained. Reference has one raster desktop size, not three responsive artboards; smaller-width screenshots are responsive checks, not claims of pixel identity to separate Figma frames. Existing photo/title geometry remains that of main, including its viewport-dependent crop.

- [1280 × 900](pr-es-1280.jpg)
- [1440 × 900](pr-es-1440.jpg)
- [1920 × 1080](pr-es-1920.jpg)

## Regression comparison

Temporary local comparison routes used the original main page and Hero source; all other shared source files are unchanged from main. Temporary routes and CMS harness were removed before delivery. Read-only DOM comparison covered rendered geometry, font, margin, padding and text of all homepage sections, header/footer, photo and booking controls. The new ES desktop offer and replaced quote were excluded where expected. Only animated Yoga/Funcional vertical position/height were excluded from equality because snapshots capture different animation phases; animation source is unchanged. Results are in [regression-results.json](regression-results.json).

ES and RU at 390, 768, 1280, 1440 and 1920px: no unexpected differences. ES mobile/tablet retains original quote; RU retains original Hero. No changes to other homepage sections.

| Width | main scrollWidth (ES and RU) | PR scrollWidth (ES and RU) |
| --- | --- | --- |
| 390 | 535 | 535 |
| 768 | 1046 | 1046 |
| 1280 | 1265 | 1265 |
| 1440 | 1425 | 1425 |
| 1920 | 1905 | 1905 |

RU overflow predates this PR; the same overflow also exists in ES at these narrow widths. Not fixed because outside scope. Desktop scrollWidth is below innerWidth because Chrome reserves a scrollbar.

Mobile screenshot pairs (390 × 844): [ES main](main-es-390.jpg), [ES PR](pr-es-390.jpg), [RU main](main-ru-390.jpg), [RU PR](pr-ru-390.jpg). These are browser viewport captures, not physical-device testing or animation-normalized pixel diffs.

## Decap UI

Used the same Decap beta script and complete PR configuration in an isolated local harness with Decap's official test-repo backend, seeded with current project JSON files. Production turbo-github configuration was never changed. All three fields opened with correct existing values under Página principal → Hero ES.

Individually changed offerTitle, offerDescription and offerClosing; after each edit, only that input value changed and all other input values remained equal. Accents and emoji displayed correctly. Saved a test description in the in-memory backend, navigated away, reopened Hero ES and verified persistence. Existing Hero RU opened with original fields and values.

- [Independent description edit with other fields intact](cms-fields.jpg)
- [Saved and reopened test value](cms-reopened.jpg)

No test value was committed to project data. Authenticated Decap Turbo/GitHub publication and its deploy pipeline were deliberately not exercised. The site's approved JSON values render through Astro; this local UI test is not an end-to-end production publication test.

## Technical checks

After the CSS correction and removal of temporary comparison routes: npm run check (47 files, zero errors/warnings/hints); npm run build (39 pages); node --test tests/resources/*.test.mjs (5 passed); git diff --check passed. Existing Playwright snapshot suite was not run because its browser executable is unavailable in this environment; the connected Chrome comparisons above were used. Blog source, routing, shared styles, metadata and assets are unchanged; no separate full blog visual comparison is claimed.

Application files changed remain src/components/Hero.astro, src/data/hero/es.json and public/admin/config.yml. docs/reviews/pr-202 contains review evidence only, outside the site's public output. Original working folder was untouched.
