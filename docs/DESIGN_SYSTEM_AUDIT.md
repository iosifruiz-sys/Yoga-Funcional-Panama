# Yoga Funcional Panamá — Design System Audit

> Extraction snapshot of the current implementation. The source of truth is the authored CSS and Astro component structure in `src/`; this document does not replace or normalize those values. Candidate tokens at the end are proposals only and are not implemented.

## Foundations

The site is a bilingual, mobile-first editorial system built around high-contrast surfaces, oversized condensed typography, asymmetrical composition, square controls, visible rules, and a single orange accent. The homepage is composed from six numbered sections; the blog reuses the same foundations with a narrower reading system.

The implementation currently defines:

- six opaque palette colors plus two translucent separator colors;
- five intentional type families (`Molot`, `League Gothic`, `UnifrakturCook`, `Inter`, and RU-specific `Oswald`), with system fallbacks;
- one fluid page gutter: `clamp(1rem, 3vw, 2.75rem)`;
- one principal hard rule: `2px solid #171714` via `--border`;
- responsive boundaries at `37.5rem`, `48rem`, and `62rem` (with paired maximums at `37.5rem`, `47.999rem`, and `61.999rem`);
- capability queries for hover and preference queries for reduced motion.

Primary implementation sources:

- `src/styles/global.css`: homepage, shared header/footer, global foundations, locale overrides;
- `src/styles/blog.css`: blog index and article presentation;
- `src/layouts/BaseLayout.astro`: font delivery, viewport, locale and shared document shell;
- `src/components/*.astro`: component anatomy and localized content bindings;
- `src/i18n.ts`: ES/RU copy and copy-driven layout variants.

## Colors

### Opaque palette

| Proposed semantic name | Exact value | Existing source | Current usage |
| --- | --- | --- | --- |
| `--color-accent-primary` | `#ff6500` | `--color-orange` | Yoga accent word, section numbers, emphasized heading lines, CTA surfaces, schedule times, prices, active locale, links/focus/hover states, About circle, Contact surface. |
| `--color-surface-warm` | `#ceccb3` | `--color-warm` | Body and header background, Hero surface, alternating class/schedule surfaces, Yoga text-shadow, footer metadata text. |
| `--color-surface-light` | `#ece9df` | `--color-light` | Method, Classes, Schedule, About and blog surfaces; light text on dark surfaces; dark-surface focus outline. |
| `--color-ink` | `#171714` | `--color-dark` | Default text, borders, dark panels, footer, Contact action, browser theme color, dark focus outline. |
| `--color-white` | `#fff` | `--color-white` | Hero `Funcional`, Classes intro text, skip-link background and header CTA text. Equivalent long-form value in `design-system.json`: `#FFFFFF`. |
| `--color-image-placeholder` | `#66655d` | `--color-muted` | Hero image placeholder/background only. |

### Translucent and contextual colors

| Proposed semantic name | Exact value | Current usage |
| --- | --- | --- |
| `--color-rule-dark-soft` | `rgba(23,23,20,.3)` | Hero column divider, Hero kicker divider, mobile Hero metadata divider. |
| `--color-rule-light-soft` | `rgba(236, 233, 223, .35)` | Footer social and metadata separators. |
| Contextual foreground | `currentColor` | Class action divider, blog CTA/share/strong-callout borders; inherits the local surface foreground. |
| Transparent surface | `transparent` | Buttons, mobile Hero image surface, schedule booking link, share button. |
| Inherited foreground | `inherit` | Links and controls that retain the enclosing surface color. |

### Color-state behavior

- Global keyboard focus uses a `3px` orange outline with `4px` offset. Reserve uses dark focus; schedule booking uses light focus.
- Header links and many blog links turn orange on hover.
- Header CTA switches from dark/white to orange/dark on hover.
- Schedule booking switches from orange/dark to dark/light on focus-within and fine-pointer hover.
- Contact action changes from light to orange text on hover.
- Footer metadata links use opacity `.7` on fine-pointer hover.
- Alternation is structural: concept rows alternate light/dark, class item 2 is dark and item 3 warm, schedule even rows are warm.

