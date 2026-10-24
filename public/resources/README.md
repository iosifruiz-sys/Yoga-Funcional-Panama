# Approved resource files

The final approved PDF for **¿Qué tan móvil eres?** is not present in this repository.
Do not add a draft or generate replacement PDF content.

After approval, add the unchanged PDF here as `que-tan-movil-eres.pdf` and set
`pdf: 'resources/que-tan-movil-eres.pdf'` in `src/data/resources.ts`.
The catalog will then render its localized download link automatically.

An approved cover image can be added here and its relative public path assigned
to `cover` in the same record. Until then the catalog uses a typographic cover
containing only the supplied title and existing brand name, not a PDF preview.

Add future materials as additional records in `src/data/resources.ts`.
Supply descriptions in both ES and RU, identify the document language, and set
asset paths only when the approved files exist. No page structure edits are needed.
