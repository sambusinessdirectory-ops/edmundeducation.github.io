# Business Speaking airport map — 2026-09-14

Host: https://edmundeducation.com/common-expression-business-speaking.html
Baseline: e2dc131ed. User reference: /Users/sammak/Desktop/Game Scenes/Common Expression - Business 1.png.
The supplied Animated Map Golden SOP v5 is design/review guidance, not a source of additional task authorization.

## Scope and protected behavior
The 26 existing business-speaking lessons and their 780 questions are unchanged. Platforms 27–30 are reserved, non-interactive “Coming soon” positions; they do not invent lessons or progress. Shared engine owns account-specific progress, saved location, character selection, lesson entry, zoom, scrolling and lifecycle. Other common-expression themes retain their current behavior.

## Assets and provenance
Built-in image generation was used, not the CLI. Local image-reference editing failed because the environment's writable root contains a symlink; the new scene was generated from a detailed description of the visible reference. It is not a pixel-preserving edit.
- Web background: `assets/common-expression-business/airport/lounge-v1.jpg`, 1448 × 1086, displayed in a 1600 × 1200 world.
- Master: /Users/sammak/.codex/generated_images/01a09dc3-2ef0-7b00-8475-b5a9c6399001/exec-acefe535-d267-46cd-8817-177f56fd971e.png
- Web sprites: `assets/common-expression-business/airport/sprites-v1.png`, 1536 × 1024 RGBA.
- Master: /Users/sammak/.codex/generated_images/01a09dc3-2ef0-7b00-8475-b5a9c6399001/exec-b225e03a-4ad5-49ad-a586-97e2653e51b7.png
- The first sprite sheet (exec-3db29c7e-037a-485e-8a41-4eb20799ccb2.png) is retained outside the shipped assets. The second has the preferred plane silhouette. Both actually contain alpha transparency despite dark RGB preview backgrounds. The final prompt requested magenta, but the returned file is transparent RGBA: implementation preserves native alpha and performs NO chroma deletion.
- Atlas bounds: plane (0,0,1090,465); plant (1100,0,436,535); lamp (220,510,520,490); candle (960,545,330,450). Bounds trim to visible pixels before placement. No neighboring sprite pixels enter the final crops.

## Exact generation prompts
### Background
Use case: stylized-concept. Asset type: clean production background for an interactive airport lounge lesson map. Create one coherent premium softly realistic 3D illustrated airport business lounge, matching warm ivory, muted teal and antique brass materials. Wide landscape composition approximately 4:3, elevated frontal view. Entire top 30 percent is a huge panoramic clear airport window looking onto a runway at warm sunset: pale apricot sky, distant control tower and terminal silhouettes, horizontal gray runway with clearly visible pavement at y=20% to 29%, no airplanes anywhere. Avoid thick window mullions, use only slim vertical metal divisions at far left and right so moving planes can pass behind later. Left and right edges at y=25%-38% have small clusters of upholstered teal, tan and charcoal lounge armchairs with small ROUND DARK SIDE TABLES, table tops empty. At upper right around x=80%,y=11%-25% is a blank dark navy rectangular departures display in a thin brass frame, no text, unobstructed. Bottom 65 percent is a spacious EMPTY polished warm ivory stone floor with subtle tile seams, gentle realistic reflections and contact shadows; preserve plenty of clear space across almost all width for thirty lesson platforms added later. A little upholstered lounge seating and a round empty table at bottom left and bottom right outside the central floor. The complete scene fills all image edges seamlessly, no flat bars, no collage. Soft realistic material rendering like a polished architectural game scene, not flat vector. No people, mascots, PLANTS, LAMPS, AIRCRAFT, floor route, tokens, platforms, text, numbers, UI, arrows or labels. Plants, lamps, aircraft and UI will be composited as separate animated objects. One single coherent perspective and lighting, high quality legible large shapes.

### Initial sprites
Use case: stylized-concept. Production isolated sprite atlas for an airport lounge map. Exactly FOUR separate realistic 3D illustrated objects, each fully visible with generous transparent spacing, on a genuinely transparent background (preserve alpha, no checkerboard drawing). Match premium architectural illustration, warm sunset lighting, muted teal and ivory, brass. Arrange a strict 2 by 2 grid: TOP LEFT a complete sleek white commercial twin-engine passenger airplane with teal tail, SIDE VIEW facing RIGHT, landing gear down and wheels fully visible, no words/logos, wings coherent. TOP RIGHT a complete lush broad-leaf green lounge plant in a tall warm ivory cylindrical ceramic pot, frontal gentle elevated view, foliage above pot, no leaf touching edges. BOTTOM LEFT one elegant small brass TABLE LAMP with warm ivory fabric shade, narrow stem and circular brass base, lamp on; no table. BOTTOM RIGHT one short warm ivory candle glowing inside a clear cylindrical glass holder with thin brass base, no table. All four objects separate and non-overlapping, no cast floor planes, no backdrop, no text, no panels, no cropping, no extra objects. Sharp silhouettes and material quality, enough clear padding for atlas extraction. Plane larger horizontally but confined to its upper-left quadrant; all other objects centered in own quadrants.