**Extracted color count:** 8 explicit CSS color values (6 opaque, 2 translucent), excluding keywords such as `transparent`, `inherit`, `currentColor`, and the equivalent keyword `white` used once.

## Typography

### Font delivery and stacks

| Role | Authored family/stack | Weight(s) | Source and use |
| --- | --- | --- | --- |
| Display | `'Molot', 'Arial Black', Impact, sans-serif` | `900` | Local `/fonts/Molot.otf`; major section headings and article display titles. |
| Hero masthead exception | `'Arial Black', Impact, sans-serif` | `900` | `.funcional` explicitly overrides the display stack in both locales. |
| Utility/condensed | `'League Gothic', 'Arial Narrow', sans-serif` | commonly `400`/normal | Numbers, metadata, schedules, large class names, prices, footer and technical labels. |
| Accent | `'UnifrakturCook', serif` | `700` | The single rotated orange `Yoga` word. |
| Body | `'Inter', system-ui, sans-serif` | `400`, `500`, `600`, `700` loaded | Navigation shell, prose, descriptions, controls and blog body copy. |
| RU condensed override | `'Oswald', sans-serif` | `500` loaded | RU desktop utility system and selected RU mobile labels requiring Cyrillic support. |

Google Fonts loads Inter `400;500;600;700`, League Gothic, Oswald `500`, and UnifrakturCook `700`. Molot is self-hosted with `font-display: swap`.

### Core typographic roles

#### 1. Oversized display

- Family: display stack, weight `900`, uppercase.
- Tight geometry: line-height `.74`–`.84`; tracking typically `-.045em` to `-.07em`.
- Uses fluid viewport sizing, for example:
  - `.funcional`: `16.1vw/.74`, `letter-spacing: -.07em` (explicit Arial Black stack);
  - Method: `clamp(3.6rem, 15vw, 13.5rem)/.78`;
  - Classes: `18vw/.78`, desktop `clamp(3.6rem, 15vw, 13.5rem)`;
  - Schedule: `min(18vw, 13.5rem)/.78`, desktop `11.5vw`;
  - About name: `clamp(2.75rem, 6.4vw, 6rem)/.78`;
  - Contact title: `clamp(4rem, 9.8vw, 9.5rem)/.76`;
  - Blog article H1: `clamp(3.7rem, 8.8vw, 9rem)/.84`.

#### 2. Section heading composition

- Display headings are split into controlled block spans; accent lines are orange and often offset horizontally.
- Method and Classes use `letter-spacing: -.065em`; About uses `-.055em`; Contact uses `-.06em`.
- Mobile Method has explicit line sizes `17.8vw`, `23.7vw`, and `24.5vw` for its nested pieces.
- Desktop Schedule becomes an inline flex composition with `.12em` gap.
- Copy variants (`schedule-title-mobile`/`desktop`) switch at `62rem` without changing the section anatomy.

#### 3. Utility and technical labels

- Family: League Gothic by default; Oswald for RU scopes.
- Typical tracking: `.05em`, `.06em`, or `.08em`; frequently uppercase.
- Section markers: `clamp(1.3rem, 3vw, 2rem)` or `clamp(1.3rem, 2vw, 2rem)`.
- Hero kicker/meta: `1.1rem`, mobile fluid overrides; RU mobile selected values are `.7rem`.
- Class/schedule numbers: `1.3rem`–`1.35rem`.
- Footer metadata: `.8rem`, narrow mobile `.72rem`.
- Blog taxonomy/meta: approximately `1.1rem`–`2rem`, generally `.06em` tracking.

#### 4. Utility display titles and numerals

- Accordion labels: `clamp(2.8rem, 10vw, 8.5rem)/.92`, weight `400`; desktop becomes `clamp(3rem, min(7vw, 8vh), 7rem)/.85`.
- Class titles: `clamp(3.4rem, 15vw, 8rem)/.9`, weight `400`; desktop `clamp(5rem, 8vw, 9rem)`.
- Prices: `clamp(6rem, 30vw, 12rem)/.75`; desktop `clamp(8rem, 14vw, 14rem)`.
- Schedule days: `clamp(3.8rem, 18vw, 8rem)/.9`; times: `clamp(2.8rem, 13vw, 6rem)/.9`.
- Blog list title: `clamp(3rem, 5.4vw, 5.75rem)/.88`.

