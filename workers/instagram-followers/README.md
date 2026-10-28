# Homepage Instagram follower count

The owner manages the follower count manually. No scheduled Worker refresh or Codex daily check is enabled.

The homepage reads the count from R2 through the read-only `/followers` endpoint. To update it, upload `site-data/instagram-edmundeducationedu.json` to the `edmund-assets` bucket with `username`, integer `count`, `approximate: false`, ISO `updatedAt`, and `source: "owner-reported"`. Keep the homepage fallback count/date in `index.html` consistent. Do not change the date unless the owner supplies an updated count.

Deploy Worker configuration changes with Wrangler. The cron list must remain empty.
