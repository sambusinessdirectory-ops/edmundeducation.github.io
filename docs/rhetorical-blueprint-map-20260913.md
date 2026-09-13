# Rhetorical Writing — Blueprint World

Date: 13 September 2026. Page: `common-expression-rhetorical-writing.html`.

The blueprint map presents the 29 existing rhetorical-writing lessons and all 870 existing questions. Full titles, lesson IDs, question objects, progress, saved-location preferences, bookmarks and lesson-opening behaviour remain connected to the shared Common Expression engine. Short captions on the map are display labels; the lesson card and lesson page retain the original complete title. No sample lessons from the reference image were imported.

## Artwork and layout

- A detailed blue architectural floor-plan illustration follows the user's blueprint reference. Fine white construction lines, room furnishings, stairs and drafting grid remain sharp at the normal display size.
- A separate atlas supplies the brass articulated lamp, thick ivory pinned platforms, brass set square, rolled plan, divider compass and navy/brass pencil. These are detailed raster illustrations, not geometric replacements.
- Both generated PNG masters are 1536×1024. The deployed background is quality-97 WebP (660,460 bytes); the tool atlas is lossless WebP (1,229,272 bytes). Encoding preserves source dimensions.
- The atlas was deliberately generated on a uniform magenta RGB screen. It is not described as native-alpha artwork. Runtime chroma compositing is cached once and clears the tool openings without altering the source master.
- The measured-paper road is a crisp SVG with layered edges, pale drafting grid and ruler ticks. Staggered landings and curved turns form one continuous route. Navigation follows the same sampled curves and rejects movement away from the road/platforms.
- Normal desktop view keeps the map within the screen height. Later selections scroll within the map so their lesson card remains reachable. The full-map button gives an optional overview; mobile retains a readable scale with panning.

## Motion

| Element | Behaviour and constraint |
| --- | --- |
| Lamp head and articulated arm | A gentle ±0.045-radian pivot over 8.5 seconds; the head rises/falls by about 15 pixels peak to peak. The wall plate stays fixed. |
| Lamp light | A soft warm cone and three quiet beams share the shade's exact transform. The light cannot detach from the moving lamp. |
| Drawing lines | At most two short warm tracing fronts run at once. Each has a 7-second pass and 4-second rest; fade-in/out prevents abrupt circuit changes. |
| Divider compass | A small ±0.032-radian adjustment over 17 seconds about its grounded needle tip. |
| Drafting pencil | A restrained ±0.013-radian motion over 13 seconds about its lead tip. |

Tracing highlights are masked to the actual bright architectural ink. The paper route is excluded from that mask so lines do not appear to run over the physical paper strip. The rolled plan and set square remain steady, giving the moving objects a stable context.

The shared map owns the only animation loop. Reduced-motion preference renders a still pose. Hiding the map, leaving the dashboard or logging out stops animation. Image compositing and ink extraction happen once, outside the frame loop.

## Issues encountered and solutions

1. **Existing page had no map.** Added only rhetorical-writing to the shared map eligibility and lazy-loaded its own theme. Existing Speaking, Written and Rhetorical Speaking themes retain their previous branches.
2. **Illustration sample text did not match the real library.** Loaded all 29 actual lessons and retained full lesson titles in cards; used concise display-only captions on the route.
3. **Long caption touched a following platform.** Reduced the oversized platform artwork, adjusted caption/status placement and repeated the collision check. Final result: no caption/platform or caption/caption overlaps.
4. **A moving lamp could separate from its arm or beam.** Used a fixed mechanical pivot and painted the wall plate separately. Shade and beams share the same local transform.
5. **Drawing traces could cross the paper road.** Cut the route corridor out of the cached architectural-ink mask.
6. **A staggered trace could switch circuits mid-fade.** Circuit selection now uses the same phase-shifted clock as its fade window, so switches occur at zero opacity.
7. **A tall complete map could put later selected cards below a laptop screen.** Capped the normal viewport height, kept camera following and added the established full-map overview control.
8. **Full-scene masking increased Retina frame cost.** Restricted compositing to each short tracing front's bounds using a reusable 192×192-world-pixel patch. Median frame interval improved from approximately 33 ms to 16.7 ms; final 95th percentile was 17.3 ms in the local Chromium check.
9. **A decorative asset failure could interrupt the new map.** Artwork finishes loading before map construction. The existing lesson list stays available on failure, and Retry map successfully restores the scene without duplicate nodes.
10. **Zero-length initial route projections could trigger immediate arrival.** Removed near-zero first waypoints; route tests cover all 841 ordered lesson pairs.

## Verification

- `node tools/test-common-expression-blueprint.mjs`: 29 unchanged lessons, 841 route pairs, route bounds, rejected off-road travel, fixed lamp radius, vertical travel, full cycle and restrained trace timing.
- `node --test tools/test-common-expression-system.mjs tools/test-common-expression-map.mjs`: all 24 shared catalogue, lesson, interface, grading, persistence, owner-preference and camera contracts passed.
- Existing Garden and Coast theme tests: all 9 passed.
- Browser: actual lesson 29 opens; real progress displays 7/30; list/map toggle; saved-location restoration; account separation; no page errors; no caption overlaps.
- Browser pixels change in all five checked regions: lamp, beams, architectural traces, compass and pencil. Normal elapsed-time motion, reduced-motion freeze and hidden-view pause were verified.
- Desktop, tablet and phone layouts were inspected, including Retina device scale 2, normal zoom and the full-map overview.
- Deliberately blocked tool-atlas load: all 29 original lesson cards stayed available; retry loaded the complete map.
- Final Retina timing: 152 frames observed over approximately 2.5 seconds, median 16.7 ms and 95th percentile 17.3 ms. This is a local browser measurement, not a physical-phone benchmark.

The browser fixture substitutes a local preview account and blocks external services. It does not claim real student authentication, production account writes or physical-device Safari testing. The original authentication and learning operations remain unchanged.

## Evidence and provenance

Durable local package: `/Users/sammak/Documents/ChatGPT/Astra/outputs/rhetorical-blueprint-v1`.

- Built-in `image_gen` was used for both new illustrations. Complete prompts are in `artwork-prompts.json`.
- Final original artwork: `source-art/blueprint.png` and `source-art/tools.png`.
- Dimension/encoding record: `asset-metadata.json`.
- Browser fixture and screenshots: `qa/capture.cjs`, normal/Retina pose captures and `qa/dpr2/browser-report.json`.
- Release hashes and canonical deployment verification are added to the local package after deployment.

The blueprint regression test is included in the site's GitHub Pages validation workflow.