#### 5. Body and editorial copy

- Global body family: Inter stack.
- Homepage descriptive copy commonly uses line-height `1.35` or `1.4` and sizes around `.9rem`–`1.5rem` through `clamp()`.
- About intro: bold `700`, `clamp(1.25rem, 1.8vw, 1.8rem)/1.15`.
- Blog list description: `clamp(1rem, 1.25vw, 1.15rem)/1.5`.
- Blog article description: `clamp(1.15rem, 1.65vw, 1.5rem)/1.4`.
- Blog body: `clamp(1rem, 1.25vw, 1.08rem)/1.75`, maximum width `46rem`.

#### 6. Navigation

- Desktop header: Inter, `.68rem`, weight `700`, uppercase, `.06em` tracking.
- Brand: utility family, `1.15rem/.85`, `.04em` tracking.
- Mobile navigation links: utility family, `clamp(3.5rem, 16vw, 8rem)/.95`, `.01em` tracking.
- RU mobile navigation: Oswald `500`, `clamp(3.15rem, 16vw, 8rem)`.

#### 7. Buttons and calls to action

- Header CTA inherits the compact header type.
- Hero reserve: body family, weight `700`, uppercase, `clamp(1rem, 2vw, 1.4rem)`.
- Class actions: utility `1.3rem`, `.05em`, uppercase.
- Schedule booking: utility `clamp(2rem, 9vw, 4.5rem)/1`, uppercase.
- Contact action: utility `clamp(2rem, 3.5vw, 3.5rem)/1`, uppercase; narrow mobile reaches `clamp(2rem, 10vw, 3rem)`.
- Blog CTA controls use body weight `700` or inherit utility article metadata.

### Locale-specific typography

#### Russian

- At desktop `min-width: 62rem`, `html[lang='ru']` replaces `--font-utility` globally with Oswald, weight determined by local rules or the loaded face (`500`).
- RU desktop Method heading has a distinct `clamp(5rem, min(18vw, 24vh), 15rem)` and `-.02em` tracking.
- RU desktop class titles are fixed at `4rem`; schedule heading and days use smaller Cyrillic-safe clamps.
- RU mobile explicitly applies Oswald `500` to menu links, accordion labels, the orange end-note, class titles, Hero `soon` metadata, and the center Schedule metadata item.
- RU mobile Hero kicker uses Oswald at `.7rem` and `white-space: nowrap`.
- RU mobile Method retains the display family but uses uniform `scale: 1.25` from the left and preserves its two-line localized composition.
- RU mobile Schedule heading uses uniform `scale: .90` from the left.
- RU blog mobile titles receive fixed reductions: list title `1.75rem`, article H1 `2.125rem`, with normal word breaking.

#### Spanish

- Spanish generally uses the shared Molot/League Gothic/Inter/UnifrakturCook system without font-family substitution.
- ES desktop class titles have a dedicated `clamp(4.5rem, 7.5vw, 8.5rem)`.
- ES mobile Schedule metadata uses a five-track grid (`auto 1fr auto 1fr auto`) to preserve equal real gaps between its three content-sized labels.
- ES desktop Schedule and Contact render alternative localized copy through desktop-only elements.
- ES mobile Contact intentionally shows the desktop closing copy while retaining mobile sizing, producing the approved ellipsis/`CONMIGO` wording.

### Text transformation and wrapping

- Display headings, technical labels, navigation, actions and schedule content are predominantly `text-transform: uppercase`.
- Intentional no-wrap surfaces include Hero masthead, Panamá, heading lines, Schedule times, localized metadata rows and the end-note.
- Body text uses normal case and normal wrapping.
- `overflow-wrap: anywhere` is used for shared class titles, schedule days and some blog navigation/title surfaces; RU mobile class titles override it to `normal`.

## Spacing

### Global spacing mechanism

- Page gutter: `--gutter: clamp(1rem, 3vw, 2.75rem)`.
- The gutter is reused by the header, Hero, every homepage section, footer and blog shell.
- Editorial section spacing is fluid and intentionally not a single modular scale.

### Most recurring authored values

The stylesheet contains 105 distinct `rem` literals overall (including type sizes, widths and breakpoints). The most frequently repeated values are:

