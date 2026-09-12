# Toy realm artwork — built-in ImageGen prompts

The user's toy-room image is the visual reference. The final background contains no baked dog, marbles, planes or key. The animated marbles, paper planes, key and wooden platforms are code-native assets. The source dog is generated raster artwork with user-authorized neutral checkerboard removal for its alpha channel.

## Initial toy room

Use case: illustration-story.
Asset type: finished panoramic painted background for a toy-room learning-game realm. Input image 1 is the user's visual reference for art style and toys, NOT a user-interface template.
Create a warm, charming illustrated wooden toy room in soft late-afternoon window light, matching the reference's large smooth painterly forms and gentle wooden-toy materials. Remove all interface, writing, level numbers, buttons, cream paths, character mascot and progress panels.
CRITICAL COMPOSITION: wide 16:9 panorama with the complete main toy-room vignette confined to the CENTRAL HALF of the image, x=25% to 75%. The outer left and right quarters are quiet extensions with basic wooden floor, muted carpet and simple wall shapes only. Main focal objects must all fit into the upper 45% of this central half; leave the lower 55% spacious for a later winding game path.
Within that central half: a wooden toy box and seated teddy on the upper left, a striped ball and a few large colored wooden blocks; warm rear window, a small red/green/blue/yellow wooden train on a SHORT straight wooden track in the upper center; a few wooden toy trees and red/blue roof building blocks on the upper right. Keep every main object fully visible inside the central-half safe area. Include the low wooden arched bridge around the upper-middle/right, a small green toy chest a little farther down on the right, and very restrained red and blue ribbons near a carpet edge. Ground is warm broad wooden floorboards and a large faded blue/teal rug with simple yellow/cream patches, similar to reference. Only a few large foreground toy shapes at the lower far edges.
Animation preparation: NO dog, NO winding key, NO marbles, NO paper planes anywhere, because those will be animated separately. Leave an open carpet patch for the dog on the left of the central half below the toy box, and open floor spaces for the marbles/planes. NO game pathway, NO level platforms; we add these separately.
Style: polished children's storybook painting, clean broad shapes, lightly softened shading, sparse and spacious. Not photorealistic. Avoid micro-level artifacts, excessive wood grain, granular texture, tiny repetitive details, excessive clutter or elaborate scenery at edges. No text, labels, signs, watermarks or UI.

## Dog source

Use case: background-extraction / illustration-story.
Asset type: single transparent animated game-character source.
Input image 1 is the visual reference for a charming wind-up toy dog. Create ONLY the complete seated wind-up toy dog, isolated on a genuinely transparent alpha background, with generous transparent margin. No scene, no carpet, no platform, no text and no shadow baked into the background.
Match the reference: a friendly small cream-colored wooden/toy puppy with warm brown floppy ears, brown spots on the body, little black eyes with white highlights, a rounded black nose, smiling muzzle, red collar and round golden tag. Three-quarter view facing right and slightly toward the viewer, sitting calmly, all four feet and the entire tail/body visible. The big friendly head is upright, both eyes open. The neck and collar are clearly visible, allowing us to animate a gentle head tilt about the neck. Smooth large shapes, soft warm light from the upper left, painterly polished wooden/toy finish, not furry or granular, no mechanical seams through the face.
Important: OMIT the winding key and its shaft entirely; a rotating metal key will be added behind the left flank separately. Single continuous clean dog silhouette. No checkerboard drawn into the image, use actual transparency.

## Normal-width composition

Use case: precise-object-edit, panoramic outpainting and composition.
Edit the supplied toy-room painting by ZOOMING THE ENTIRE SCENE OUT TO HALF ITS CURRENT SIZE. Preserve all existing toys and their relationships, but place the entire current image into an imaginary central rectangle occupying x=25% to 75% of the new canvas and y=6% to 56%. Then seamlessly paint the surroundings, without any rectangular seam, frame or picture-within-picture effect.
The resulting canvas stays wide 16:9. This is a major camera pull-back: every toy must be about HALF its current pixel size. The teddy, striped ball and ENTIRE wooden toy box must be entirely to the RIGHT of the 25%-width boundary. The entire block houses and green toy chest must be to the LEFT of the 75%-width boundary. The complete cluster of interesting toys fits the CENTRAL HALF at ordinary zoom; left and right quarters must be much emptier than in the current image. Extend with quiet warm floorboards, a very simple wooden wall and blue/teal carpet, with no new toys or decorative details in the outer quarters.
Most of the bottom half is open carpet and floor for a later winding game path. Keep a few existing broad foreground toys near the central lower region, but nothing cut off at the image edges. Preserve the soft warm painterly toy-room style, reference colors and window lighting.
Do NOT add dogs, winding keys, marbles, paper planes, paths, platforms, text or interface. Do NOT merely move a few objects: pull back the entire composition so ALL focal toys fit in the central-half rectangle. Keep surfaces smooth and broad, reduce tiny grain, rug speckle and busy woodgrain.

## Left focal margin

Edit this painting precisely: move the entire upper-left toy cluster (the teddy, striped ball, wooden toy box, its colored blocks, and nearby small blocks/arch) about 55 pixels to the RIGHT, keeping their sizes unchanged. Every part of that cluster including the ball must be to the right of x=445 in this 1672-pixel-wide composition, so it fits inside the central-half game viewport. Preserve the window, train, bridge, right buildings, rug, lighting, camera and all other objects in their exact current places. Seamlessly restore the old floor area. Keep the quiet extended edges. No new toys, no dog, no marbles, no paper planes, no game UI or path.

## Floor space and headroom

Precise composition edit: remove the excessive empty wall/window headroom by shifting the ENTIRE existing painting content UP by about 100 pixels, without changing the horizontal positions or the size of any object. Keep the output at the same 1672 × 941 wide canvas. The top of the window can be cropped; the important toy cluster should move upward from its current y≈220–435 to y≈120–335. Seamlessly extend the newly exposed bottom 100 pixels with the same quiet carpet edge and wooden floor. Preserve all toys, rug colors, large shapes, lighting and empty side areas exactly. No new objects or details. Do not shrink or enlarge the toys. No dog, keys, marbles, planes, path, numbers, text or UI. This creates foreground room for a dog and rolling marbles on the FLOOR while keeping all toys visible at standard camera zoom.

## Final soft felt texture

Change ONLY the blue/teal/yellow rug's surface treatment in this image: remove all squiggly micro-grain, tiny curly patterns and granular generated texture. Make it a soft smooth felt playmat with large clean blue, teal and pale-yellow color fields, very gentle broad shading, and only barely visible natural fabric softness. Do not make the rug blank white; preserve its exact colored pattern and boundaries. Keep every toy, toy size, all object positions, window, composition, lighting, floorboards and canvas dimensions completely unchanged. No added items, text, dogs, marbles, paper planes or pathways.

## Final saved artwork

- Background master: `/Users/sammak/Documents/ChatGPT/Astra/outputs/sentence-toy-realm/background.png`.
- Dog alpha master: `/Users/sammak/Documents/ChatGPT/Astra/outputs/sentence-toy-realm/dog.png`.
- Runtime assets: `assets/sentence-structure/toy/background.webp`, `dog.webp`, and the code-rendered `effects-fallback.webp`.
- Built-in generated source for final background: `exec-25790051-93fe-49ac-bcf2-a8258a16c186.png`.
- Built-in generated source for dog: `exec-4b8ef43e-d2aa-4a63-a8ae-4725283c5f84.png`.
