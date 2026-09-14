import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const map = read('common-expression-map.mjs');
const closet = read('common-expression-closet-3d.mjs');
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
  assert.match(closet, /new MascotCharacters\(\)/);
  assert.match(closet, /Math\.min\(devicePixelRatio, 1\.6\)/);
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
  assert.match(closet, /MeshPhysicalMaterial/);
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

test('closet UI is responsive and cache-busted on every shared-map consumer', () => {
  assert.match(css, /\.expression-map-closet-button/);
  assert.match(css, /\.expression-closet::backdrop/);
  assert.match(css, /\.expression-closet-workspace/);
  assert.match(css, /\.expression-closet-inventory table/);
  assert.match(closet, /Fitting on hold/);
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
    'phrasal-verb-system.js',
    'sentence-structure.js',
    'sentence-structure-realms.mjs',
    'idiom-paper-map.mjs',
    'listening-system.html',
    'common-expression-written.html'
  ];
  for (const file of consumers) assert.match(read(file), /common-expression-map\.(?:mjs|css)\?v=20260914-closet9/, file);
});
