# Public site assets in R2

The Pages release excludes `/assets/` and `/eddy-carrot-patch/assets/`. The public `edmund-site-assets` Worker reads their packed files from the existing `edmund-assets` R2 bucket. `tools/rewrite-pages-assets.py` changes published references during the Pages build. Local source paths remain unchanged for development.

The Worker only serves paths under `site-assets/v1/assets/` and `site-assets/v1/eddy-carrot-patch/assets/`. The flashcard v1 MP3s use 256 range-readable packs; the other assets use 19 site packs and 3 Eddy packs. The listening-practice JSON overrides correct embedded image URLs. Paper 3 readers keep their own local `paper3/*/assets/` directories.

For an asset refresh, first build the packs and overrides:

```sh
python3 tools/build-pages-flashcard-packs.py
python3 tools/build-pages-asset-packs.py
python3 tools/build-eddy-asset-packs.py
python3 tools/build-listening-practice-overrides.py
```

Set `WRANGLER_BIN` to the Wrangler executable if it is not on `PATH`. Upload all changed packs with `python3 tools/upload-pages-assets-r2.py`, then upload the JSON override files under `site-assets/v1/overrides/listening-practices/`. Verify several public URLs and byte ranges before deploying this Worker and then the Pages site. The uploader checkpoints each pack by key and SHA-256. If updated packs reuse a key, deploy them together with a matching index; a new key prefix is preferable so the old Worker continues to serve its original bytes during a release.

The Pages build refuses incomplete pack indexes. Keep the index `meta.r2UploadComplete` flags false until every referenced R2 object is uploaded.
