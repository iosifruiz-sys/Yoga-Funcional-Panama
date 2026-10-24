# Approved resources

Decap collections Recursos ES / RU / EN store independent JSON records in
`src/content/resources/<language>/`. Only the ES catalog is currently enabled.
Adding RU/EN drafts does not affect ES eligibility or create localized pages.

The first ES material is the user's final approved 8-page PDF, copied unchanged.
Its SHA-256 is `4150c89b9df488118acf239469c3ea86c86516dff1f40caad4c6e5e5bedcd94d`.
The PNG is a raster rendering of page 1, not a redesigned cover or a new PDF.
Its record is eligible on this Draft PR branch; no production publication is performed.

Files and optional images uploaded by these collections live in `public/resources/`
and use `/resources/...` paths; the existing blog media paths are unchanged.
An image is optional: the preview can render the record's title typographically.

A record is public only when draft=false, approved=true, its approved description
is present, and exactly one file or HTTPS URL is supplied. Local files must exist;
PDF files must have a PDF signature. External URLs are checked during generation
with up to 3 attempts. HEAD errors from common CDN restrictions fall back to GET.
Confirmed invalid URLs or HTTP 400/404/410/422 are excluded. Network timeouts,
throttling, access challenges and server errors remain inconclusive: after retries,
an explicitly editor-approved destination is retained with a build warning. This
does not claim a successful check. Drafts/unapproved destinations are never retained.
An external link can still change after generation; rebuild to recheck it.

Navigation, the ES catalog route and sitemap use the same eligible collection.
No eligible ES records means no catalog page, navigation entry or sitemap URL.
Other formats use the same preview: external links open the destination; local
files download with the matching format label. No players are embedded.

The optional blog relation only renders if the corresponding same-language
article is published. It never blocks the resource's primary action.
No individual resource pages or players are generated.

Production Decap backend remains unchanged. Do not publish test content to main.

## Local verification

Run `node --test tests/resources/assets.test.mjs tests/resources/decap.test.mjs`
for PDF integrity, asset/link policy and CMS configuration checks.
For browser integration, set `RESOURCES_REVIEW_OUTPUT` to an absolute artifact
directory and optionally `PLAYWRIGHT_CHANNEL` to an installed browser channel,
then run `node tests/resources/review.mjs`.
The review creates clearly marked synthetic entries and a temporary local route,
captures screenshots/video, and removes those files in a finally block. It never
writes through Decap or changes its production backend. Run the normal check/build
after the review; no review route or fixture should appear in the output.
`node tests/resources/activation.mjs` temporarily marks the real record as a draft,
builds and verifies the catalog/navigation/sitemap are absent, and restores the
record in finally. Run a normal build afterwards to restore the review output.
