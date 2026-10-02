# Levels 61–90 lesson interior artwork

`lesson-garden-v1.webp` is decorative background scenery for the four interactive pages of each Japanese-garden lesson. It was generated with the built-in image-generation tool on 3 October 2026, then encoded as a 1672 × 941 WebP (RGB, quality 86). The editable HTML carries every heading, explanation, example, question, answer input, control and progress state; the bitmap contains none of those.

Final prompt:

> Use case: stylized-concept. Asset type: responsive background artwork for an interactive English-learning lesson, Japanese-garden levels 61–90. Create a richly illustrated yet calm horizontal landscape scene in the same mood as a premium storybook game: view from a warm timber teahouse veranda into a Japanese garden with an arched red-brown wooden bridge, clear koi pond, stone lanterns, bamboo, maple leaves, shoji frames, a small sleeping calico cat on the right veranda, and a couple of stacked books. Soft afternoon amber light, deep garden greens, cream stone, restrained vermilion accents, painterly material detail and dimensional depth. Compose the center 70 percent and lower center as visually quiet, low-contrast space so editable HTML lesson panels and English/Chinese text can sit above it; place the scenic detail toward the edges and upper background. The illustration must work as a decorative CSS background at desktop and mobile crops. Absolutely no lettering, words, numerals, signs, UI panels, buttons, borders, labels, icons, watermark, or typography. This is background scenery only, not a screenshot of a finished webpage.

The source PNG remains in the local image-generation archive. Theme composition and responsive treatment are in `sentence-structure-zen-lesson.css`; level assignment is in `sentence-structure.js`. Do not flatten the lesson pages into this image or place source text inside the artwork.

## Content-area art, version 2

Following review of the live first version, the four teaching pages gained five reusable ImageGen assets. `garden-side-v2.webp` frames the left of the teaching board; `garden-footer-v2.webp` frames navigation and submission controls; `stone-marker-v1.webp` sits behind live numeric labels; `botanical-corner-v1.webp` adds quiet edge decoration; `brushstroke-v1.webp` sits behind live section labels. The two scenery images were repainted after feedback that the first drafts looked too micro-detailed, diffuse, unnatural and grainy. The published `v2` scenery uses broad matte shapes, clearer silhouettes, a single coherent afternoon light source, fewer koi and fewer small highlights. Earlier detailed drafts were not shipped.

The assets contain no lesson wording or exercise controls. CSS crops and reflows them for desktop and mobile. Generated source PNGs remain in the local image-generation archive; the checked-in WebP copies are deployment assets.
