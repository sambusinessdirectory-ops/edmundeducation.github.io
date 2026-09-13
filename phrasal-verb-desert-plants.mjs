// Painterly sprite crops share the original ground anchors and planting envelopes.
// The PNG master has real alpha; the WebP export preserves it losslessly.
const ART='./assets/phrasal-verb/desert/painted-plants.webp';
const PLANTS={
  palm:{crop:[48,9,430,508],box:[1,2,237,290]},
  shortPalm:{crop:[550,84,440,433],box:[1,2,237,290]},
  cactus:{crop:[1135,39,322,478],box:[28,24,184,269]},
  reeds:{crop:[23,551,493,431],box:[12,98,222,195]},
  shrub:{crop:[559,593,443,389],box:[15,137,213,156]}
};
export function desertPlantArtwork(kind){
  const {crop,box}=PLANTS[kind]||PLANTS.shrub;
  return `<svg class="desert-sprite desert-painted-plant" viewBox="0 0 240 300" aria-hidden="true"><ellipse cx="${kind==='palm'||kind==='shortPalm'?95:120}" cy="292" rx="${kind==='cactus'?30:34}" ry="5.5" fill="#805d30" opacity=".14"/><svg x="${box[0]}" y="${box[1]}" width="${box[2]}" height="${box[3]}" viewBox="${crop.join(' ')}" preserveAspectRatio="xMidYMax meet" overflow="hidden"><image href="${ART}" width="1536" height="1024"/></svg></svg>`;
}
