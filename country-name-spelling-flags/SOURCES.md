# Country flag sources

The country-spelling exercise stores local SVG copies so lessons do not depend on third-party requests at runtime.

- Existing essential-country assets were preserved from the original release.
- Missing standard-sovereign-state flags were synchronized from [FlagCDN](https://flagcdn.com/) using lower-case ISO 3166-1 alpha-2 filenames.
- The synchronization script is `tools/sync-country-name-spelling-flags.mjs`.
- Every downloaded asset is checked for an SVG root and rejected if it contains a `<script>` element.

Flag designs are public national symbols. FlagCDN provides the delivery service and derives its collection from Flagpedia.