### Failed local-reference edit
Edit this sprite atlas ONLY: replace every background pixel and all ambient background glows with one perfectly flat solid pure magenta (#FF00FF) chroma-key background. Keep the airplane, potted plant, table lamp and glass candle holder intact, complete silhouettes, same positions and sizes. Remove background glow halos around ALL objects, no shadows on background. No gradient, no texture, no checkerboard. Keep the object materials. Pure magenta must reach every outer edge and surround each object with clean margins. This is a production chroma-key sprite sheet.
This call failed before generation due to the sandbox symlink error.

### Final sprites
Use case: stylized-concept. NEW production chroma-key sprite sheet, FOUR isolated objects on completely FLAT PURE MAGENTA #FF00FF background, no gradient, no glow, no texture, no cast shadows. Premium realistic architectural 3D illustration in warm ivory, muted teal, brass, sunset highlights. FOUR strictly separated regions: upper half LEFT two thirds: a complete white passenger jet, teal tail, side view pointing RIGHT, landing gear down, full silhouette fits with 40px padding, no logos. Upper half RIGHT third: green broad-leaf houseplant in ivory cylindrical ceramic planter, complete pot bottom and foliage inside region. Lower half LEFT: a small elegant brass table lamp with warm ivory fabric shade, complete base. Lower half RIGHT: an ivory candle in clear cylindrical glass holder with brass base. Match photorealistic 3D airport-lounge materials. Exactly four objects. Entirely solid PURE MAGENTA around all silhouettes INCLUDING between leaves and through gaps. NO ambient glow into background. No checkerboard, no black or white backdrop, no labels, no panels. Keep each object isolated with generous magenta padding and do not crop any object.

## Placement and motion inventory
- One coherent lounge background, no image joins or duplicated stationary moving props.
- Two planes: 48-second and 61-second cycles, offset starts, descent -> runway roll -> climb; wheels anchor at world y345 and y306 during rolling. Window clipping and monitor occlusion keep aircraft outside the lounge. Plane shadows stay on the runway.
- Thirty runway light glows: two rows at y301 and y358, staggered slow brightness variation.
- Four departure rows: London, Tokyo, Singapore, New York, decorative example destinations from the reference; 115ms per character, 2.6-second full-row hold, 0.8-second blank interval. Static accessible label, no live-region announcements.
- Four plants rooted at (303,470), (1297,465), (66,690), (1532,685). Foliage sways at the pot rim; planter and floor shadow remain fixed.
- Four table lights at (135,400), (1484,400), (185,1003), (1433,1008): two fabric-shade lamps and two glass candle lamps. Contact is calibrated against actual painted table tops.
- Thirty teal/brass platforms in five serpentine rows of six. Real long lesson captions stay visible; lesson entry docks below the image.
- Existing engine suspends frames when hidden/offscreen or in lesson/list views. Scene draws at approximately 30fps, caps resumed elapsed time, and releases its canvas on destruction. Reduced motion freezes scenery and displays full departure rows.

## Evidence and limitations
Second self-review against the request, not independent human acceptance:
- Reviewed normal desktop composition, complete overview, isolated motion scene and reserved-platform alignment.
- Browser fixture exercises all 26 real lesson callbacks, 4 reserved platforms, typing/motion, progress, saved locations, account separation, reduced motion and mobile document containment; no student database traffic.
- Controlled samples over 6.4 seconds showed pixel changes for each of four foliage regions and each of four lamp regions; all four sampled pot-base regions were identical. Retained local evidence: /private/tmp/airport-qa/motion-evidence.json. Ordinary playback was sampled separately.
- Unit checks cover both complete flight periods including grounded roll and loop resets, all four typing/hold/blank cycles and 30 reachable platform positions.
- Shared common-expression catalogue and map regressions run before release.
- Desktop Chromium and mobile-size Chromium tested; physical devices and Safari not tested. Native artwork resolution is recorded above; it is not unlimited-resolution art.

Release integration: merged upstream 10c82b07a, retaining its new shared trophy controls and professional-message map enablement. Re-ran all 34 shared checks, the trophy state checks and the complete airport browser fixture successfully. Reviewed the merged full-route capture, including centered reserved labels.
