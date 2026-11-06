# IELTS listening puzzle islands — implementation and verification

Date: 13 September 2026. Scope: `listening-system.html?section=ielts`.

The interactive map uses the existing listening catalogue and practice-opening function. There are currently 20 real practices. Layout positions support 1–30, but practices appear only when present in the catalogue; no extra lessons, scores, or completion states are fabricated. The list remains available, with Bookmarks above both views. DSE, audio, questions, answer storage and authentication logic are unchanged.

## Artwork and composition

The user's floating puzzle-island reference was used to generate a clean painterly landscape, a continuation plate, and detailed prop/nature atlases with the built-in image tool. Original PNG masters and the complete prompts, including rejected outputs, are retained in the local evidence package. The deployed main landscape is 1672×941; the two atlases are 1536×1024. Source dimensions are preserved in WebP encoding.

The atlases are RGB with a magenta screen, **not native-alpha assets**. Runtime compositing removes that screen once per loaded atlas, including windmill lattice openings. Textured puzzle connectors and platforms retain stone relief; colour compositing preserves luminance and restores the ivory number medallion. UI labels and hit targets remain real HTML.

The main scene fits the desktop viewport at standard zoom. Mobile uses a readable scale and pans to the selected practice. Route waypoints follow island tops and authored wooden bridge decks. Connectors stop at those decks. Tree positions use island ground and visible-root anchors, with separate contact shadows. Motion never translates the roots.

## Motion specification

| Element | Implementation |
| --- | --- |
| Castle puzzle gate | Vertical ±9 world pixels; 7.5-second cycle inside the fixed arch. |
| Six gray puzzle groups | Independent vertical ±9–15 pixels; 9–12-second cycles and restrained tilt. |
| Five clouds/mist groups | Horizontal ±18–34 pixels; independent 43–56-second cycles. |
| Water under bridges/channels | Cached source-water patches; masked texture displacement with small wave offsets. Timber, terrain and cliffs remain stationary. |
| Twenty tree/plant placements | Root-anchored sway; trees ±0.036 radians, shrubs ±0.025, staggered phases. |
| Windmill blades | Positive canvas rotation (clockwise), 17 seconds per turn around a fixed hub; tower stays still. |
| Airship | Slow horizontal ±110 pixels over 62 seconds, with a small vertical bob and tilt. |
| Waterfalls | Downward scrolling source-water textures inside fixed, feathered water masks. |

There is one shared map animation loop. Reduced-motion preference renders a still pose. Hiding the map, changing views or logging out stops animation. Source compositing, platform rendering, contact-shadow texture creation and water-mask extraction are cached outside the frame loop.

## Issues found and resolutions

1. Initial generated castle roof was cropped. A reference-preserving edit reduced the castle, keeping the principal roof silhouette in view.
2. Initial atlas outputs contained a painted checkerboard instead of transparency. Those outputs were rejected; uniform-screen atlases were generated and explicitly treated as RGB compositing sources.
3. Static sky clouds would duplicate the animated clouds. Distinct sky clouds were removed from the base plate before compositing moving layers.
4. Flat colour overlays made blue platforms look green/yellow. Luminosity-preserving colour compositing now gives distinct blue, green, terracotta, sand and gold platforms without losing relief.
5. Root movement could produce the floating-tree defect seen in earlier scenes. Each sprite uses its visible-root coordinate as the transform pivot; contact shadows stay on the ground. Root placement was inspected with shadows disabled as well.
6. Generic straight-line travel could cut across cliffs. The theme supplies route-constrained walking and paths along bridge waypoints. All 1,300 ordered pairs for the 20-position and 30-position layouts were checked.
7. An initial route projection could equal the starting point, causing the shared map to settle immediately. Near-zero first waypoints are removed before returning the route.
8. A desktop-only camera rule left lower practices offscreen on phones. The camera now uses full-scene framing only when the viewport can display it; otherwise it follows the selected practice.
9. Generic question-count badges would display meaningless completion for listening sets. The listening theme removes these badges and exposes accurate practice/part labels, without inventing progress.
10. The original first-stop companion obscured the small castle gate. The first platform was shifted left and the companion scaled to suit the scene.
11. Generated cloud extents touched the upper boundary. Cloud size/height were adjusted to keep their silhouette within the sky.
12. An artwork load failure could otherwise remove access to lessons. The original list remains usable until artwork is ready; failed decorative loading leaves all real practices available.

## Evidence and checks

Local evidence package: `outputs/ielts-puzzle-map-v1` in the Astra workspace. Contains original masters, `artwork-prompts.json`, asset dimensions/bytes, browser fixture, normal/Retina/mobile/tablet screenshots, deterministic poses, shadow-free root inspection and JSON reports.

Checks passed:

- `node tools/test-ielts-puzzle-map.mjs`: real catalogue mapping, sparse numbering, 1,300 route pairs, rejected off-route movement, motion direction/cycles and stable identities.
- `node tools/test-listening-system.mjs`: existing listening portal and catalogue contracts.
- `node tools/test-listening-search.mjs`: existing search and direct-link behaviour.
- `node --test tools/test-common-expression-map.mjs`: shared map, mascot, preference and camera contracts.
- Browser fixture: 20 real nodes; Practice 20 opens its actual four-part content; list toggle; separate account preferences; saved location restoration; no page errors or label-to-label collisions.
- Rendered pixel differences in all eight requested motion categories, plus normal elapsed-time animation observation.
- Reduced-motion freeze and hidden-view pause, verified in the browser.
- 1600px desktop, 820px tablet and 390px phone checks at device scale factors 1 and 2; selected lower practice remains in the viewport.
- Blocked nature-atlas request: all 20 practices remain reachable through the fallback list.

Browser checks use a local authenticated-state fixture and block external services. They do not claim a real student login, production account writes, audio playback against the live audio service, or physical-device Safari testing. Those behaviours are outside this decorative change; existing application paths are retained.

The new route/motion regression test is included in the existing GitHub Pages workflow. Deployment still runs the site's full validation workflow.