| Value | Occurrences | Typical spacing use |
| --- | ---: | --- |
| `1rem` | 30 | component padding, gaps, margins, rule offsets |
| `2rem` | 29 | section/component padding and editorial separation |
| `1.25rem` | 25 | row/card padding, mobile copy spacing |
| `1.5rem` | 21 | gaps, padding, inter-block rhythm |
| `4rem` | 15 | section padding and clamp endpoints |
| `8rem` | 15 | large section/display clamp endpoints |
| `3rem` | 14 | section marker and editorial margins |
| `.75rem` | 13 | compact control/copy spacing |
| `2.5rem` | 12 | section marker and responsive padding |
| `1.75rem` | 11 | blog/contact spacing |
| `2.75rem` | 11 | gutter maximum, mobile statement spacing |
| `.5rem` / `.4rem` / `.65rem` | 5–6 each | technical rows and compact controls |

There are **at least 12 recurring core spacing values** used four or more times (`.25`, `.4`, `.5`, `.65`, `.75`, `.85`, `1`, `1.25`, `1.5`, `1.75`, `2`, `2.5`, `2.75`, `3`, `4`, `5rem`); the system is fluid rather than a strict token scale.

### Component rhythm

- Header height anchor: `4.25rem`; desktop Hero subtracts this from `100svh`.
- Homepage section intros generally use `4rem`–`8rem` fluid block padding.
- Cards/rows generally use `1rem`–`2rem` padding with the global gutter horizontally.
- Technical strips use `.4rem`, `.55rem`, or `.65rem` vertically.
- Blog sections use larger reading rhythm: list entries `2rem`–`5rem`, body heading separation up to `6rem`, article/footer separation up to `7rem`.

## Layout

### Global shell

- `box-sizing: border-box` is universal.
- Body has no margin, uses warm background and suppresses horizontal overflow.
- Header is sticky at the top with a three-column `auto 1fr auto` desktop grid.
- Main surfaces are full-bleed; internal alignment comes from `--gutter` rather than a global max-width container.
- Blog index/article content caps at `90rem`; prose and article footer cap at `46rem`.

### Homepage grid behavior

- Hero desktop uses a recomposed `46% 27% 27%` grid, with the image spanning columns 2–3 and the metadata positioned over its bottom edge.
- Hero mobile becomes one column and six content rows; the masthead, image/Panamá, quote, metadata and CTA are explicitly assigned.
- Method is a vertical editorial intro followed by a full-width accordion.
- Classes are stacked on mobile; desktop cards become a four-column editorial grid: number, title, copy, price.
- Schedule stacks metadata and days on mobile; desktop days form three equal columns.
- About desktop is a `200svh` scroll stage with centered image and copy placed to either side; mobile becomes document flow with a sticky visual track.
- Contact is a grid on broad screens and a block stack below `37.5rem`.
- Footer socials are flex on broad screens and a two-column grid below `37.5rem`.

### Key widths and dimensions

- Text measures: Method `39rem`, class copy `36rem`, Hero quote `22rem`, About intro `22rem`, blog list description `37rem`, article description `52rem`, blog prose/footer `46rem`.
- Editorial maximum: `90rem` for blog index/list/article.
- About image: desktop `min(38vw, 36rem)`, mobile max `27rem`, narrow mobile `88%` width.
- Desktop class item minimum height: `31rem`; RU desktop `35rem`.
- Desktop schedule slot minimum height: `28rem`.
- Desktop accordion closed row custom property: `5.75rem`.

## Breakpoints

| Boundary | Scope | Current behavior |
| --- | --- | --- |
| `max-width: 37.5rem` | Narrow mobile | About sticky track geometry, Contact block composition, Footer two-column socials. |
| `min-width: 48rem` / `max-width: 47.999rem` | Blog-only | Alternating two-column article cards vs one-column mobile list/article adjustments. |
| `min-width: 62rem` / `max-width: 61.999rem` | Primary desktop/mobile split | Header navigation, Hero recomposition, Method/accordion, Classes, Schedule, About, Contact, RU locale typography. |
| `(hover: hover) and (pointer: fine)` | Input capability | Schedule booking and footer metadata hover transitions. |
| `prefers-reduced-motion` | User preference | Removes Hero animation timing, resolves About to a static visible state, disables smooth scrolling. |

