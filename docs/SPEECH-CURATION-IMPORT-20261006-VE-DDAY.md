# Churchill speech import record — 6 October 2026

This record accompanies the two private lesson payloads imported under the criteria in `SPEECH-CURATION-IMPORT-GOLDEN-MANUAL.md`. It records editorial decisions without copying the protected lesson content into the public repository.

| Field | Victory in Europe | Invasion of France |
| --- | --- | --- |
| Lesson slug | `churchill-victory-europe-1945` | `churchill-invasion-france-1944` |
| Supplied PDF | `Winston_Churchill_Victory_in_Europe_Annotated.pdf` | `Winston_Churchill_Invasion_of_France_Annotated.docx.pdf` |
| PDF SHA-256 | `6af5de239ab31954b304ef266a7108ed6eecf9cf52aa87710cab19ccc0f599af` | `479543007715a839c9bfede7c5f8b96c0dfb7849ec52be0ee7da36527a7d4139` |
| PDF pages | 95 | 155 |
| Reader segments | 86 | 149 |
| Bilingual annotation notes | 264 | 459 |
| Context cards | 5 | 5 |
| Reader URL | `/speech-curation-victory-europe.html` | `/speech-curation-invasion-france.html` |

## Source and editorial boundary

- **Victory in Europe** is a composite teaching document. Its first 56 reader segments follow Churchill's 8 May 1945 BBC broadcast; segments 57–86 follow his later House of Commons remarks. The title and section navigation state this distinction. The [Churchill Project's transcript](https://winstonchurchill.hillsdale.edu/victory-in-europe/) documents both parts. They are not presented as one continuous original broadcast.
- **Invasion of France** combines Churchill's first 6 June 1944 Commons statement on [Rome and the landings](https://api.parliament.uk/historic-hansard/commons/1944/jun/06/liberation-of-rome-landings-in-france) with his [later update that day](https://api.parliament.uk/historic-hansard/commons/1944/jun/06/landings-in-france). One bracketed editor note separating them in the PDF was removed from the speech text and represented as a section boundary. Two opening sentences present in Hansard but omitted from the annotated PDF were restored, with fresh Traditional Chinese translations and explicit provenance messages instead of invented PDF annotations. One five-word omission (“or the States they represent”) and its translation were restored against Hansard. The PDF's “firstline aircraft” was normalized to “first-line aircraft”. Other short wording variants remain as printed in the supplied teaching PDF rather than being silently replaced by the online Hansard transcription. The PDF's “I have” is retained where the online Hansard OCR prints “I lave”.
- The timestamp overlay `Sun, Jun 28 at 3:08 PM` appeared once in each source PDF. The stray clipboard label `Pasted text (2) Pasted text` appeared once in the VE Day PDF. Only these overlays were removed; each removal is recorded by source page in the private payload's `import_audit`.
- The supplied PDFs, not the site templates, supplied all existing bilingual line translations, context prose, note descriptions, example pairs and collocations. Source yellow highlights were extracted into context metadata. No archival image or audio recording was supplied for these two speeches, so the new pages do not claim or display either.

## Extraction and release checks

The repeatable parser is `tools/import-speech-curation-pdf.py`. It checks PDF headers, contiguous line groups, bilingual text, annotation titles, and every example pair present in a note. “Idea curation” notes in the VE Day PDF intentionally have no example pairs; the reader shows their prose without an empty example table. The two Hansard-restored D-Day sentences have no PDF-authored notes and are identified as such in their curation panels.

Before release, both normalized payloads were checked for blank English or Chinese, missing annotated notes, missing example translations, stray overlays, and context-highlight phrases not found in the context text. The import stored 86/264 and 149/459 line/note counts respectively in private lesson rows, each initially unpublished. The 1949 lesson remains at 221 segments and 711 notes. Desktop and 390px mobile browser smoke tests passed for both new readers: line counts, context opening, whole-text translation toggle, notes, text search and absence of unavailable audio controls. A separate library test passed for all three speech cards, a D-Day idea bookmark and cross-speech VE Day phrase search.

Access stays behind the existing speech-account/student/admin session checks. Lesson payloads are in `speech_curation_private.lessons` and are returned only by the protected lesson RPC after publication. The public repository includes the extraction adapter, reader templates and this record, not the lesson JSON or the supplied PDFs.

## Maintenance

To reproduce a package, run `python3 tools/import-speech-curation-pdf.py ve SOURCE.pdf OUTPUT.json` or replace `ve` with `dday`. Compare the generated source SHA-256, counts and `import_audit` to this record. If segmentation changes after students save marks, map old line IDs to new IDs before replacing the published lesson; reader marks currently use line indexes. The production rollback path is to remove the two new speech-list entries and clear their `published_at` values, leaving the private data available for repair.
