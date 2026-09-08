# Enclosed DSE speaking classroom

The room is built by `speaking-classroom-environment.mjs`, with camera limits in `speaking-classroom-camera.mjs`. It measures 12 × 12.8 units and has a 4.2-unit ceiling. Four permanent walls and the ceiling surround the camera; the former wall cutaway is no longer used. Orbit, pan, zoom, free movement and mode changes all respect a clearance boundary inside the room. The starting view is indoors, looking toward the candidates and teaching wall.

The blackboard displays exactly two editable lines: **Edmund Sir** and **DSE English Speaking Studio**. Browser canvas text supplies accurate lettering independently of generated artwork. Existing school desks/chairs and all six approved character atlases are retained. The window wall has three real openings, frames, sills and small 3D plants. A city panorama is set outside, behind the frames. Wood material repeats across the floor with a restrained grain bump. Interior surfaces and lights are authored in Three.js; owned textures, materials and geometries are released on classroom disposal. Static room shadows are rendered once per mount to keep animated characters responsive.

Two new project assets were generated with the **built-in image_gen** tool and copied unchanged:

- `assets/speaking-system/classroom/interior-v1/oak-floor.png` — source `exec-127c3ec6-d806-4534-a1a9-590f696fe00a.png`.
- `assets/speaking-system/classroom/interior-v1/leafy-city.png` — source `exec-e2a4a158-71d2-443c-9edb-50082398eb2f.png`.

The complete prompts are recorded in [prompts.json](prompts.json). The exterior is illustrative scenery, not a claim to reproduce a particular real neighbourhood.

Nods now rotate the head rigidly about a neck pivot and around the character's own right axis. The shader compensates for the mascot surface's nonuniform scale before rotating, keeping physical head dimensions stable. The rotation is about 2.1–2.4 degrees, with a gentle downward ease, brief hold and slower return lasting 1.15 seconds. Most of the interval remains still. The old graded head translation, which visually compressed and expanded the head, is removed; breathing affects only a tiny amount of torso depth. Reduced motion stops nodding.

`tools/test-speaking-classroom-interior.mjs` checks thousands of camera positions through orbit, pan and zoom extremes, nod angle/speed/rest limits, exact blackboard draw calls, enclosure coverage, floor texture mapping and resource disposal. The existing mascot and professional exam checks remain in the Pages release pipeline. Browser QA covers full room orbit, constrained free camera, picking, 2/3/4 candidates, mobile, reduced motion and rest/peak nod comparisons.
