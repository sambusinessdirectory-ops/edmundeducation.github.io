# Sentence Structure: Japanese garden, lessons 61–90

Implemented 12 September 2026 using the approved continuous-motion and extended-scenery workflow.

## Scope

The coast remains 1–30, autumn remains 31–60, and the Japanese garden adds 61–90. Lessons 91–345 remain in the ordinary lesson list. Real catalogue IDs, exercises, progress, companion choices and the single saved location per account/system continue through the existing host callbacks. This work adds no learning-attempt writes or new persistence scheme.

The shared theme is composed by `sentence-structure-realms.mjs`. Garden geometry, painted motion, wildlife and DOM/CSS effects are separated into the `sentence-structure-zen*` modules. Original positions for the first 60 stones stay unchanged.

## Final art direction: broad, quiet shapes

The user rejected the first garden extension as too crowded and granular. The final background was repainted with smoother ivory sand, broad raked curves, larger foliage masses, fewer tiny border leaves and restrained surface texture. Do not restore the discarded draft's dense squiggles, repeated gravel marks, sparkling specks or micro-detail.

Keep clean shapes at normal zoom as well as a quiet, continuous painted surround at overview zoom. More edge space does not mean more decorative objects. Preserve the ponds, house, lantern locations and clear walking lanes when repainting; navigation and motion masks are traced against this composition.

Built-in image generation was used, without the fallback CLI. Exact prompts, including the final simplification instruction, are in `ARTWORK-PROMPTS.md`. Local final masters are retained under `/Users/sammak/Documents/ChatGPT/Astra/outputs/sentence-zen-assets/`.

| Production file | Source size | Use |
| --- | --- | --- |
| background.webp | 1496 × 1051 RGB | Final simplified garden and painted side extensions |
| koi-red.webp | 1536 × 1024 RGBA | Red/white swimming koi |
| koi-tricolor.webp | 1536 × 1024 RGBA | Tricolor swimming koi |
| lotus.webp | 1254 × 1254 RGBA | Nine rotating leaves |
| cat.webp | 1536 × 1024 RGBA | Sleeping calico bobtail on the veranda |
| stone.webp | 1677 × 938 RGBA | Pale garden platforms with subtle raked rings |

Production WebP encoding preserves the generated alpha. No checkerboard removal or RGB recoloring was needed. Earlier unpublished background drafts remain in the local output for comparison.

## Coordinates and paths

The garden begins at world Y 3900 and displays at 3200 × 2250. The central playable width is 1600 with 800 painted units on either side; total world height is 6150. Garden row baselines are local Y 715, 1090, 1450, 1860 and 2120. Convert source coordinates with `artPoint`; use `WATER_SHAPES` for visible water and `POND_BANKS` for conservative hoof collision.

Pale irregular paving connects the garden stones. The 81→82 bend goes around the lower pond at X 1538. A decorative mist border joins 60→61; it intercepts neither pointers nor walking. Paths can cross the painted bridge and reject pond destinations. Saved pins keep Eddie's red, Phoebe's lavender and Elsie's yellow flag; a flower crest identifies a garden pin.

## Gentle movement

- A single full-scene WebGL redraw displaces masked foliage, water and the noren curtain. This avoids a stationary foliage silhouette under a moving copy. Roots, trunks, rocks, sand and house remain anchored. Water motion is separate from the wind; curtain movement grows from its fixed upper edge toward its hem.
- Six koi follow continuous elliptical routes, two per pond, over 49–63 seconds. Tangent headings turn smoothly without mirror flips. Dense adjacent image strips bend each body and tail. Eye patches compress for staggered 0.4-second blinks. Clear the animal canvas on every frame; do not dissolve complete poses over each other.
- Nine lotus leaves rotate a full turn over 94–198 seconds, alternating directions. Apply water-plane perspective outside the rotation so the leaves remain flat.
- Five soft circular lamp blooms breathe over roughly 8–11 seconds. Three faint cooking-steam wisps leave the open doorway. Eight small red maple leaves drift slowly across the visible garden only.
- The small sleeping cat stays on the wooden veranda. Its body breathes gently, and the short tail has an eased 4.5-second gesture within a 10.8-second cycle. Paint articulated body/tail layers with one cleared silhouette.

All garden painting uses the existing shared animation clock, capped at 30 painted frames per second and skipped when this realm is outside the viewport. Pause when the map is hidden. Reduced motion freezes the wildlife and scenery, stops CSS effects and hides steam/falling leaves. No additional perpetual animation loop or timer is installed.

## Verification and release

The unit suites cover all 8,100 ordered stone-to-stone routes, both previous realms, pond collision, full koi cycles and heading continuity, blinks, cat motion and complete opposing lotus turns. Host checks cover the 90-map/255-list split, existing saved state and lesson progress.

The local browser fixture blocks external services and uses isolated fake accounts. It samples actual rendered animal and scenery pixels, brief blinks at display cadence, water/noren/foliage patches, lamp/steam/leaves, both realm-border directions, saved garden flags, reduced motion and desktop/tablet/phone painted coverage. The coastal fixture opens every one of the 90 real lesson links. The autumn regression retains rabbit gestures and river/fog/light checks.

Review the normal entrance, teahouse/cat, overview, cloud join and animal pose sheet. Publish through the existing Pages workflow, then confirm the canonical release stamp and SHA-256 of the new modules and assets. Keep the accepted clean background and motion timing as the baseline for subsequent realms.