The paired decimal maximums prevent overlap with the inclusive desktop thresholds.

## Borders / Shapes

- Primary rule: `2px solid var(--color-dark)`.
- Secondary rules: `1px solid var(--color-dark)`, `1px solid rgba(23,23,20,.3)`, `1px solid rgba(236, 233, 223, .35)`, and `1px solid currentColor`.
- Blog and CTA underlines use `2px solid currentColor`.
- Controls and panels are square; no UI border radius is authored.
- The sole radius is the About graphic circle: `border-radius: 50%`, `aspect-ratio: 1`.
- Image geometry uses rectangular frames and explicit aspect ratios (`2 / 3`, `16 / 9`, source ratio `1194 / 1317`).
- Visual separators are structural: top/bottom rules mark section transitions, accordion rows, schedule rows, card boundaries and footer bands.
- Graphic treatments include the rotated Gothic word, vertical Panamá label, circular reveal/clip-path, oversized cropped type and arrow glyphs.

## Components

### Header

- **Purpose:** persistent brand, primary navigation, locale switch and booking action.
- **Anatomy:** menu toggle, brand, five nav links, ES/RU switcher, dark CTA.
- **Type/colors:** Inter compact uppercase shell; League Gothic brand; warm surface, dark rules, orange active/hover.
- **Spacing:** minimum `4.25rem`, `.55rem` by global gutter, `1rem` grid gap.
- **Responsive:** desktop three-column sticky bar; mobile hides brand and opens a fixed full-screen navigation overlay.
- **Locale:** labels localized; RU mobile menu uses Oswald `500` with a Cyrillic-safe size.

### Navigation / Mobile menu

- **Purpose:** route/anchor navigation and language switching.
- **Anatomy:** full-width ruled list plus locale item; hamburger morphs to close icon.
- **Type/colors:** very large condensed links on warm; dark separators; orange current locale.
- **Responsive:** active only below `62rem`; rows retain the existing horizontal gutter and scroll vertically.
- **Locale:** ES uses League Gothic; RU uses Oswald `500`.

### Hero

- **Purpose:** brand statement, image, positioning statement, metadata and primary booking CTA.
- **Anatomy:** kicker, `Yoga` accent, `Funcional`, vertical `Panamá`, portrait, quote, metadata, reserve band.
- **Type/colors:** white heavy masthead, orange Gothic accent, utility technical labels, Inter quote/CTA; warm field.
- **Spacing/layout:** viewport-height desktop composition; mobile one-column six-row composition.
- **Responsive:** desktop image overlaps right grid; mobile image is full width and `Funcional` uses horizontal `scale: .96 1` from the left.
- **Locale:** same brand words; localized kicker/quote/CTA/meta. RU mobile utility phrases use Oswald.

### CTA

- **Purpose:** booking or navigation action across Hero, Classes, Schedule and Contact.
- **Anatomy:** text plus arrow, usually full-width or edge-aligned.
- **Type/colors:** uppercase; orange/dark or dark/light high-contrast pairings.
- **Responsive:** fluid font sizing and minimum touch heights; existing geometry is component-specific rather than tokenized.
- **Locale:** localized labels; destination URLs remain shared.

### Method heading

- **Purpose:** establish the method proposition and lead into its explanation.
- **Anatomy:** orange section marker, two-line display heading, right-aligned descriptive block.
- **Type/colors:** Molot `900`, light background, orange second line, Inter description.
- **Responsive:** mobile assigns specific viewport sizes to heading fragments; desktop fills the viewport-relative intro and anchors copy near its lower edge.
- **Locale:** RU has unique two-line construction, mobile scale/offset and desktop size/tracking; description remains independently localized.

### Accordion row

