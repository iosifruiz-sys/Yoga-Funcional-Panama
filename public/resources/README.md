# Approved resources

Decap collections Recursos ES / RU / EN store independent JSON records in
`src/content/resources/<language>/`. Only the ES catalog is currently enabled.
Adding RU/EN drafts does not affect ES eligibility or create localized pages.

The first ES PDF is an incomplete, unapproved draft. Supply its final unchanged
PDF and approved description through Decap before publishing. No PDF replacement,
invented description, document properties or cover preview is included.

Files and optional images uploaded by these collections live in `public/resources/`
and use `/resources/...` paths; the existing blog media paths are unchanged.
An image is optional: the preview can render the record's title typographically.

A record is public only when draft=false, approved=true, its approved description
is present, and exactly one file or HTTPS URL is supplied. Local files must exist;
PDF files must have a PDF signature. External URLs are checked during generation
and excluded on failure or timeout (HEAD, with a GET fallback for unsupported HEAD).
An external link can still change after generation; rebuild to recheck it.

The optional blog relation only renders if the corresponding same-language
article is published. It never blocks the resource's primary action.
No individual resource pages or players are generated.

Production Decap backend remains unchanged. Do not publish test content to main.

## Local verification

Run `node --test tests/resources/assets.test.mjs` for asset/link checks.
For browser integration, set `RESOURCES_REVIEW_OUTPUT` to an absolute artifact
directory and optionally `PLAYWRIGHT_CHANNEL` to an installed browser channel,
then run `node tests/resources/review.mjs`.
The review creates clearly marked synthetic entries and a temporary local route,
captures screenshots/video, and removes those files in a finally block. It never
writes through Decap or changes its production backend. Run the normal check/build
after the review; no review route or fixture should appear in the output.
