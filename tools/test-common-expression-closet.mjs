import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { execFileSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const assetIsAvailable = file => {
  if (fs.existsSync(path.join(root, file))) return true;
  try { execFileSync('git', ['cat-file', '-e', `HEAD:${file}`], { cwd: root, stdio: 'ignore' }); return true; }
  catch { return false; }
};
const map = read('common-expression-map.mjs');
const closet = read('common-expression-closet-3d.mjs');
const phoebe = read('phoebe-closet-3d.mjs');
const css = read('common-expression-map.css');

test('Closet control is inserted before Eddie and opens an accessible dialog', () => {
  assert.match(map, /querySelector\('\.expression-map-characters legend'\)\.after\(closetButton\)/);
  assert.match(map, /closetButton\.dataset\.openCloset/);
  assert.match(map, /aria-haspopup','dialog/);
  assert.match(map, /openCompanionCloset\(\{ character \}\)/);
  assert.match(closet, /document\.createElement\('dialog'\)/);
  assert.match(closet, /dialog\.showModal\(\)/);
  assert.match(closet, /data-close-closet/);
});

test('3D closet retains the classroom performance and lifecycle safeguards', () => {
  assert.match(closet, /three\.module\.js/);
  assert.match(closet, /new MascotCharacters\(undefined,undefined,\{preview:true\}\)/);
  assert.match(closet, /Math\.min\(devicePixelRatio, 1\.25\)/);
  assert.match(closet, /shadowMap\.autoUpdate = false/);
  assert.match(closet, /new ResizeObserver/);
  assert.match(closet, /prefers-reduced-motion/);
  assert.match(closet, /cancelAnimationFrame\(frame\)/);
  assert.match(closet, /renderer\.forceContextLoss\(\)/);
  assert.match(closet, /\['KeyW', 'KeyA', 'KeyS', 'KeyD'\]/);
  assert.match(closet, /const walkable = \(x, z\)/);
  assert.match(closet, /actorFacingYaw = Math\.atan2/);
  assert.match(closet, /actor\.mesh\.rotation\.y = cameraAzimuth/);
});

test('reference-inspired wardrobe is real procedural geometry, not a flat screenshot', () => {
  assert.match(closet, /Wardrobe bay/);
  assert.match(closet, /ExtrudeGeometry\(garmentShape/);
  assert.match(closet, /MeshStandardMaterial/);
  assert.match(closet, /bumpMap: surfaces\.weave/);
  assert.match(closet, /WebGLCubeRenderTarget/);
  assert.match(closet, /roundedPanel/);
  assert.match(closet, /Herringbone floor/);
  assert.match(closet, /Tall mirror/);
  assert.match(closet, /Closet island/);
  assert.match(closet, /Sculptural ceiling light/);
  assert.match(closet, /cream-cable-knit-v1\.png/);
  assert.match(closet, /charcoal-cashmere-v1\.png/);
  assert.match(closet, /white-cotton-tee-v1\.png/);
  assert.match(closet, /pale-blue-oxford-v1\.png/);
  assert.match(closet, /navy-suit-v1\.png/);
  assert.match(closet, /sand-linen-v1\.png/);
  assert.match(closet, /burgundy-silk-v1\.png/);
  assert.match(closet, /indigo-denim-v1\.png/);
  assert.match(closet, /brown-check-v1\.png/);
  assert.match(closet, /One unified grand double door/);
  assert.match(closet, /Grand door inset panel/);
  assert.doesNotMatch(closet, /Open paneled door/);
  assert.match(closet, /Front wardrobe/);
  assert.match(closet, /Front wall left/);
  assert.match(closet, /roughness: 1, metalness: 0/);
  assert.match(closet, /Tufted ottoman/);
  assert.match(closet, /surfaces\.plasterBump/);
  assert.match(closet, /Complete folded garment/);
  assert.match(closet, /generatedGarments/);
  assert.match(closet, /folded-ivory-ribbed-v1\.png/);
  assert.match(closet, /Textured mineral-plaster feature wall/);
  assert.match(closet, /charcoal-bronze-plaster-v1\.jpg/);
  assert.match(closet, /brass lid inlay/);
  assert.match(closet, /brass lock plate/);
  assert.match(closet, /tassel cord/);
  assert.match(closet, /Large dark grey island rug/);
  assert.match(closet, /rug-charcoal-low-pile-v1\.png/);
  assert.match(closet, /Small burgundy doorway rug/);
  assert.match(closet, /rug-burgundy-door-v1\.png/);
  assert.doesNotMatch(closet, /Plant leaf|Island plant pot/);
  assert.match(closet, /FogExp2/);
  assert.doesNotMatch(closet, /ts4_x64|2025-05-27/);
});

test('Elsie has a separate bright neoclassical closet derived from her reference', () => {
  assert.match(map, /character === 'eddy' \|\| character === 'noir' \|\| character === 'elsie' \|\| character === 'phoebe' \|\| character === 'celeste'/);
  assert.match(closet, /character === 'elsie'/);
  assert.match(closet, /buildElsieCloset/);
  assert.match(closet, /Elsie blush neoclassical closet/);
  assert.match(closet, /Elsie warm oak floor/);
  assert.match(closet, /Elsie ivory herringbone wool rug/);
  assert.match(closet, /Elsie central marble top/);
  assert.match(closet, /Elsie vanity mirror/);
  assert.match(closet, /Elsie vanity bulb/);
  assert.match(closet, /Elsie distant lakeside panorama with natural parallax/);
  assert.match(closet, /Elsie clear arched window glass/);
  assert.match(closet, /Elsie chandelier crystal drop/);
  assert.match(closet, /Elsie dimensional hanging gown/);
  assert.match(closet, /Elsie generated shelf accessory/);
  assert.match(closet, /Elsie blush ottoman cushion/);
  assert.match(closet, /Elsie unified grand double door/);
  assert.match(closet, /blush-calacatta-marble-v2\.png/);
  assert.match(closet, /ivory-herringbone-rug-v1\.png/);
  assert.match(closet, /accessories-atlas-v1\.png/);
  assert.match(closet, /vanity-accessories-atlas-v2\.png/);
  assert.match(closet, /off-white-linen-v1\.png/);
  assert.match(closet, /lakeside-window-view-v1\.png/);
  assert.match(closet, /warm-limewash-wall-v1\.png/);
  assert.match(closet, /detailed-dresses-atlas-v1\.png/);
  assert.match(closet, /olive-wool-herringbone-v1\.png/);
  assert.match(closet, /Elsie textured wall opposite window/);
  assert.match(closet, /Elsie textured window wall/);
  assert.match(closet, /Elsie generated detailed hanging garment/);
  assert.match(closet, /Elsie sheer blush curtain/);
  assert.match(closet, /Elsie off-white linen window sofa/);
  assert.match(closet, /Elsie sofa linen cushion leaning into back/);
  assert.match(closet, /Elsie round golden candle tray/);
  assert.match(closet, /Elsie cylindrical candle/);
  assert.match(closet, /Elsie scattered rose petal/);
  assert.match(closet, /Elsie doorway wardrobe back/);
  assert.match(closet, /Elsie doorway lipstick perfume or elegant hat/);
  assert.match(closet, /Elsie olive wool doorway rug/);
  assert.match(closet, /Elsie live planar mirror material/);
  assert.match(closet, /texture2DProj/);
  assert.match(closet, /updatePlanarMirror/);
  assert.match(closet, /reflectionOccluders/);
  assert.doesNotMatch(closet, /textureMatrix \* modelMatrix/);
  assert.match(closet, /map\.repeat\.set\(1 \/ 4, 1 \/ 4\)/);
  assert.match(closet, /\(side < 0 \? 0 : 8\) \+ \(column < 0 \? 0 : 4\) \+ item/);
  assert.doesNotMatch(closet, /Elsie flower stem|Elsie flower vase|Elsie blush rose|Elsie side wardrobe drawer/);
  assert.match(closet, /The Rose Atelier/);
  for (const asset of [
    'assets/closet/elsie/blush-calacatta-marble-v2.png',
    'assets/closet/elsie/ivory-herringbone-rug-v1.png',
    'assets/closet/elsie/accessories-atlas-v1.png',
    'assets/closet/elsie/vanity-accessories-atlas-v2.png',
    'assets/closet/elsie/off-white-linen-v1.png',
    'assets/closet/elsie/lakeside-window-view-v1.png',
    'assets/closet/elsie/warm-limewash-wall-v1.png',
    'assets/closet/elsie/detailed-dresses-atlas-v1.png',
    'assets/closet/elsie/olive-wool-herringbone-v1.png'
  ]) assert.equal(assetIsAvailable(asset), true, asset);
});

test('Phoebe has a separate mature blue and lavender marble closet with realistic garments', () => {
  assert.match(closet, /buildPhoebeCloset/);
  assert.match(closet, /PHOEBE_CLOSET_PROFILE/);
  assert.match(closet, /The Blue Atelier/);
  assert.match(closet, /Phoebe live planar vanity mirror material/);
  assert.match(closet, /character === 'phoebe'/);
  assert.match(closet, /Beige Leather Sofa/);
  assert.match(phoebe, /Phoebe dreamy blue and lavender mature closet/);
  assert.match(phoebe, /Phoebe high-gloss milky marble floor/);
  assert.match(phoebe, /Phoebe dreamy blue back wardrobe bay/);
  assert.match(phoebe, /Phoebe realistic hanging garment cutout/);
  assert.match(phoebe, /Phoebe grand vanity mirror frame/);
  assert.match(phoebe, /Phoebe long beige leather sofa seat cushion/);
  assert.match(phoebe, /Phoebe imagegen ivory double-border woven area rug/);
  assert.match(phoebe, /Phoebe ornate ivory double-door leaf surface/);
  assert.match(phoebe, /Phoebe thin domed window arch/);
  assert.match(phoebe, /Phoebe ocean view with boats and rocky coast/);
  assert.match(phoebe, /Phoebe aligned vanity drawer front/);
  assert.match(phoebe, /obstacles: \[/);
  assert.doesNotMatch(phoebe, /garmentShape|garmentColors|light grey wooden plank floor/i);
  for (const asset of [
    'milky-polished-marble-v1.png', 'ivory-double-border-rug-v1.png',
    'smoky-blue-plaster-v1.png', 'rocky-ocean-panorama-v1.png',
    'ornate-ivory-double-door-v1.png', 'garments-classic-atlas-v1.png',
    'garments-casual-atlas-v1.png', 'garments-evening-atlas-v1.png',
    'white-pebbled-leather-chair-v2.png', 'lavender-wool-door-rug-v2.png',
    'elsie-matte-limewash-ceiling-v1.png', 'beige-sofa-leather-v1.png'
  ]) assert.equal(assetIsAvailable(`assets/closet/phoebe/${asset}`), true, asset);
});

test('closet UI is responsive and cache-busted on every shared-map consumer', () => {
  assert.match(css, /\.expression-map-closet-button/);
  assert.match(css, /\.expression-closet::backdrop/);
  assert.match(css, /\.expression-closet-workspace/);
  assert.match(css, /\.expression-closet-inventory table/);
  assert.match(closet, /mountClosetInventory/);
  assert.doesNotMatch(closet, /fedoraEquipped|outfitMesh|hatMesh|hatMaterial|hatGeometry/);
  assert.match(css, /@media \(max-width:650px\)[\s\S]*?\.expression-closet/);
  const consumers = [
    'idiom-system.html',
    'common-expression-rhetorical-writing.html',
    'sentence-structure.html',
    'common-expression-speaking.html',
    'common-expression-system.js',
    'phrasal-verb-system.html',
    'common-expression-rhetorical-speaking.html',
    'common-expression-business-speaking.html',
    'common-expression-professional-message.html',
    'phrasal-verb-system.js',
    'sentence-structure.js',
    'sentence-structure-realms.mjs',
    'idiom-paper-map.mjs',
    'listening-system.html',
    'common-expression-written.html'
  ];
  for (const file of consumers) assert.match(read(file), /common-expression-map\.(?:css\?v=20260915-noirceleste1|mjs\?v=20260916-girls-individual1)/, file);
  assert.match(read('ielts-puzzle-map.mjs'), /common-expression-map\.mjs\?v=20260916-girls-individual1/);
  for (const file of [
    'common-expression-rhetorical-speaking.html', 'common-expression-rhetorical-writing.html',
    'common-expression-speaking.html', 'common-expression-written.html',
    'common-expression-business-speaking.html', 'common-expression-professional-message.html',
    'phrasal-verb-system.html', 'sentence-structure.html'
  ]) assert.match(read(file), /\.js\?v=20260916-girls-individual1/, file);
  assert.match(read('idiom-system.html'), /idiom-system\.js\?v=20260915-phoebe2/);
  assert.match(read('listening-system.html'), /listening-system\.js\?v=20260917-translation-toggle1/);
});