- **Purpose:** disclose seven training qualities and explanations.
- **Anatomy:** two-digit number, large label, plus/minus icon, optional body panel.
- **Type/colors:** orange number, condensed utility title, body-family panel; alternating light/dark rows.
- **Spacing:** grid `2.5rem 1fr auto` on base/mobile; desktop `5rem minmax(0,1fr) 2.5rem`; desktop closed row `5.75rem`.
- **Responsive:** mobile label scale is fluid; desktop keeps stable row height during disclosure.
- **Locale:** RU mobile labels use Oswald `500` at `clamp(1.6rem, 7vw, 2.75rem)`; RU desktop inherits Oswald and uses a smaller Cyrillic-safe clamp.

### End-note

- **Purpose:** summarize the Method thesis in a compact orange band.
- **Anatomy:** one unbroken technical statement with inequality/equality marks.
- **Type/colors:** orange surface, dark condensed utility text.
- **Spacing:** `1.5rem` by global gutter.
- **Responsive/locale:** shared no-wrap presentation; RU mobile uses Oswald `500` and `clamp(.9rem, 3.5vw, 1.3rem)`.

### Classes cards

- **Purpose:** compare group, individual and personal formats.
- **Anatomy:** number, title, optional price, two body paragraphs, action row.
- **Type/colors:** large utility title/price, Inter copy; light/dark/warm alternating surfaces with orange details.
- **Spacing:** mobile grid gap `1rem` and `1.25rem`/`1.5rem` vertical padding; desktop four-column layout with fluid column gap.
- **Responsive:** stacked reading order on mobile; editorial cross-column placement on desktop.
- **Locale:** RU mobile titles use Oswald `500`, normal word breaks and a Cyrillic-fit clamp; desktop ES and RU have separate title sizes.

### Schedule

- **Purpose:** present class type, location, days, times and booking action.
- **Anatomy:** section intro, metadata strip, three slots, orange booking band.
- **Type/colors:** display heading, dark metadata strip, utility day/time text, orange times/action.
- **Spacing:** intro uses `4rem`–`8rem`; slots use `1.25rem` by gutter; metadata `.65rem` by gutter.
- **Responsive:** mobile slots stack; desktop uses three columns with vertical dividers and `28rem` minimum height.
- **Locale:** ES has desktop title copy and equal-gap mobile metadata columns; RU uses scaled mobile heading, Oswald metadata center, and smaller desktop heading/day sizes.

### Schedule metadata strip

- **Purpose:** identify method, class kind and location.
- **Anatomy:** emphasized brand, localized class kind, `Clayton`.
- **Type/colors:** dark surface, orange first item, light utility labels, `.06em` tracking.
- **Responsive:** desktop is three equal columns; both mobile locales use content columns 1/3/5 separated by equal `1fr` gaps.
- **Locale:** RU strip is `.7rem`; its central localized item explicitly uses Oswald `500` and `.08em` tracking.

### About

- **Purpose:** identify Iosif Ruiz, present portrait/biography and end statement.
- **Anatomy:** numbered header/name, circular portrait reveal, copy block, utility statement.
- **Type/colors:** display name with orange surname, orange circle, Inter biography, condensed statement.
- **Responsive:** desktop is a scroll-driven sticky stage; mobile puts the header on one baseline and moves copy/statement into normal flow around a sticky visual track.
- **Locale:** same geometry for ES/RU; desktop side offsets are explicitly repeated for both locale selectors.

### Contact

- **Purpose:** final conversion statement and WhatsApp action.
- **Anatomy:** numbered rule, display question, two-level closing statement, dark action band.
- **Type/colors:** orange surface, display title, utility closing copy, dark/light action.
- **Responsive:** centered title/closing at desktop and for both locales below `62rem`; below `37.5rem` becomes a block layout with mobile fluid sizes.
- **Locale:** ES and RU have separate mobile/desktop copy data. ES mobile intentionally displays `desktopClosing`; RU mobile uses its mobile closing.

### Footer

- **Purpose:** external social destinations and site attribution/navigation.
- **Anatomy:** four social links, copyright/About anchor, back-to-top brand anchor.
- **Type/colors:** dark surface, light utility social names, warm small metadata, translucent separators.
- **Responsive:** horizontal social row on broad screens; two-column grid below `37.5rem`.
- **Locale:** same social URLs and visual system; accessible labels and internal paths are localized.

### Blog index and article

