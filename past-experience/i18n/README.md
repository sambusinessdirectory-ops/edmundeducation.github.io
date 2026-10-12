# Churchill page translations

`../index.html` and `../churchill-research/index.html` are the English sources. The four `index-zh.html` and `index-bi.html` pages are generated static pages. They need no translation service at runtime.

`zh-hant.json` stores Traditional Chinese translation drafts keyed by the exact normalized English text. `editorial-overrides.json` contains edited wording for historical titles, institutions, serious events, profile summaries, and interface copy. `build.py` also applies consistent Traditional Chinese terminology. The research bibliography keeps original English titles and annotations so readers can verify citations; the downloadable Markdown and PDF remain English originals.

To rebuild after editing either source or the catalogue:

```sh
python3 -m pip install beautifulsoup4 opencc-python-reimplemented
python3 past-experience/i18n/build.py
```

The build stops if a new English text node has no catalogue entry. Review both language pages in a browser before publication, especially new historical prose and dates.
