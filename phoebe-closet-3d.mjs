import * as THREE from './vendor/three/three.module.js';

export const PHOEBE_CLOSET_PROFILE = {
  background: '#d7dce8', fogDensity: .007, exposure: 1.13,
  start: [-1.8, .18, .72], target: [0, 1.48, -.75],
  reset: { yaw: -.23, pitch: .15, distance: 8.9 },
  camera: { minX: -6.65, maxX: 6.65, minY: .68, maxY: 4.72, minZ: -5.65, maxZ: 6.25 },
  pan: { minX: -2.8, maxX: 2.8, minY: .85, maxY: 2.45 },
  zoom: { min: 4.8, max: 13.2 },
  walk: { minX: -6.35, maxX: 6.35, minZ: -5.35, maxZ: 5.86 },
  obstacles: [
    { minX: 3.25, maxX: 5.68, minZ: 1.9, maxZ: 3.43 },
    { minX: 5.52, maxX: 6.35, minZ: -4.03, maxZ: 1.27 }
  ],
  reflection: [2.0, 2.4, -.85]
};

// The reference is a composition guide, not a texture pasted into the room.
// Geometry owns the shelves, garments, vanity, timber floor and circulation.
export function buildPhoebeCloset(scene, resources) {
  const group = new THREE.Group();
  group.name = 'Phoebe dreamy blue and lavender mature closet';
  scene.add(group);

  const track = (set, value) => { resources[set].add(value); return value; };
  const makeMaterial = (color, options = {}) => track('materials', new THREE.MeshPhysicalMaterial({
    color, roughness: .82, metalness: 0, envMapIntensity: .22, ...options
  }));
  const flatBlue = makeMaterial('#324b70', { roughness: .83 });
  const recessedBlue = makeMaterial('#1e3658', { roughness: .93 });
  const trimBlue = makeMaterial('#59799c', { roughness: .72 });
  const softWall = makeMaterial('#d6d6e1', { roughness: .98 });
  const lavender = makeMaterial('#b7a5c5', { roughness: .91 });
  const lavenderVelvet = makeMaterial('#bcaacb', { roughness: .9, sheen: .48, sheenColor: new THREE.Color('#eee3f5') });
  const vanityPaint = makeMaterial('#e8e7ee', { roughness: .78 });
  const paleInset = makeMaterial('#d3d5e1', { roughness: .82 });
  const warmGold = makeMaterial('#cfb47f', { metalness: .72, roughness: .3 });
  const silver = makeMaterial('#d8e0ec', { metalness: .48, roughness: .32 });
  const mirrorMaterial = makeMaterial('#c6d1e2', { metalness: .92, roughness: .055, clearcoat: 1 });
  const linen = makeMaterial('#eeeaf2', { roughness: .97, sheen: .18 });
  const blush = makeMaterial('#cdaebd', { roughness: .84, sheen: .24 });
  const garmentColors = [
    '#f1edf1', '#d1d8e2', '#aab8c7', '#c5b0c5', '#384e70',
    '#d3c7c2', '#b0bbc9', '#faf8f7', '#7d8ca9', '#bd9eae'
  ].map(color => makeMaterial(color, { roughness: .88, sheen: .23 }));

  let seed = 4127;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const floorCanvas = document.createElement('canvas');
  floorCanvas.width = floorCanvas.height = 1024;
  const ctx = floorCanvas.getContext('2d');
  ctx.fillStyle = '#a9b1b9'; ctx.fillRect(0, 0, 1024, 1024);
  for (let row = 0; row < 16; row++) {
    const y = row * 64, shift = row % 2 ? -155 : 0;
    for (let x = shift; x < 1024; x += 310) {
      ctx.fillStyle = ['#aeb8c0', '#9faab4', '#bbc2c8', '#929eaa'][(row + Math.floor((x + 155) / 310) + 20) % 4];
      ctx.fillRect(x + 2, y + 2, 306, 60);
      ctx.strokeStyle = 'rgba(85,98,112,.27)'; ctx.strokeRect(x + 2, y + 2, 306, 60);
      for (let grain = 0; grain < 9; grain++) {
        const gy = y + 7 + grain * 5.5 + random() * 2;
        ctx.strokeStyle = `rgba(80,94,112,${.035 + random() * .095})`;
        ctx.beginPath(); ctx.moveTo(x + 9, gy);
        ctx.bezierCurveTo(x + 90, gy - 3, x + 210, gy + 3, x + 301, gy - 1); ctx.stroke();
      }
    }
  }
  const floorMap = track('textures', new THREE.CanvasTexture(floorCanvas));
  floorMap.colorSpace = THREE.SRGBColorSpace;
  floorMap.wrapS = floorMap.wrapT = THREE.RepeatWrapping;
  floorMap.repeat.set(2.5, 2.4);
  floorMap.anisotropy = 8;
  const timber = makeMaterial('#d5dce2', { map: floorMap, roughness: .89 });
  const rugCanvas = document.createElement('canvas');
  rugCanvas.width = rugCanvas.height = 256;
  const rugContext = rugCanvas.getContext('2d');
  rugContext.fillStyle = '#627b98'; rugContext.fillRect(0, 0, 256, 256);
  for (let fiber = 0; fiber < 9500; fiber++) {
    const value = 105 + Math.floor(random() * 54);
    rugContext.fillStyle = `rgba(${value - 13},${value + 1},${value + 20},${.08 + random() * .22})`;
    rugContext.fillRect(random() * 256, random() * 256, 1 + random() * 3, .8 + random() * 2);
  }
  const rugMap = track('textures', new THREE.CanvasTexture(rugCanvas));
  rugMap.colorSpace = THREE.SRGBColorSpace;
  rugMap.wrapS = rugMap.wrapT = THREE.RepeatWrapping;
  rugMap.repeat.set(5, 2);
  const darkRug = makeMaterial('#e8edf4', { map: rugMap, roughness: 1, metalness: 0 });

  const add = (geometry, material, name, position, rotation = null, parent = group) => {
    track('geometries', geometry);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name; mesh.position.set(...position);
    if (rotation) mesh.rotation.set(...rotation);
    mesh.castShadow = !/wall|ceiling|floor|mirror|rug|light/i.test(name);
    mesh.receiveShadow = true; parent.add(mesh); return mesh;
  };
  const box = (name, x, y, z, w, h, d, material, parent = group) =>
    add(new THREE.BoxGeometry(w, h, d), material, name, [x, y, z], null, parent);
  const cylinder = (name, x, y, z, radius, height, material, segments = 20, parent = group) =>
    add(new THREE.CylinderGeometry(radius, radius, height, segments), material, name, [x, y, z], null, parent);
  const rounded = (name, x, y, z, w, h, d, material, rotation = null, parent = group) => {
    const shape = new THREE.Shape();
    const r = Math.min(.11, w * .12, h * .12), l = -w / 2, b = -h / 2, q = w / 2, t = h / 2;
    shape.moveTo(l + r, b); shape.lineTo(q - r, b); shape.quadraticCurveTo(q, b, q, b + r);
    shape.lineTo(q, t - r); shape.quadraticCurveTo(q, t, q - r, t);
    shape.lineTo(l + r, t); shape.quadraticCurveTo(l, t, l, t - r);
    shape.lineTo(l, b + r); shape.quadraticCurveTo(l, b, l + r, b);
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: true, bevelThickness: .015, bevelSize: .015, bevelSegments: 2, curveSegments: 5 });
    geometry.translate(0, 0, -d / 2);
    return add(geometry, material, name, [x, y, z], rotation, parent);
  };
  const handle = (name, x, y, z) => {
    box(name + ' bar', x, y, z, .29, .028, .03, silver);
    for (const dx of [-.10, .10]) box(name + ' mount', x + dx, y, z + .025, .025, .075, .035, silver);
  };

  // Complete enclosure and open central circulation. No pasted marble tile.
  box('Phoebe light grey wooden plank floor', 0, -.08, .10, 14.8, .16, 13.6, timber);
  box('Phoebe back wall', 0, 2.55, -6.75, 14.8, 5.2, .18, softWall);
  box('Phoebe left wall', -7.32, 2.55, .10, .18, 5.2, 13.6, softWall);
  box('Phoebe right wall', 7.32, 2.55, .10, .18, 5.2, 13.6, softWall);
  box('Phoebe front wall left', -5.07, 2.55, 6.95, 4.65, 5.2, .18, softWall);
  box('Phoebe front wall right', 5.07, 2.55, 6.95, 4.65, 5.2, .18, softWall);
  box('Phoebe front wall over door', 0, 4.78, 6.95, 5.55, .74, .18, softWall);
  box('Phoebe ceiling', 0, 5.13, .10, 14.8, .16, 13.6, softWall);
  for (const z of [-6.57, 6.76]) {
    box('Phoebe restrained crown moulding', 0, 4.83, z, 14.55, .20, .28, vanityPaint);
    box('Phoebe baseboard', 0, .15, z, 14.5, .28, .12, vanityPaint);
  }
  for (const x of [-7.13, 7.13]) {
    box('Phoebe side crown moulding', x, 4.83, .10, .28, .20, 13.3, vanityPaint);
    box('Phoebe side baseboard', x, .15, .10, .12, .28, 13.2, vanityPaint);
  }
  box('Phoebe ceiling cove inset', 0, 5.03, .10, 11.5, .025, 10.0, paleInset);
  for (const x of [-5.76, 5.76]) box('Phoebe warm ceiling cove light', x, 5.0, .10, .025, .025, 9.8, makeMaterial('#ffe4c8', { emissive: '#ffd6b1', emissiveIntensity: .62 }));
  for (const z of [-4.87, 4.87]) box('Phoebe warm ceiling cove light', 0, 5.0, z, 11.5, .025, .025, makeMaterial('#ffe4c8', { emissive: '#ffd6b1', emissiveIntensity: .62 }));

  // Powder-blue built-in system: left wardrobe plus a symmetrical back bank.
  const garmentShape = new THREE.Shape();
  garmentShape.moveTo(-.20, .52); garmentShape.quadraticCurveTo(0, .66, .20, .52);
  garmentShape.lineTo(.45, .28); garmentShape.lineTo(.31, .03); garmentShape.lineTo(.38, -.62);
  garmentShape.quadraticCurveTo(0, -.71, -.38, -.62); garmentShape.lineTo(-.31, .03);
  garmentShape.lineTo(-.45, .28); garmentShape.lineTo(-.20, .52);
  const garment = (name, x, y, z, index, angle = 0, parent = group) => {
    const geometry = new THREE.ExtrudeGeometry(garmentShape, { depth: .085, bevelEnabled: true, bevelThickness: .015, bevelSize: .015, bevelSegments: 2, curveSegments: 6 });
    geometry.translate(0, 0, -.0425);
    const mesh = add(geometry, garmentColors[index % garmentColors.length], name, [x, y, z], [0, angle, 0], parent);
    mesh.scale.set(1.05, 1.25 + index % 3 * .08, 1);
    cylinder(name + ' hanger hook', x, y + .79, z, .014, .16, warmGold, 10, parent);
    return mesh;
  };
  const backBay = (x, width, kind, index) => {
    const bay = new THREE.Group(); bay.name = `Phoebe dreamy blue back wardrobe bay ${index}`; group.add(bay);
    box('Phoebe recessed blue wardrobe backing', x, 2.68, -6.54, width - .06, 4.68, .13, recessedBlue, bay);
    for (const dx of [-1, 1]) box('Phoebe wardrobe stile', x + dx * width / 2, 2.55, -6.26, .12, 5.0, .64, flatBlue, bay);
    box('Phoebe wardrobe lintel', x, 4.99, -6.24, width + .12, .15, .68, trimBlue, bay);
    if (kind === 'rail') {
      box('Phoebe hanging rail', x, 4.05, -6.10, width - .25, .035, .035, silver, bay);
      for (let i = 0; i < 5; i++) garment('Phoebe dimensional mature hanging garment', x - width * .35 + i * width * .175, 2.73, -6.01 - (i % 2) * .035, index * 5 + i, 0, bay);
    } else {
      for (const y of [1.45, 2.23, 3.01, 3.79, 4.57]) {
        box('Phoebe blue display shelf', x, y, -6.18, width - .18, .09, .62, flatBlue, bay);
        box('Phoebe shelf light', x, y - .055, -5.92, width - .25, .018, .02, makeMaterial('#fff3df', { emissive: '#ffe7cb', emissiveIntensity: .5 }), bay);
      }
      const display = (sx, sy, sz, kindIndex) => {
        if (kindIndex % 3 === 0) {
          box('Phoebe fitted luxury display case body', sx, sy, sz, .54, .25, .34, vanityPaint, bay);
          box('Phoebe fitted display case lid', sx, sy + .15, sz, .58, .045, .38, paleInset, bay);
          box('Phoebe case clasp', sx, sy + .03, sz + .19, .09, .08, .018, warmGold, bay);
        } else if (kindIndex % 3 === 1) {
          cylinder('Phoebe perfume vessel', sx, sy, sz, .08, .22, linen, 16, bay);
          cylinder('Phoebe perfume cap', sx, sy + .14, sz, .045, .07, warmGold, 12, bay);
        } else {
          box('Phoebe neatly folded linen stack', sx, sy, sz, .46, .11, .31, linen, bay);
          box('Phoebe neatly folded lavender layer', sx, sy + .085, sz, .43, .07, .29, blush, bay);
        }
      };
      [1.7, 2.48, 3.26, 4.04].forEach((y, i) => display(x, y, -5.95, index * 4 + i));
    }
    for (let i = 0; i < 3; i++) {
      rounded('Phoebe blue drawer front', x, .39 + i * .33, -5.96, width - .20, .28, .055, flatBlue, null, bay);
      box('Phoebe drawer inset line', x, .39 + i * .33, -5.91, width - .35, .19, .012, recessedBlue, bay);
      handle('Phoebe brushed silver drawer handle', x, .42 + i * .33, -5.88);
    }
  };
  backBay(-5.35, 2.70, 'rail', 0);
  backBay(-2.65, 2.70, 'rail', 1);
  backBay(0, 2.54, 'display', 2);
  backBay(2.65, 2.70, 'rail', 3);
  backBay(5.35, 2.70, 'display', 4);

  const sideBay = (z, index, lower = false) => {
    box('Phoebe left blue wardrobe backing', -7.05, 2.65, z, .12, 4.76, 2.25, recessedBlue);
    for (const dz of [-1, 1]) box('Phoebe left blue wardrobe stile', -6.81, 2.55, z + dz * 1.17, .55, 5.00, .12, flatBlue);
    box('Phoebe left wardrobe lintel', -6.80, 4.99, z, .55, .14, 2.42, trimBlue);
    box('Phoebe left rail', -6.73, lower ? 2.72 : 4.09, z, .035, .035, 2.0, silver);
    for (let i = 0; i < 4; i++) garment('Phoebe dimensional side wardrobe garment', -6.67, lower ? 1.54 : 2.78, z - .76 + i * .46, index * 4 + i, Math.PI / 2);
    if (!lower) {
      for (let i = 0; i < 3; i++) {
        rounded('Phoebe side blue drawer front', -6.63, .40 + i * .33, z, 2.0, .27, .05, flatBlue, [0, Math.PI / 2, 0]);
      }
    }
  };
  sideBay(-4.05, 0);
  sideBay(-1.20, 1);
  sideBay(1.65, 2, true);

  // Tall framed vanity on the right; bench stays well clear of the doorway.
  box('Phoebe lavender fluted right wall panel', 7.20, 2.55, -.65, .07, 4.77, 5.2, lavender);
  for (let z = -3.18; z < 1.85; z += .22) box('Phoebe lavender wall flute', 7.13, 2.55, z, .025, 4.72, .045, paleInset);
  rounded('Phoebe off-white vanity desktop', 6.12, .92, -1.26, 1.35, 5.02, .21, vanityPaint, [Math.PI / 2, 0, 0]);
  box('Phoebe vanity pedestal', 6.31, .44, -3.05, 1.20, .84, 1.12, vanityPaint);
  box('Phoebe vanity pedestal', 6.31, .44, .53, 1.20, .84, 1.12, vanityPaint);
  for (const z of [-3.55, -3.14, -2.73, .04, .45, .86]) {
    rounded('Phoebe vanity lavender drawer', 5.71, .36 + (Math.round((z + 3.55) * 10) % 3) * .19, z, .94, .17, .04, paleInset, [0, -Math.PI / 2, 0]);
    cylinder('Phoebe vanity drawer round knob', 5.65, .46, z, .035, .055, warmGold, 16);
  }
  rounded('Phoebe grand vanity mirror frame', 7.04, 3.06, -1.16, 4.0, 3.75, .16, warmGold, [0, -Math.PI / 2, 0]);
  const mirrorSurface = rounded('Phoebe vanity mirror', 6.87, 3.06, -1.16, 3.68, 3.43, .04, mirrorMaterial, [0, -Math.PI / 2, 0]);
  for (const z of [-2.25, -.95, .38]) {
    cylinder('Phoebe sculpted perfume bottle', z === -.95 ? 5.91 : 6.04, 1.16, z, .075, .18, silver, 18);
    cylinder('Phoebe perfume gold cap', z === -.95 ? 5.91 : 6.04, 1.29, z, .042, .075, warmGold, 12);
  }
  rounded('Phoebe lavender tufted bench cushion', 4.44, .61, 2.62, 2.10, .86, .24, lavenderVelvet, [Math.PI / 2, 0, 0]);
  box('Phoebe bench underframe', 4.44, .39, 2.62, 2.10, .10, .92, paleInset);
  for (const x of [3.55, 5.33]) for (const z of [2.25, 2.99]) cylinder('Phoebe slim bench leg', x, .20, z, .035, .40, warmGold, 12);
  for (const x of [3.88, 4.44, 5.0]) for (const z of [2.41, 2.83]) cylinder('Phoebe bench tuft button', x, .75, z, .018, .018, blush, 12);
  rounded('Phoebe narrow mist-blue wool runner', -1.0, .013, .55, 7.6, 2.7, .045, darkRug, [Math.PI / 2, 0, 0]);

  // One complete calm entrance assembly, with a centre seam and paired leaves.
  rounded('Phoebe unified double door', 0, 2.28, 6.71, 4.45, 4.53, .15, vanityPaint);
  for (const x of [-1.1, 1.1]) {
    for (const y of [1.17, 3.20]) {
      rounded('Phoebe double door inset', x, y, 6.60, 1.75, 1.55, .04, paleInset);
      box('Phoebe double door fine trim', x, y, 6.56, 1.58, 1.38, .018, lavender);
    }
    cylinder('Phoebe door handle', x > 0 ? .16 : -.16, 2.30, 6.49, .065, .075, warmGold, 20);
  }
  box('Phoebe unified door centre seam', 0, 2.28, 6.57, .025, 4.42, .02, lavender);
  box('Phoebe double door header', 0, 4.62, 6.60, 4.84, .20, .34, vanityPaint);
  for (const x of [-2.37, 2.37]) box('Phoebe door frame stile', x, 2.28, 6.60, .18, 4.75, .34, vanityPaint);

  return {
    group,
    mirrorSurface,
    reflectiveMaterials: [mirrorMaterial, warmGold, silver],
    profile: PHOEBE_CLOSET_PROFILE
  };
}