- **Purpose:** editorial listing, long-form reading, sharing and adjacent navigation.
- **Anatomy:** taxonomy/markers, alternating entries, article header/cover/body, share controls, previous/next navigation.
- **Type/colors:** shared foundations; utility headlines/metadata, display article H1, Inter reading copy, orange links and markers.
- **Responsive:** two-column alternating entries from `48rem`; single-column mobile with full-bleed article cover.
- **Locale:** RU mobile list and article titles use fixed reduced sizes to protect Cyrillic wrapping.

## Responsive Rules

1. **Mobile-first base:** most homepage sections begin as vertical stacks with fluid `vw`/`clamp()` typography.
2. **Primary recomposition at `62rem`:** navigation becomes inline, Hero adopts three columns, Method becomes viewport-composed, Classes become four-column cards, Schedule becomes three columns, About becomes a scroll stage, Contact uses centered grid rows.
3. **Narrow mobile at `37.5rem`:** About changes track behavior, Contact drops to block flow, Footer uses a two-column grid.
4. **Blog recomposition at `48rem`:** alternating image/content cards appear; below it, articles and cards stack.
5. **Viewport-aware height:** `svh` is used for Hero, Method, About and Contact to avoid classic mobile `vh` behavior.
6. **Intentional transforms:** Hero masthead x-scale, RU Method uniform scale and RU Schedule uniform scale are presentation adjustments; they do not rewrite their layout grids.
7. **Reduced motion:** Hero reveals are effectively disabled and About resolves to visible, non-sticky content when requested.
8. **Input-aware states:** selected hover effects are limited to fine pointers, while focus-visible remains available globally.

## Localization Rules

- Locale is expressed on `<html lang="es|ru">`; visual divergence is scoped with `html[lang='es']` or `html[lang='ru']`.
- Copy is centralized in `src/i18n.ts`; components share markup wherever possible.
- Spanish is the default route; Russian uses `/ru/`. Blog paths follow the same locale rule.
- Mobile rules remain inside `max-width: 61.999rem`; desktop locale rules remain inside `min-width: 62rem` where applicable.
- RU desktop replaces the utility custom property with Oswald to provide consistent Cyrillic condensed glyphs.
- RU mobile applies Oswald only to explicitly selected utility surfaces rather than changing the shared variable.
- ES desktop-specific Schedule and Contact strings are rendered as parallel elements and toggled by breakpoint.
- Text length is handled through localized font sizes, normal/no-wrap rules, line construction and tightly scoped transforms; shared component geometry is generally preserved.
- Shared brand words (`Yoga`, `Funcional`, `Panamá`, `Iosif Ruiz`, `Clayton`) retain the same markup and typography across locales.

## Repeated Visual Patterns

1. **Numbered chapters:** `02` through `06` introduce sections in orange utility type; card/accordion entries use two-digit numbering.
2. **Oversized editorial type:** Molot/Arial Black headings dominate the viewport and deliberately approach or cross conventional grid proportions.
3. **Orange as action and thesis:** orange marks highlighted words, numbers, prices, times, active states, CTA surfaces and graphic emphasis.
4. **Alternating material surfaces:** warm, light and dark sections/rows create rhythm without cards or shadows.
5. **Technical labels:** condensed uppercase utility type, tracked letters, coordinates, locations and slash-separated metadata create the technical voice.
6. **Rules as structure:** `1px`/`2px` separators define sections, rows and action zones; containers remain square.
7. **Asymmetrical type composition:** horizontal offsets, vertical Panamá text, type/image overlaps and unequal editorial grids are intentional.
8. **Display + utility + body hierarchy:** heavy display sets the proposition, condensed utility carries structure/data, Inter carries reading content.
9. **Full-width action bands:** Hero reserve, Schedule booking and Contact action close major narrative blocks.
10. **Controlled bilingual divergence:** shared anatomy is retained, while Cyrillic receives Oswald, localized fit sizes and explicit wrapping behavior.
11. **Physical image treatment:** portrait imagery is large, rectangular and integrated with type or a simple orange circle rather than card chrome.
12. **Motion tied to hierarchy:** only Hero entrance and About reveal are prominent; both have reduced-motion handling.

## Candidate Design Tokens

These names are a proposed documentation layer only. They are **not** implemented, and exact current values should remain the migration source if token work is separately approved.

