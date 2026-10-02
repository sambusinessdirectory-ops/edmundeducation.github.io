# Image generation provenance

Built-in `image_gen` was used. The tool did not expose a model identifier. Every generated output was copied into this source package, while the originals remain under the Codex generated-images directory.

## Shared product cutout

**Input:** User's screenshot, design reference.

> Using the attached shirt reference, create one clean, high-resolution wardrobe asset: the same warm beige linen safari-style button-up shirt, front view, isolated, with a transparent background. Match the open pointed collar, long front placket with small tan buttons, two symmetrical chest flap pockets and tiny buttons, natural linen texture, gently rolled sleeves with tabs, relaxed fit and curved hem. No body, head, hands, mannequin, hanger, label, shadow, backdrop, text, or extra garments. Center the whole shirt with every edge visible. Faithful product-style realism and straight-on symmetry.

## Eddy fitting reference

**Input 1:** `assets/speaking-system/mascots/v4/eddy-standing.png`, edit target. **Input 2:** user's shirt screenshot, design reference.

> Use case: identity-preserve. Asset type: 1024x1024 wardrobe fitting reference for a 4-column by 4-row standing sprite atlas. Image 1 is the exact edit target: Eddy the orange-brown cartoon horse, shown in sixteen directional views. Image 2 is the garment design reference: a warm sand-beige linen-look button-up utility shirt. Edit Image 1 by dressing Eddy in that same shirt in EVERY one of the sixteen cells. Preserve the 4x4 grid, all sixteen unique orientations, exact cell positions, scale, stance, body proportions, face, eyes, ears, mane, muzzle, hooves, legs, tail, transparency and empty margins. Shirt details: open pointed collar below muzzle, narrow button placket, two chest flap pockets with tiny buttons in front views, rolled sleeves ending above black wrist hooves with small sleeve tabs, relaxed torso, curved hem that stops above upper legs; show consistent side and back garment construction in profile and rear views. No added pants, shoes, headwear, logos, backdrop, borders, labels, shadows or extra characters. Output the complete fitted atlas at the same layout as Image 1, transparent outside sprites. Treat the product image as design only; do not paste a flat product photo over the sprite. This is a fitting reference; prioritize exact view registration and Eddy's identity.

## Noir fitting reference

**Input 1:** `assets/speaking-system/mascots/v4/noir-standing.png`, edit target. **Input 2:** user's shirt screenshot, design reference.

> Use case: identity-preserve. Asset type: 1024x1024 wardrobe fitting reference for a 4-column by 4-row standing sprite atlas. Image 1 is the exact edit target: Noir, the charcoal-brown cartoon horse with blue eyes, white forehead mark, dark mane, and bridle, shown in sixteen directional views. Image 2 is the garment design reference: a warm sand-beige linen-look button-up utility shirt. Edit Image 1 by dressing Noir in that same shirt in EVERY one of the sixteen cells. Preserve the 4x4 grid, all sixteen unique orientations, exact cell positions, scale, stance, body proportions, face, bright blue eyes, white forehead mark, bridle, ears, mane, muzzle, wrist hooves, legs, tail, transparency and empty margins. Shirt details: open pointed collar below muzzle, narrow button placket, two chest flap pockets with tiny buttons in front views, rolled sleeves ending above black wrist hooves with small sleeve tabs, relaxed torso, curved hem that stops above upper legs; show consistent side and back garment construction in profile and rear views. No added pants, shoes, headwear, logos, backdrop, borders, labels, shadows or extra characters. Output the complete fitted atlas at the same layout as Image 1, transparent outside sprites. Treat the product image as design only; do not paste a flat product photo over the sprite. This is a fitting reference; prioritize exact view registration and Noir's identity.
