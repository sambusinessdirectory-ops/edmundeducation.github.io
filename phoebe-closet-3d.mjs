import * as THREE from './vendor/three/three.module.js';

export const PHOEBE_CLOSET_PROFILE = {
  background: '#d7dce8', fogDensity: .007, exposure: 1.13,
  start: [2.25, .18, .72], target: [0, 1.48, -.75],
  reset: { yaw: -.23, pitch: .15, distance: 10.2 },
  camera: { minX: -6.65, maxX: 6.65, minY: .68, maxY: 4.72, minZ: -5.65, maxZ: 6.25 },
  pan: { minX: -5.2, maxX: 5.2, minY: .85, maxY: 2.45 },
  zoom: { min: 4.8, max: 13.2 },
  walk: { minX: -6.35, maxX: 6.35, minZ: -5.35, maxZ: 5.86 },
  obstacles: [
    { minX: -3.10, maxX: 1.10, minZ: .64, maxZ: 2.38 },
    { minX: 5.52, maxX: 6.35, minZ: -4.03, maxZ: 1.27 },
    { minX: 4.17, maxX: 5.52, minZ: -1.98, maxZ: -.54 }
  ],
  reflection: [2.0, 2.4, -.85]
};

// Generated surface maps are fitted to geometry; the room is not a pasted screenshot.
// Phoebe's bay construction, windows, seating and circulation remain dimensional.
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
  const ceilingPaint = makeMaterial('#ffffff', { roughness: 1, metalness: 0 });
  const lavender = makeMaterial('#b7a5c5', { roughness: .91 });
  const beigeLeather = makeMaterial('#ffffff', { roughness: .54, sheen: .08, clearcoat: .26, clearcoatRoughness: .46 });
  const vanityPaint = makeMaterial('#e8e7ee', { roughness: .78 });
  const paleInset = makeMaterial('#d3d5e1', { roughness: .82 });
  const warmGold = makeMaterial('#cfb47f', { metalness: .72, roughness: .3 });
  const silver = makeMaterial('#d8e0ec', { metalness: .48, roughness: .32 });
  const mirrorMaterial = makeMaterial('#c6d1e2', { metalness: .92, roughness: .055, clearcoat: 1 });
  const linen = makeMaterial('#eeeaf2', { roughness: .97, sheen: .18 });
  const pillowFabric = makeMaterial('#d5c4da', { roughness: .95, sheen: .24 });
  const blush = makeMaterial('#cdaebd', { roughness: .84, sheen: .24 });
  const loadMap = (filename, repeat = null) => {
    const map = track('textures', new THREE.TextureLoader().load(`./assets/closet/phoebe/${filename}`));
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 8;
    if (repeat) { map.wrapS = map.wrapT = THREE.RepeatWrapping; map.repeat.set(...repeat); }
    return map;
  };
  const marbleMap = loadMap('milky-polished-marble-v1.png', [2.2, 2.05]);
  const wallMap = loadMap('smoky-blue-plaster-v1.png', [2.45, 1.65]);
  const rugMap = loadMap('ivory-double-border-rug-v1.png');
  rugMap.center.set(.5, .5); rugMap.rotation = -Math.PI / 2;
  const oceanMap = loadMap('rocky-ocean-panorama-v1.png');
  const doorMap = loadMap('ornate-ivory-double-door-v1.png');
  const chairLeatherMap = loadMap('white-pebbled-leather-chair-v2.png', [.32, .32]);
  const smallDoorRugMap = loadMap('lavender-wool-door-rug-v2.png');
  ceilingPaint.map = loadMap('elsie-matte-limewash-ceiling-v1.png');
  ceilingPaint.needsUpdate = true;
  const sofaLeatherMap = loadMap('beige-sofa-leather-v1.png', [.72, .72]);
  beigeLeather.map = sofaLeatherMap;
  beigeLeather.bumpMap = sofaLeatherMap;
  beigeLeather.bumpScale = .04;
  beigeLeather.needsUpdate = true;
  const beigeSeatLeather = makeMaterial('#e6d1ba', { map: sofaLeatherMap, bumpMap: sofaLeatherMap, bumpScale: .04, roughness: .56, clearcoat: .22, clearcoatRoughness: .48 });
  const garmentAtlases = [
    { map: loadMap('garments-classic-atlas-v1.png'), cols: 3, rows: 3, count: 9, bands: [0, .33, .64, 1] },
    { map: loadMap('garments-casual-atlas-v1.png'), cols: 4, rows: 2, count: 8 },
    { map: loadMap('garments-evening-atlas-v1.png'), cols: 3, rows: 3, count: 9, bands: [0, .29, .54, 1] }
  ];
  const marble = makeMaterial('#ffffff', { map: marbleMap, roughness: .12, clearcoat: 1, clearcoatRoughness: .06, envMapIntensity: .9 });
  const softWall = makeMaterial('#ffffff', { map: wallMap, roughness: .94 });
  const ivoryRug = makeMaterial('#ffffff', { map: rugMap, roughness: .98, metalness: 0 });
  const ornateDoor = makeMaterial('#ffffff', { map: doorMap, roughness: .54, clearcoat: .45, clearcoatRoughness: .28 });
  const chairLeather = makeMaterial('#ffffff', { map: chairLeatherMap, bumpMap: chairLeatherMap, bumpScale: .085, roughness: .53, sheen: .08, clearcoat: .28, clearcoatRoughness: .45 });
  const chairStitch = makeMaterial('#d4cec9', { roughness: .78 });
  const chairChrome = makeMaterial('#e5e9f0', { metalness: .62, roughness: .24, clearcoat: .82, envMapIntensity: .45, emissive: '#aeb5c1', emissiveIntensity: .16 });
  const lavenderDoorRug = makeMaterial('#ffffff', { map: smallDoorRugMap, roughness: .97, metalness: 0 });

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

  // Complete enclosure and open central circulation, with imagegen marble fitted to the floor.
  box('Phoebe high-gloss milky marble floor', 0, -.08, .10, 14.8, .16, 13.6, marble);
  box('Phoebe back wall', 0, 2.55, -6.75, 14.8, 5.2, .18, softWall);
  box('Phoebe left wall', -7.32, 2.55, .10, .18, 5.2, 13.6, softWall);
  // Two wall openings flank the vanity mirror; exterior imagery sits beyond the enclosure.
  for (const [from, to] of [[-6.70, -5.44], [-4.06, 2.01], [3.39, 6.90]])
    box('Phoebe right wall', 7.32, 2.55, (from + to) / 2, .18, 5.2, to - from, softWall);
  for (const z of [-4.75, 2.70]) {
    box('Phoebe right wall under window', 7.32, .43, z, .18, .86, 1.38, softWall);
    box('Phoebe right wall above window', 7.32, 4.75, z, .18, .90, 1.38, softWall);
  }
  box('Phoebe front wall left', -5.07, 2.55, 6.95, 4.65, 5.2, .18, softWall);
  box('Phoebe front wall right', 5.07, 2.55, 6.95, 4.65, 5.2, .18, softWall);
  box('Phoebe front wall over door', 0, 4.78, 6.95, 5.55, .74, .18, softWall);
  box('Phoebe ceiling', 0, 5.13, .10, 14.8, .16, 13.6, ceilingPaint);
  for (const z of [-6.57, 6.76]) {
    box('Phoebe restrained crown moulding', 0, 4.83, z, 14.55, .20, .28, vanityPaint);
    box('Phoebe baseboard', 0, .15, z, 14.5, .28, .12, vanityPaint);
  }
  for (const x of [-7.13, 7.13]) {
    box('Phoebe side crown moulding', x, 4.83, .10, .28, .20, 13.3, vanityPaint);
    box('Phoebe side baseboard', x, .15, .10, .12, .28, 13.2, vanityPaint);
  }
  box('Phoebe matte limewash ceiling cove inset', 0, 5.03, .10, 11.5, .025, 10.0, ceilingPaint);
  for (const x of [-5.76, 5.76]) box('Phoebe warm ceiling cove light', x, 5.0, .10, .025, .025, 9.8, makeMaterial('#ffe4c8', { emissive: '#ffd6b1', emissiveIntensity: .62 }));
  for (const z of [-4.87, 4.87]) box('Phoebe warm ceiling cove light', 0, 5.0, z, 11.5, .025, .025, makeMaterial('#ffe4c8', { emissive: '#ffd6b1', emissiveIntensity: .62 }));

  // Powder-blue built-in system: left wardrobe plus a symmetrical back bank.
  let garmentOrdinal = 0;
  const garment = (name, x, y, z, angle = 0, parent = group) => {
    const ordinal = garmentOrdinal++;
    let cell = ordinal;
    const atlas = garmentAtlases.find(source => { if (cell < source.count) return true; cell -= source.count; return false; });
    if (!atlas) throw new Error('Phoebe garment atlas exhausted');
    const map = track('textures', atlas.map.clone());
    // The artist atlases are not perfectly gridded vertically. The evening plaid
    // in cell 4 runs into the next dress; use another unique evening look instead.
    if (atlas.bands && atlas === garmentAtlases[2] && cell >= 4) cell++;
    const column = cell % atlas.cols, row = Math.floor(cell / atlas.cols);
    const top = atlas.bands ? atlas.bands[row] : row / atlas.rows;
    const bottom = atlas.bands ? atlas.bands[row + 1] : (row + 1) / atlas.rows;
    map.repeat.set(1 / atlas.cols, bottom - top);
    map.offset.set(column / atlas.cols, 1 - bottom);
    map.needsUpdate = true;
    const material = makeMaterial('#ffffff', { map, roughness: .88, transparent: true, alphaTest: .14, side: THREE.DoubleSide, depthWrite: false, sheen: .15 });
    const longGarment = row === 2 && atlas.rows === 3;
    const height = longGarment ? 1.55 : 1.30;
    const mesh = add(new THREE.PlaneGeometry(1.30, height), material, `${name} ${ordinal + 1}`, [x, y - (height - 1.30) / 2, z], [0, angle + (ordinal % 3 - 1) * .045, 0], parent);
    mesh.castShadow = true;
    cylinder(`${name} brass hanger hook`, x, y + .70, z, .013, .14, warmGold, 10, parent);
    return mesh;
  };
  const backBay = (x, width, kind, index) => {
    const bay = new THREE.Group(); bay.name = `Phoebe dreamy blue back wardrobe bay ${index}`; group.add(bay);
    box('Phoebe recessed blue wardrobe backing', x, 2.68, -6.54, width - .06, 4.68, .13, recessedBlue, bay);
    for (const dx of [-1, 1]) box('Phoebe wardrobe stile', x + dx * width / 2, 2.55, -6.26, .12, 5.0, .64, flatBlue, bay);
    box('Phoebe wardrobe lintel', x, 4.99, -6.24, width + .12, .15, .68, trimBlue, bay);
    if (kind === 'rail') {
      box('Phoebe hanging rail', x, 4.05, -6.10, width - .25, .035, .035, silver, bay);
      for (let i = 0; i < 5; i++) garment('Phoebe realistic hanging garment cutout', x - width * .35 + i * width * .175, 2.82, -5.98 - (i % 2) * .055, 0, bay);
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
    for (let i = 0; i < 3; i++) garment('Phoebe realistic side wardrobe garment cutout', -6.65, lower ? 1.52 : 2.82, z - .63 + i * .63, Math.PI / 2);
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
  rounded('Phoebe off-white vanity desktop', 6.12, .92, -1.26, 1.35, 5.02, .21, vanityPaint, [Math.PI / 2, 0, 0]);
  box('Phoebe vanity pedestal', 6.31, .44, -3.05, 1.20, .84, 1.12, vanityPaint);
  box('Phoebe vanity pedestal', 6.31, .44, .53, 1.20, .84, 1.12, vanityPaint);
  for (const z of [-3.05, .53]) {
    for (const y of [.23, .45, .67]) {
      rounded('Phoebe aligned vanity drawer front', 5.69, y, z, .94, .17, .04, paleInset, [0, -Math.PI / 2, 0]);
      add(new THREE.SphereGeometry(.037, 16, 12), warmGold, 'Phoebe aligned vanity drawer gold knob', [5.61, y, z]);
    }
  }
  rounded('Phoebe grand vanity mirror frame', 7.04, 3.06, -1.16, 4.0, 3.75, .16, warmGold, [0, -Math.PI / 2, 0]);
  const mirrorSurface = rounded('Phoebe vanity mirror', 6.87, 3.06, -1.16, 3.68, 3.43, .04, mirrorMaterial, [0, -Math.PI / 2, 0]);
  const window = (z, crop) => {
    const viewMap = track('textures', oceanMap.clone());
    viewMap.repeat.set(.42, 1);
    viewMap.offset.set(crop, 0);
    viewMap.needsUpdate = true;
    const viewMaterial = track('materials', new THREE.MeshBasicMaterial({ map: viewMap, side: THREE.DoubleSide, toneMapped: false }));
    add(new THREE.PlaneGeometry(2.55, 4.05), viewMaterial, 'Phoebe ocean view with boats and rocky coast', [8.16, 2.57, z], [0, -Math.PI / 2, 0]);
    for (const side of [-1, 1]) {
      const corner = new THREE.Shape();
      if (side < 0) {
        corner.moveTo(-.69, .95); corner.lineTo(-.69, 1.64); corner.lineTo(0, 1.64);
        for (let i = 0; i <= 12; i++) { const theta = Math.PI / 2 + i * Math.PI / 24; corner.lineTo(.69 * Math.cos(theta), .95 + .69 * Math.sin(theta)); }
      } else {
        corner.moveTo(0, 1.64); corner.lineTo(.69, 1.64); corner.lineTo(.69, .95);
        for (let i = 12; i >= 0; i--) { const theta = i * Math.PI / 24; corner.lineTo(.69 * Math.cos(theta), .95 + .69 * Math.sin(theta)); }
      }
      add(new THREE.ShapeGeometry(corner, 12), softWall, 'Phoebe arched window blue-plaster corner', [7.21, 2.66, z], [0, -Math.PI / 2, 0]);
      box('Phoebe thin domed window vertical frame', 7.07, 2.26, z + side * .69, .10, 2.80, .09, vanityPaint);
    }
    const archPoints = [];
    for (let i = 0; i <= 24; i++) {
      const theta = Math.PI * i / 24;
      archPoints.push(new THREE.Vector3(7.07, 3.66 + .69 * Math.sin(theta), z + .69 * Math.cos(theta)));
    }
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(archPoints), 32, .048, 8, false), vanityPaint, 'Phoebe thin domed window arch', [0, 0, 0]);
    box('Phoebe slender window central mullion', 7.02, 2.59, z, .055, 3.20, .046, vanityPaint);
    for (const y of [2.17, 3.12]) box('Phoebe ocean-window cross muntin', 7.02, y, z, .055, .045, 1.30, vanityPaint);
    box('Phoebe shaped window sill', 6.96, .82, z, .25, .12, 1.67, vanityPaint);
  };
  window(-4.75, .06);
  window(2.70, .53);
  // Perfumes sit together at one end of the makeup desk, leaving room for candles.
  rounded('Phoebe grouped perfume silver tray', 6.08, 1.075, -2.18, .51, .58, .025, chairChrome, [Math.PI / 2, 0, 0]);
  [
    [5.91, -2.38, .07, .22], [6.13, -2.18, .09, .18], [5.96, -1.97, .055, .25]
  ].forEach(([x, z, radius, height], index) => {
    cylinder('Phoebe clustered perfume bottle ' + (index + 1), x, 1.10 + height / 2, z, radius, height, silver, 20);
    cylinder('Phoebe clustered perfume cap ' + (index + 1), x, 1.13 + height, z, radius * .53, .065, warmGold, 16);
  });
  cylinder('Phoebe vanity round candle tray like Elsie', 6.08, 1.075, .44, .30, .035, warmGold, 32);
  add(new THREE.TorusGeometry(.265, .012, 8, 36), warmGold, 'Phoebe candle tray delicate gold rim', [6.08, 1.105, .44], [Math.PI / 2, 0, 0]);
  const candleWick = makeMaterial('#4b403d', { roughness: 1 });
  const candleFlame = makeMaterial('#fff2d1', { emissive: '#ffc680', emissiveIntensity: 1.2 });
  [
    [5.95, .32, .25, .07], [6.19, .40, .34, .085], [6.03, .58, .18, .06]
  ].forEach(([x, z, height, radius], index) => {
    cylinder('Phoebe vanity candle ' + (index + 1), x, 1.105 + height / 2, z, radius, height, linen, 24);
    cylinder('Phoebe candle wick ' + (index + 1), x, 1.11 + height, z, .008, .04, candleWick, 8);
    const flame = add(new THREE.SphereGeometry(.027, 12, 8), candleFlame, 'Phoebe warm candle flame ' + (index + 1), [x, 1.18 + height, z]);
    flame.scale.y = 1.35;
  });

  // High-poly ergonomic leather bucket chair; its back is a thick curved loft,
  // not a flat panel or a stack of oval primitives.
  const chairX = 4.73, chairZ = -1.27;
  cylinder('Phoebe silver metallic vanity chair pedestal disc', chairX, .105, chairZ, .50, .065, chairChrome, 40);
  add(new THREE.TorusGeometry(.495, .016, 10, 48), chairChrome, 'Phoebe chair silver foot rim', [chairX, .14, chairZ], [Math.PI / 2, 0, 0]);
  cylinder('Phoebe silver metallic vanity chair swivel stem', chairX, .42, chairZ, .072, .59, chairChrome, 28);
  cylinder('Phoebe chair silver seat-height collar', chairX, .71, chairZ, .14, .09, chairChrome, 24);
  const chairSeatBase = add(new THREE.SphereGeometry(1, 64, 40), chairLeather, 'Phoebe high-poly white leather chair seat foundation', [chairX, .75, chairZ]);
  chairSeatBase.scale.set(.57, .11, .49);
  const chairSeat = add(new THREE.SphereGeometry(1, 72, 48), chairLeather, 'Phoebe thick high-poly white leather contoured seat cushion', [chairX + .035, .85, chairZ]);
  chairSeat.scale.set(.54, .15, .46);
  const shellU = 80, shellV = 24, shellRows = (shellU + 1) * (shellV + 1);
  const shellPositions = [], shellUvs = [], shellIndices = [];
  const chairTheta = u => Math.PI / 2 + Math.PI * u;
  const chairTop = u => 1.03 + .68 * Math.sin(Math.PI * u);
  for (const inner of [false, true]) {
    for (let i = 0; i <= shellU; i++) {
      const u = i / shellU, theta = chairTheta(u);
      for (let j = 0; j <= shellV; j++) {
        const v = j / shellV;
        const radius = inner ? .445 : .555 + .025 * Math.sin(Math.PI * v);
        shellPositions.push(chairX + radius * Math.cos(theta), .84 + v * (chairTop(u) - .84), chairZ + radius * Math.sin(theta));
        shellUvs.push(u, v);
      }
    }
  }
  const shellIndex = (surface, i, j) => surface * shellRows + i * (shellV + 1) + j;
  for (let i = 0; i < shellU; i++) {
    for (let j = 0; j < shellV; j++) {
      const a = shellIndex(0, i, j), b = shellIndex(0, i + 1, j), c = shellIndex(0, i + 1, j + 1), d = shellIndex(0, i, j + 1);
      shellIndices.push(a, b, d, b, c, d);
      const e = shellIndex(1, i, j), f = shellIndex(1, i + 1, j), g = shellIndex(1, i + 1, j + 1), h = shellIndex(1, i, j + 1);
      shellIndices.push(e, h, f, f, h, g);
    }
    const ot = shellIndex(0, i, shellV), nt = shellIndex(0, i + 1, shellV);
    const it = shellIndex(1, i, shellV), jt = shellIndex(1, i + 1, shellV);
    shellIndices.push(ot, it, nt, nt, it, jt);
    const ob = shellIndex(0, i, 0), nb = shellIndex(0, i + 1, 0);
    const ib = shellIndex(1, i, 0), jb = shellIndex(1, i + 1, 0);
    shellIndices.push(ob, nb, ib, nb, jb, ib);
  }
  for (const i of [0, shellU]) for (let j = 0; j < shellV; j++) {
    const a = shellIndex(0, i, j), b = shellIndex(0, i, j + 1);
    const c = shellIndex(1, i, j), d = shellIndex(1, i, j + 1);
    shellIndices.push(a, c, b, b, c, d);
  }
  const chairShellGeometry = new THREE.BufferGeometry();
  chairShellGeometry.setAttribute('position', new THREE.Float32BufferAttribute(shellPositions, 3));
  chairShellGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(shellUvs, 2));
  chairShellGeometry.setIndex(shellIndices);
  chairShellGeometry.computeVertexNormals();
  add(chairShellGeometry, chairLeather, 'Phoebe high-poly upholstered bucket chair wraparound back and arms', [0, 0, 0]);
  const chairRim = [];
  for (let i = 0; i <= shellU; i++) {
    const u = i / shellU, theta = chairTheta(u);
    chairRim.push(new THREE.Vector3(chairX + .56 * Math.cos(theta), chairTop(u) + .01, chairZ + .56 * Math.sin(theta)));
  }
  add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(chairRim), 96, .019, 12, false), chairLeather, 'Phoebe padded white-leather bucket-chair top piping', [0, 0, 0]);
  const chairSeatRim = [];
  for (let i = 0; i <= 72; i++) {
    const theta = i * Math.PI * 2 / 72;
    chairSeatRim.push(new THREE.Vector3(chairX + .52 * Math.cos(theta), .80, chairZ + .45 * Math.sin(theta)));
  }
  add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(chairSeatRim), 96, .012, 10, true), chairLeather, 'Phoebe tailored white-leather chair seat welt', [0, 0, 0]);
  for (const u of [.32, .50, .68]) {
    const theta = chairTheta(u), outerSeam = [];
    for (let j = 0; j <= 18; j++) {
      const v = .12 + j * .74 / 18;
      const radius = .563 + .025 * Math.sin(Math.PI * v);
      outerSeam.push(new THREE.Vector3(chairX + radius * Math.cos(theta), .84 + v * (chairTop(u) - .84), chairZ + radius * Math.sin(theta)));
    }
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(outerSeam), 24, .006, 8, false), chairStitch, 'Phoebe tailored leather chair exterior stitched channel', [0, 0, 0]);
  }
  for (const u of [.34, .50, .66]) {
    const theta = chairTheta(u), seam = [];
    for (let j = 0; j <= 14; j++) {
      const v = j / 14;
      seam.push(new THREE.Vector3(chairX + .436 * Math.cos(theta), .96 + v * (chairTop(u) - 1.04), chairZ + .436 * Math.sin(theta)));
    }
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(seam), 20, .007, 6, false), linen, 'Phoebe leather chair ergonomic stitched channel', [0, 0, 0]);
  }

  // Seat group moves toward the carpet's door-facing edge, remaining centred across the rug.
  const sofaStart = group.children.length;
  box('Phoebe beige leather sofa base', 2.73, .40, 1.91, 3.75, .30, 1.22, beigeLeather);
  rounded('Phoebe long beige leather sofa seat cushion', 2.73, .63, 1.84, 3.48, 1.12, .30, beigeSeatLeather, [Math.PI / 2, 0, 0]);
  box('Phoebe tufted beige leather sofa back', 2.73, 1.19, 2.43, 3.75, 1.20, .30, beigeLeather);
  const rolledBack = add(new THREE.SphereGeometry(.36, 24, 16), beigeLeather, 'Phoebe rolled beige leather sofa back crest', [2.73, 1.78, 2.43]);
  rolledBack.scale.set(5.35, .70, .90);
  for (const x of [.83, 4.63]) {
    box('Phoebe beige leather sofa arm side', x, .92, 1.90, .42, .95, 1.27, beigeLeather);
    const scroll = add(new THREE.SphereGeometry(.27, 20, 14), beigeLeather, 'Phoebe rounded beige leather sofa arm scroll', [x, 1.39, 1.85]);
    scroll.scale.set(1.15, .76, 2.75);
  }
  for (const y of [1.04, 1.34, 1.61]) for (let i = 0; i < 7; i++) {
    const x = 1.17 + i * .52 + (y === 1.34 ? .25 : 0);
    if (x < 4.36) add(new THREE.SphereGeometry(.028, 10, 8), blush, 'Phoebe sofa diamond-tufted velvet button', [x, y, 2.24]);
  }
  for (const x of [1.34, 4.12]) {
    const outline = new THREE.Shape();
    outline.moveTo(-.22, -.34); outline.lineTo(.22, -.34); outline.quadraticCurveTo(.33, -.34, .33, -.22);
    outline.lineTo(.33, .22); outline.quadraticCurveTo(.33, .34, .22, .34);
    outline.lineTo(-.22, .34); outline.quadraticCurveTo(-.33, .34, -.33, .22);
    outline.lineTo(-.33, -.22); outline.quadraticCurveTo(-.33, -.34, -.22, -.34);
    const pillowGeometry = new THREE.ExtrudeGeometry(outline, { depth: .16, bevelEnabled: true, bevelThickness: .09, bevelSize: .08, bevelSegments: 4, curveSegments: 8 });
    pillowGeometry.translate(0, 0, -.08);
    add(pillowGeometry, pillowFabric, 'Phoebe soft lilac sofa cushion leaning to back', [x, 1.18, 2.16], [.24, 0, x < 2 ? -.14 : .14]);
  }
  for (const x of [1.06, 4.40]) for (const z of [1.43, 2.38]) cylinder('Phoebe slender champagne sofa leg', x, .18, z, .048, .36, warmGold, 12);
  const sofaGroup = new THREE.Group();
  sofaGroup.name = 'Phoebe long upholstered sofa centered near door-facing carpet edge';
  sofaGroup.position.set(-3.73, 0, -.36);
  for (const piece of group.children.splice(sofaStart)) sofaGroup.add(piece);
  group.add(sofaGroup);
  box('Phoebe dimensional ivory area rug backing', -1.0, .018, .24, 7.5, .036, 5.0, linen);
  add(new THREE.PlaneGeometry(7.5, 5.0), ivoryRug, 'Phoebe imagegen ivory double-border woven area rug', [-1.0, .038, .24], [-Math.PI / 2, 0, 0]);
  box('Phoebe small lavender door carpet backing', 0, .016, 5.43, 2.85, .032, 1.65, blush);
  add(new THREE.PlaneGeometry(2.85, 1.65), lavenderDoorRug, 'Phoebe imagegen plain pinkish-purple wool doorway rug', [0, .035, 5.43], [-Math.PI / 2, 0, 0]);

  // Imagegen ornament belongs to the full door leaves, not floating cards over old blocks.
  box('Phoebe dimensional paired door body', 0, 2.28, 6.71, 4.45, 4.53, .15, vanityPaint);
  add(new THREE.PlaneGeometry(4.45, 4.53), ornateDoor, 'Phoebe ornate ivory double-door leaf surface', [0, 2.28, 6.62], [0, Math.PI, 0]);
  for (const x of [-.16, .16]) {
    box('Phoebe carved door long gold pull', x, 2.30, 6.51, .038, .52, .045, warmGold);
    for (const y of [2.03, 2.57]) box('Phoebe carved door handle mount', x, y, 6.49, .09, .04, .04, warmGold);
  }
  box('Phoebe real twin-leaf centre seam', 0, 2.28, 6.58, .018, 4.45, .02, warmGold);
  box('Phoebe double door header', 0, 4.62, 6.60, 4.84, .20, .34, vanityPaint);
  for (const x of [-2.37, 2.37]) box('Phoebe door frame stile', x, 2.28, 6.60, .18, 4.75, .34, vanityPaint);
  const shadeFabric = makeMaterial('#fff1dc', { roughness: .76, emissive: '#ffe0ba', emissiveIntensity: .24, side: THREE.DoubleSide });
  for (const x of [-3.22, 3.22]) {
    rounded('Phoebe gold wall-sconce backplate beside double door', x, 3.15, 6.82, .18, .52, .045, warmGold);
    const arch = [
      new THREE.Vector3(x, 3.12, 6.76), new THREE.Vector3(x, 3.47, 6.66),
      new THREE.Vector3(x, 3.77, 6.50), new THREE.Vector3(x, 3.77, 6.26),
      new THREE.Vector3(x, 3.48, 6.10)
    ];
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(arch), 24, .025, 10, false), warmGold, 'Phoebe arched gold sconce arm', [0, 0, 0]);
    cylinder('Phoebe wall-sconce polished gold shade cap', x, 3.40, 6.10, .17, .10, warmGold, 24);
    cylinder('Phoebe wall-sconce glowing ivory fluted shade', x, 3.00, 6.10, .18, .66, shadeFabric, 24);
    for (let i = 0; i < 16; i++) {
      const theta = i * Math.PI / 8;
      cylinder('Phoebe ivory wall-sconce shade flute', x + .177 * Math.cos(theta), 3.00, 6.10 + .177 * Math.sin(theta), .007, .56, linen, 8);
    }
    const glow = new THREE.PointLight('#ffe7ca', .45, 2.0, 2);
    glow.name = 'Phoebe warm doorway sconce glow'; glow.position.set(x, 2.95, 6.03); group.add(glow);
  }

  return {
    group,
    mirrorSurface,
    reflectiveMaterials: [mirrorMaterial, warmGold, silver],
    profile: PHOEBE_CLOSET_PROFILE
  };
}