### Color candidates

```css
--ds-color-accent: #ff6500;
--ds-color-surface-warm: #ceccb3;
--ds-color-surface-light: #ece9df;
--ds-color-ink: #171714;
--ds-color-white: #fff;
--ds-color-muted: #66655d;
--ds-color-rule-dark-soft: rgba(23,23,20,.3);
--ds-color-rule-light-soft: rgba(236, 233, 223, .35);
```

### Typography candidates

```css
--ds-font-display: 'Molot', 'Arial Black', Impact, sans-serif;
--ds-font-hero: 'Arial Black', Impact, sans-serif;
--ds-font-utility: 'League Gothic', 'Arial Narrow', sans-serif;
--ds-font-utility-cyrillic: 'Oswald', sans-serif;
--ds-font-accent: 'UnifrakturCook', serif;
--ds-font-body: 'Inter', system-ui, sans-serif;

--ds-weight-regular: 400;
--ds-weight-medium: 500;
--ds-weight-bold: 700;
--ds-weight-display: 900;

--ds-leading-display-tight: .78;
--ds-leading-utility-tight: .9;
--ds-leading-body-compact: 1.35;
--ds-leading-body: 1.4;
--ds-leading-reading: 1.75;
```

### Spacing and layout candidates

```css
--ds-gutter-page: clamp(1rem, 3vw, 2.75rem);
--ds-space-1: .25rem;
--ds-space-2: .5rem;
--ds-space-3: .75rem;
--ds-space-4: 1rem;
--ds-space-5: 1.25rem;
--ds-space-6: 1.5rem;
--ds-space-7: 2rem;
--ds-space-8: 2.5rem;
--ds-space-9: 3rem;
--ds-space-section-min: 4rem;
--ds-space-section-max: 8rem;

--ds-width-copy-compact: 22rem;
--ds-width-copy: 36rem;
--ds-width-reading: 46rem;
--ds-width-editorial: 90rem;
--ds-header-height: 4.25rem;
```

### Border and breakpoint candidates

```css
--ds-border-strong: 2px solid #171714;
--ds-border-thin: 1px solid #171714;
--ds-radius-round: 50%;

/* Documentation aliases; custom properties cannot be used directly in media queries. */
--ds-breakpoint-narrow: 37.5rem;
--ds-breakpoint-blog: 48rem;
--ds-breakpoint-desktop: 62rem;
```

### Audit summary

- **Unique explicit CSS colors:** 8 (6 opaque palette values + 2 translucent rule values).
- **Intentional font families:** 5 primary families (`Molot`, `League Gothic`, `UnifrakturCook`, `Inter`, `Oswald`), plus the explicit Arial Black/Impact Hero treatment and fallback families.
- **Main typographic styles:** 10 recurring roles: oversized display, accent word, section heading, section marker, technical label, utility title/numeral, body copy, emphasized body, navigation, and CTA/action.
- **Recurring spacing values:** at least 16 values occur four or more times; 12 form the practical core from `.4rem` through `4rem`, while `--gutter` is the only formal spacing variable.
- **Component inventory:** 15 documented UI systems (Header, Navigation/Mobile menu, Hero, CTA, Method heading, Accordion row, End-note, Classes cards, Schedule, Schedule metadata strip, About, Contact, Footer, Blog index, Blog article).
- **Values that appear duplicated:** section-number declarations; repeated orange/utility styling; repeated desktop locale offsets for About; repeated `1px` translucent rules; repeated ES/RU Contact centering selectors; several near-identical fluid type and spacing clamps.
- **Values that appear one-off or highly specific:** `.68rem`, `.825rem`, `3.125rem`, `17.8vw`, `20.75vw`, `23.7vw`, `24.5vw`, x-scale `.96`, RU Schedule scale `.90`, RU Method scale `1.25`, and breakpoint companions `47.999rem`/`61.999rem`. These encode approved fit/composition decisions and must not be rounded casually.
- **Possible next-stage normalization:** formalize semantic colors, rule styles, shared section markers, core spacing aliases, type-role aliases and content-width aliases; consolidate only declarations proven visually equivalent. Locale fit values, breakpoint-specific display geometry and approved transforms should remain explicit unless separately revalidated.
