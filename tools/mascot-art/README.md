# DSE classroom mascot artwork

Eddy uses the user's 96 original RGBA idle frames directly. No pixels were regenerated, recoloured, or mirrored. Playback uses all 12 supplied frames at 6 fps, including the supplied blink drawing. A fixed crop keeps the original movement and foot alignment.

Elsie and Phoebe use eight-view RGBA atlases generated with the built-in image_gen tool, using Eddy's supplied frame for style/proportions and their original creative-brief reference plates for identity. Full initial and final edit prompts are in `prompts.json`. The selected outputs were copied unchanged to `assets/speaking-system/mascots/elsie-directions-v1.png` and `phoebe-directions-v1.png`. Source crop coordinates live in `speaking-mascot-art.mjs`; Elsie's east/west cells are mapped by the actual generated view, not prompt order. These two characters use gentle breathing and speaking sway rather than claiming a generated 12-frame animation.

These are directional illustrated billboards in a real 3D room, not reconstructed 3D horse meshes. Eight-direction selection is relative to both the camera and the inward-facing candidate seat. The plane remains upright and furniture occludes it through normal depth testing. Reduced motion freezes idle animation and sway. Each mounted classroom releases its sprite textures/materials/geometry on disposal.

The rejected Eddy/Elsie/Phoebe GLBs, old Blender source containing those characters, and old sculpt-review renders are removed from the published tree. The room and desk GLBs contain only furniture/environment and remain in use. Git history and the existing private local Blender backup retain prior source history. The old `elsie-model-review.html` URL now previews all three current characters and the actual classroom renderer.
