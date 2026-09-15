import { mountClosetInventory } from './eddy-closet-inventory.mjs?v=20260915-fitting2';
import {batchClosetSurfaces} from './closet-static-batches.mjs';
import * as THREE from './vendor/three/three.module.js';
import { MascotCharacters } from './speaking-mascot-characters.mjs?v=20260915-fitting2';

let activeClose = null;
const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));

function canvasTexture(resources, size, draw, { color = true, repeat = [1, 1] } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const context = canvas.getContext('2d');
  draw(context, size);
  const texture = new THREE.CanvasTexture(canvas);
  if (color) texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(...repeat);
  texture.anisotropy = 8;
  resources.textures.add(texture);
  return texture;
}

function floorTextures(resources) {
  let seed = 81;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const draw = (context, size, bump = false) => {
    context.fillStyle = bump ? '#777' : '#412c21';
    context.fillRect(0, 0, size, size);
    for (let row = -3; row < 24; row++) {
      for (let column = -3; column < 24; column++) {
        const plank = 76;
        const x = column * plank + (row % 2) * plank * .5;
        const y = row * plank * .54;
        context.save();
        context.translate(x, y);
        context.rotate((column + row) % 2 ? Math.PI / 4 : -Math.PI / 4);
        context.fillStyle = bump ? '#858585' : ['#59402f', '#654734', '#4d3629', '#72513a'][Math.floor(random() * 4)];
        context.fillRect(-37, -16, 74, 32);
        context.strokeStyle = bump ? '#4a4a4a' : 'rgba(23,12,8,.66)';
        context.lineWidth = bump ? 2 : 1.5;
        context.strokeRect(-37, -16, 74, 32);
        for (let grain = 0; grain < 4; grain++) {
          const gy = -11 + grain * 7 + random() * 2;
          context.strokeStyle = bump ? 'rgba(105,105,105,.75)' : 'rgba(238,188,133,.13)';
          context.beginPath();
          context.moveTo(-33, gy);
          context.bezierCurveTo(-12, gy + random() * 4, 10, gy - random() * 4, 33, gy + random() * 2);
          context.stroke();
        }
        context.restore();
      }
    }
  };
  seed = 81;
  const map = canvasTexture(resources, 1024, (context, size) => draw(context, size, false), { repeat: [2.15, 2.15] });
  seed = 81;
  const bumpMap = canvasTexture(resources, 1024, (context, size) => draw(context, size, true), { color: false, repeat: [2.15, 2.15] });
  return { map, bumpMap };
}

function surfaceTextures(resources) {
  let seed = 193;
  const random = () => {
    seed = (seed * 1103515245 + 12345) >>> 0;
    return seed / 4294967296;
  };
  const wood = canvasTexture(resources, 512, (context, size) => {
    const gradient = context.createLinearGradient(0, 0, size, 0);
    gradient.addColorStop(0, '#241c19');
    gradient.addColorStop(.5, '#392923');
    gradient.addColorStop(1, '#201917');
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
    for (let x = 0; x < size; x += 5 + random() * 9) {
      context.strokeStyle = 'rgba(174,112,72,' + (.025 + random() * .08) + ')';
      context.beginPath();
      context.moveTo(x, 0);
      context.bezierCurveTo(x + random() * 16 - 8, size * .35, x + random() * 18 - 9, size * .7, x, size);
      context.stroke();
    }
  }, { repeat: [2, 2.6] });
  const weave = canvasTexture(resources, 256, (context, size) => {
    context.fillStyle = '#858585';
    context.fillRect(0, 0, size, size);
    context.lineWidth = 1;
    for (let line = 0; line < size; line += 4) {
      context.strokeStyle = line % 8 ? '#777' : '#989898';
      context.beginPath(); context.moveTo(line, 0); context.lineTo(line, size); context.stroke();
      context.beginPath(); context.moveTo(0, line); context.lineTo(size, line); context.stroke();
    }
  }, { color: false, repeat: [7, 9] });
  const marble = canvasTexture(resources, 512, (context, size) => {
    context.fillStyle = '#262524';
    context.fillRect(0, 0, size, size);
    for (let vein = 0; vein < 24; vein++) {
      const y = random() * size;
      context.strokeStyle = vein % 4 ? 'rgba(160,151,139,.12)' : 'rgba(183,126,79,.22)';
      context.lineWidth = .5 + random() * 2;
      context.beginPath();
      context.moveTo(-30, y);
      context.bezierCurveTo(size * .25, y - 90 + random() * 180, size * .7, y - 70 + random() * 140, size + 30, y + random() * 80 - 40);
      context.stroke();
    }
  }, { repeat: [1.2, .65] });
  const plaster = canvasTexture(resources, 512, (context, size) => {
    context.fillStyle = '#77736d';
    context.fillRect(0, 0, size, size);
    for (let mark = 0; mark < 2600; mark++) {
      const light = 91 + Math.floor(random() * 34);
      context.fillStyle = `rgba(${light},${light - 3},${light - 7},${.035 + random() * .09})`;
      context.fillRect(random() * size, random() * size, 2 + random() * 12, 1 + random() * 3);
    }
    context.globalAlpha = .12;
    for (let band = 0; band < size; band += 38) {
      context.fillStyle = band % 76 ? '#aca69d' : '#4b4844';
      context.fillRect(0, band, size, 2);
    }
    context.globalAlpha = 1;
  }, { repeat: [2.4, 1.5] });
  const plasterBump = canvasTexture(resources, 512, (context, size) => {
    context.fillStyle = '#777';
    context.fillRect(0, 0, size, size);
    for (let mark = 0; mark < 3200; mark++) {
      const value = 92 + Math.floor(random() * 78);
      context.fillStyle = `rgb(${value},${value},${value})`;
      context.fillRect(random() * size, random() * size, 1 + random() * 8, 1 + random() * 2);
    }
  }, { color: false, repeat: [2.4, 1.5] });
  return { wood, weave, marble, plaster, plasterBump };
}

function buildCloset(scene, resources) {
  const group = new THREE.Group();
  group.name = 'Eddie low-light closet';
  scene.add(group);

  const surfaces = surfaceTextures(resources);
  const floorMaps = floorTextures(resources);
  const textureLoader = new THREE.TextureLoader();
  const loadSurface = (path, { color = true, repeat = [1, 1] } = {}) => {
    const texture = textureLoader.load(new URL(path, import.meta.url).href);
    if (color) texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(...repeat);
    texture.anisotropy = 8;
    resources.textures.add(texture);
    return texture;
  };
  const generatedGarments = [
    './assets/closet/materials/folded-ivory-ribbed-v1.png',
    './assets/closet/materials/folded-blue-polo-v1.png',
    './assets/closet/materials/folded-taupe-linen-v1.png',
    './assets/closet/materials/folded-charcoal-cashmere-v1.png'
  ].map(path => loadSurface(path));
  const hangingGarmentSpecs = [
    ['cream cable-knit sweater', './assets/closet/materials/hanging-garments/cream-cable-knit-v1.png', .97, .36],
    ['charcoal cashmere turtleneck', './assets/closet/materials/hanging-garments/charcoal-cashmere-v1.png', .93, .58],
    ['white cotton T-shirt', './assets/closet/materials/hanging-garments/white-cotton-tee-v1.png', .96, .22],
    ['pale blue Oxford shirt', './assets/closet/materials/hanging-garments/pale-blue-oxford-v1.png', .88, .28],
    ['navy wool suit jacket', './assets/closet/materials/hanging-garments/navy-suit-v1.png', .78, .48],
    ['sand linen overshirt', './assets/closet/materials/hanging-garments/sand-linen-v1.png', .94, .18],
    ['burgundy silk shirt', './assets/closet/materials/hanging-garments/burgundy-silk-v1.png', .42, .92],
    ['indigo denim jacket', './assets/closet/materials/hanging-garments/indigo-denim-v1.png', .90, .20],
    ['brown checked flannel shirt', './assets/closet/materials/hanging-garments/brown-check-v1.png', .95, .34]
  ];
  const hangingGarmentMaps = hangingGarmentSpecs.map(([, path]) => loadSurface(path));
  const charcoalRugMap = loadSurface('./assets/closet/materials/rug-charcoal-low-pile-v1.png');
  const burgundyRugMap = loadSurface('./assets/closet/materials/rug-burgundy-door-v1.png');
  const featureWallMap = loadSurface('./assets/closet/materials/charcoal-bronze-plaster-v1.jpg', { repeat: [2.2, 1.25] });
  const featureWallBump = loadSurface('./assets/closet/materials/charcoal-bronze-plaster-v1.jpg', { color: false, repeat: [2.2, 1.25] });
  const material = (color, options = {}) => {
    // Match the smooth speaking classroom's single-layer material model.
    // Colour, fabric maps, metal, roughness and reflections are retained without
    // evaluating extra clearcoat and sheen lighting lobes for every fragment.
    const {clearcoat, clearcoatRoughness, sheen, sheenColor, ...standard} = options;
    const value = new THREE.MeshStandardMaterial({ color, roughness: .72, envMapIntensity: .7, ...standard });
    resources.materials.add(value);
    return value;
  };
  const darkWood = material('#604b41', { map: surfaces.wood, roughness: .92, metalness: 0, clearcoat: 0, envMapIntensity: .08 });
  const mattePanel = material('#776257', { map: surfaces.wood, roughness: .96, metalness: 0, clearcoat: 0, envMapIntensity: .06 });
  const luxuryWalnut = material('#4c261c', { map: surfaces.wood, roughness: .38, metalness: .02, clearcoat: .34, clearcoatRoughness: .48, envMapIntensity: .24 });
  const cabinetFace = material('#46342d', { map: surfaces.wood, roughness: .42, clearcoat: .24, clearcoatRoughness: .52 });
  const trim = material('#875b3c', { roughness: .38, metalness: .1, clearcoat: .3 });
  const wall = new THREE.MeshStandardMaterial({ color: '#ffffff', map: surfaces.plaster, bumpMap: surfaces.plasterBump, bumpScale: .075, roughness: 1, metalness: 0 });
  resources.materials.add(wall);
  const cloth = ['#e7ded3', '#a99b90', '#627386', '#55504b', '#c7a486', '#8f8a79'].map(color =>
    material(color, { roughness: .88, sheen: .62, sheenColor: new THREE.Color(color), bumpMap: surfaces.weave, bumpScale: .014, side: THREE.DoubleSide })
  );
  const brass = material('#bf8750', { roughness: .25, metalness: .82, clearcoat: .45 });
  const mirrorMaterial = material('#aab4b7', { roughness: .08, metalness: .96, clearcoat: 1, clearcoatRoughness: .06 });
  const marble = material('#ffffff', { map: surfaces.marble, roughness: .2, metalness: .08, clearcoat: .74, clearcoatRoughness: .14 });
  const floor = material('#ffffff', { map: floorMaps.map, bumpMap: floorMaps.bumpMap, bumpScale: .045, roughness: .48, clearcoat: .13, clearcoatRoughness: .72 });
  const stitching = material('#dcc5ab', { roughness: .94 });
  const buttonMaterial = material('#493b34', { roughness: .34, metalness: .18 });
  const ottomanFabric = material('#b9a17c', { roughness: .9, sheen: .72, sheenColor: new THREE.Color('#e7d3b0'), bumpMap: surfaces.weave, bumpScale: .02 });
  const featureWall = new THREE.MeshStandardMaterial({ color: '#ffffff', map: featureWallMap, bumpMap: featureWallBump, bumpScale: .11, roughness: 1, metalness: 0 });
  resources.materials.add(featureWall);
  const foldedSideColours = ['#ddd5c8', '#64758b', '#9c897a', '#484746'];
  const foldedSides = foldedSideColours.map(color => material(color, { roughness: .96, metalness: 0, clearcoat: 0, bumpMap: surfaces.weave, bumpScale: .025 }));
  const foldedTops = generatedGarments.map(map => material('#ffffff', { map, transparent: false, alphaTest: .08, roughness: .96, metalness: 0, clearcoat: 0, side: THREE.DoubleSide }));
  const hangingGarmentFaces = hangingGarmentSpecs.map(([name, , roughness, sheen], index) =>
    material('#ffffff', {
      name: 'Generated ' + name + ' material',
      map: hangingGarmentMaps[index],
      transparent: false,
      alphaTest: .08,
      roughness,
      sheen,
      sheenColor: new THREE.Color(index === 6 ? '#8e4853' : '#f4eadc'),
      metalness: 0,
      clearcoat: 0,
      side: THREE.DoubleSide
    })
  );
  const charcoalRug = material('#ffffff', { map: charcoalRugMap, bumpMap: charcoalRugMap, bumpScale: .045, roughness: .98, metalness: 0, clearcoat: 0 });
  const burgundyRug = material('#ffffff', { map: burgundyRugMap, bumpMap: burgundyRugMap, bumpScale: .05, roughness: .98, metalness: 0, clearcoat: 0 });

  const add = (geometry, value, name, position, rotation = null, parent = group) => {
    resources.geometries.add(geometry);
    const mesh = new THREE.Mesh(geometry, value);
    mesh.name = name;
    mesh.position.set(...position);
    if (rotation) mesh.rotation.set(...rotation);
    mesh.castShadow = !/wall|ceiling|mirror|floor/i.test(name);
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };
  const box = (name, x, y, z, width, height, depth, value, parent = group) =>
    add(new THREE.BoxGeometry(width, height, depth), value, name, [x, y, z], null, parent);
  const foldedGarment = (name, x, y, z, width, height, depth, style, parent = group) => {
    const side = foldedSides[style % foldedSides.length];
    const top = foldedTops[style % foldedTops.length];
    return add(new THREE.BoxGeometry(width, height, depth), [side, side, top, side, side, side], name, [x, y, z], null, parent);
  };
  const luxuryCase = (name, x, y, z, width, height, depth, parent = group, faceAxis = 'z', faceSign = 1) => {
    box(name + ' walnut body', x, y, z, width, height, depth, luxuryWalnut, parent);
    box(name + ' brass lid inlay', x, y + height / 2 + .026, z, width + .07, .052, depth + .07, brass, parent);
    box(name + ' fitted walnut lid', x, y + height / 2 + .06, z, width, .055, depth, luxuryWalnut, parent);
    const lockY = y - .015;
    if (faceAxis === 'z') {
      const faceZ = z + faceSign * (depth / 2 + .018);
      box(name + ' brass lock plate', x, lockY, faceZ, .25, .17, .025, brass, parent);
      box(name + ' keyhole', x, lockY, faceZ + faceSign * .018, .052, .065, .018, buttonMaterial, parent);
      add(new THREE.SphereGeometry(.045, 12, 8), brass, name + ' tassel knot', [x + .13, lockY - .13, faceZ + faceSign * .02], null, parent);
      for (const offset of [-.025, 0, .025]) add(new THREE.CylinderGeometry(.006, .011, .20, 7), brass, name + ' tassel cord', [x + .13 + offset, lockY - .245, faceZ + faceSign * .02], null, parent);
    } else {
      const faceX = x + faceSign * (width / 2 + .018);
      box(name + ' brass lock plate', faceX, lockY, z, .025, .17, .25, brass, parent);
      box(name + ' keyhole', faceX + faceSign * .018, lockY, z, .018, .065, .052, buttonMaterial, parent);
      add(new THREE.SphereGeometry(.045, 12, 8), brass, name + ' tassel knot', [faceX + faceSign * .02, lockY - .13, z + .13], null, parent);
      for (const offset of [-.025, 0, .025]) add(new THREE.CylinderGeometry(.006, .011, .20, 7), brass, name + ' tassel cord', [faceX + faceSign * .02, lockY - .245, z + .13 + offset], null, parent);
    }
  };
  const roundedPanel = (name, x, y, z, width, height, depth, radius, value, rotation = null, parent = group) => {
    const shape = new THREE.Shape();
    const left = -width / 2;
    const bottom = -height / 2;
    const right = width / 2;
    const top = height / 2;
    shape.moveTo(left + radius, bottom);
    shape.lineTo(right - radius, bottom);
    shape.quadraticCurveTo(right, bottom, right, bottom + radius);
    shape.lineTo(right, top - radius);
    shape.quadraticCurveTo(right, top, right - radius, top);
    shape.lineTo(left + radius, top);
    shape.quadraticCurveTo(left, top, left, top - radius);
    shape.lineTo(left, bottom + radius);
    shape.quadraticCurveTo(left, bottom, left + radius, bottom);
    const bevel = Math.min(radius * .38, depth * .22);
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: Math.max(.015, depth - bevel * 2),
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: bevel,
      bevelThickness: bevel,
      curveSegments: 5,
      steps: 1
    });
    geometry.translate(0, 0, -depth / 2);
    return add(geometry, value, name, [x, y, z], rotation, parent);
  };
  const rail = (name, x, y, z, length, parent = group) =>
    add(new THREE.CylinderGeometry(.035, .035, length, 16), brass, name, [x, y, z], [0, 0, Math.PI / 2], parent);

  box('Herringbone floor', 0, -.08, .15, 15.2, .16, 13.9, floor);
  roundedPanel('Large dark grey island rug', 0, .018, .85, 7.0, 3.62, .035, .09, charcoalRug, [Math.PI / 2, 0, 0]);
  roundedPanel('Small burgundy doorway rug', 0, .021, 5.35, 3.25, 1.22, .04, .08, burgundyRug, [Math.PI / 2, 0, 0]);
  box('Back wall', 0, 2.3, -6.72, 15.2, 4.7, .16, wall);
  box('Left wall', -7.52, 2.3, .15, .16, 4.7, 13.9, wall);
  box('Right wall', 7.52, 2.3, .15, .16, 4.7, 13.9, wall);
  box('Front wall left', -5.02, 2.3, 6.98, 5.02, 4.7, .16, wall);
  box('Front wall right', 5.02, 2.3, 6.98, 5.02, 4.7, .16, wall);
  box('Front wall over doors', 0, 4.42, 6.98, 5.0, .46, .16, wall);
  box('Ceiling', 0, 4.62, .15, 15.2, .16, 13.9, wall);
  box('Back crown', 0, 4.22, -6.54, 15, .22, .24, trim);
  box('Left crown', -7.34, 4.22, .15, .24, .22, 13.55, trim);
  box('Right crown', 7.34, 4.22, .15, .24, .22, 13.55, trim);
  box('Front crown', 0, 4.22, 6.80, 15.0, .22, .24, trim);
  box('Back baseboard', 0, .17, -6.55, 15.0, .20, .12, wall);
  box('Left baseboard', -7.36, .17, .15, .12, .20, 13.55, wall);
  box('Right baseboard', 7.36, .17, .15, .12, .20, 13.55, wall);
  box('Front baseboard left', -5.02, .17, 6.80, 5.02, .20, .12, wall);
  box('Front baseboard right', 5.02, .17, 6.80, 5.02, .20, .12, wall);

  box('Mirror frame', 0, 2.25, -6.49, 2.05, 4.12, .18, trim);
  const mirrorSurface = roundedPanel('Tall mirror', 0, 2.25, -6.37, 1.78, 3.84, .035, .05, mirrorMaterial);
  box('Mirror highlight', -.49, 2.25, -6.34, .10, 3.55, .015, material('#bcc5c1', { emissive: '#4a4d4b', emissiveIntensity: .18 }), group);
  for (const x of [-7.22, 7.22]) {
    for (const y of [1.1, 2.25, 3.4]) {
      box('Wall moulding', x, y, .3, .025, .035, 8.8, trim);
    }
  }

  const garmentShape = new THREE.Shape();
  garmentShape.moveTo(-.19, .52);
  garmentShape.lineTo(-.42, .35);
  garmentShape.lineTo(-.34, .08);
  garmentShape.lineTo(-.24, .18);
  garmentShape.lineTo(-.23, -.5);
  garmentShape.lineTo(.23, -.5);
  garmentShape.lineTo(.24, .18);
  garmentShape.lineTo(.34, .08);
  garmentShape.lineTo(.42, .35);
  garmentShape.lineTo(.19, .52);
  garmentShape.quadraticCurveTo(0, .38, -.19, .52);

  const bays = [-4.65, -2.55, 2.55, 4.65];
  bays.forEach((x, bayIndex) => {
    const bay = new THREE.Group();
    bay.name = 'Wardrobe bay ' + (bayIndex + 1);
    group.add(bay);
    bay.position.z = -1.87;
    bay.position.x = Math.sign(x) * .68;
    box('Textured matte wardrobe back', x, 2.25, -4.64, 1.88, 4.0, .18, mattePanel, bay);
    box('Wardrobe left stile', x - .93, 2.25, -4.41, .11, 4.08, .42, trim, bay);
    box('Wardrobe right stile', x + .93, 2.25, -4.41, .11, 4.08, .42, trim, bay);
    box('Wardrobe crown', x, 4.2, -4.38, 1.92, .12, .5, trim, bay);
    box('Wardrobe upper shelf', x, 3.38, -4.28, 1.78, .09, .58, cabinetFace, bay);
    box('Wardrobe lower shelf', x, .83, -4.28, 1.78, .11, .62, cabinetFace, bay);
    roundedPanel('Wardrobe drawer', x, .38, -4.24, 1.72, .66, .12, .055, cabinetFace, null, bay);
    roundedPanel('Drawer inset', x, .38, -4.16, 1.46, .43, .035, .04, darkWood, null, bay);
    box('Drawer pull', x, .47, -4.10, .28, .035, .035, brass, bay);
    rail('Clothes rail', x, 2.83, -4.18, 1.62, bay);
    for (let index = 0; index < 5; index++) {
      const geometry = new THREE.ExtrudeGeometry(garmentShape, {
        depth: .075,
        bevelEnabled: true,
        bevelSegments: 2,
        bevelSize: .022,
        bevelThickness: .016,
        curveSegments: 5
      });
      geometry.translate(0, 0, -.038);
      const garmentX = x - .62 + index * .31;
      const styleIndex = (bayIndex * 5 + index) % hangingGarmentSpecs.length;
      const garment = add(
        geometry,
        cloth[styleIndex % cloth.length],
        'Dimensional hanging garment backing',
        [garmentX, 2.20 - (index % 2) * .025, -4.11 + index * .008],
        [0, (index - 2) * .035, 0],
        bay
      );
      garment.scale.set(.74, 1.15, 1);
      const garmentFace = add(
        new THREE.PlaneGeometry(.83, 1.18),
        hangingGarmentFaces[styleIndex],
        'Generated ' + hangingGarmentSpecs[styleIndex][0] + ' surface',
        [garmentX, 2.20 - (index % 2) * .025, -4.015 + index * .008],
        [0, (index - 2) * .035, 0],
        bay
      );
      garmentFace.renderOrder = 2;
      const hangerGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(garmentX - .29, 2.69, -4.03), new THREE.Vector3(garmentX, 2.82, -4.03),
        new THREE.Vector3(garmentX, 2.82, -4.03), new THREE.Vector3(garmentX + .29, 2.69, -4.03),
        new THREE.Vector3(garmentX, 2.82, -4.03), new THREE.Vector3(garmentX + .07, 2.95, -4.03)
      ]);
      resources.geometries.add(hangerGeometry);
      const hangerMaterial = new THREE.LineBasicMaterial({ color: '#c9a77c', transparent: false, opacity: .92 });
      resources.materials.add(hangerMaterial);
      bay.add(new THREE.LineSegments(hangerGeometry, hangerMaterial));
    }
    for (let stack = 0; stack < 3; stack++) {
      const stackX = x - .49 + stack * .49;
      const stackY = .95 + (stack % 2) * .08;
      foldedGarment('Complete folded garment', stackX, stackY, -4.02, .39, .12, .43, bayIndex + stack, bay);
    }
    luxuryCase('Travel presentation case', x, 3.655, -4.05, 1.18, .46, .48, bay, 'z', 1);
    box('Shelf light', x, 3.31, -3.96, 1.55, .025, .035, material('#ffd7a5', { emissive: '#ffbe72', emissiveIntensity: 2.4, toneMapped: false }), bay);
  });

  for (const side of [-1, 1]) {
    const x = side * 7.12;
    box('Textured mineral-plaster feature wall', x, 2.22, .15, .28, 3.96, 6.85, featureWall);
    for (const z of [-3.25, -1.95, -.65, .65, 1.95, 3.25, 4.55]) {
      box('Side shelf', x - side * .32, 1.0, z, .68, .08, 1.08, trim);
      box('Side shelf top', x - side * .32, 2.04, z, .68, .08, 1.08, trim);
      const stackX = x - side * .36;
      foldedGarment('Complete side folded garment', stackX, 1.12, z, .46, .16, .62, Math.abs(Math.round(z * 2)));
      const boxX = x - side * .35;
      luxuryCase('Side walnut presentation case', boxX, 2.28, z, .50, .40, .59, group, 'x', -side);
    }
  }

  const frontBay = (x, index) => {
    box('Textured matte front wardrobe back', x, 2.18, 6.57, 1.55, 4.12, .18, mattePanel);
    box('Front wardrobe left stile', x - .76, 2.18, 6.33, .10, 4.18, .42, trim);
    box('Front wardrobe right stile', x + .76, 2.18, 6.33, .10, 4.18, .42, trim);
    box('Front wardrobe crown', x, 4.18, 6.33, 1.60, .12, .45, trim);
    for (const y of [1.05, 1.72, 2.39, 3.06]) {
      box('Front wardrobe shelf', x, y, 6.33, 1.42, .075, .52, cabinetFace);
    }
    for (let drawer = 0; drawer < 2; drawer++) {
      roundedPanel('Front wardrobe drawer', x, .38 + drawer * .36, 6.17, 1.38, .29, .10, .04, cabinetFace);
      box('Front drawer pull', x, .43 + drawer * .36, 6.095, .30, .03, .03, brass);
    }
    for (let stack = 0; stack < 3; stack++) {
      const stackX = x - .36 + stack * .36;
      const stackY = 1.16 + (stack % 2) * .04;
      foldedGarment('Complete front folded garment', stackX, stackY, 6.03, .30, .12, .36, index + stack);
    }
    for (let shoeIndex = 0; shoeIndex < 2; shoeIndex++) {
      const shoe = add(
        new THREE.SphereGeometry(.22, 14, 8),
        cloth[(index + shoeIndex + 2) % cloth.length],
        'Front display shoe',
        [x - .3 + shoeIndex * .55, 2.52, 6.03]
      );
      shoe.scale.set(1.2, .43, .62);
    }
    luxuryCase('Front walnut presentation case', x, 3.272, 6.06, .92, .35, .38, group, 'z', -1);
    box('Front shelf light', x, 3.83, 6.02, 1.18, .022, .035, material('#ffd7a5', { emissive: '#ffbe72', emissiveIntensity: 2.2, toneMapped: false }));
  };
  [-6.03, -4.35, 4.35, 6.03].forEach(frontBay);
  box('Unified grand doorway header', 0, 4.18, 6.77, 4.70, .26, .32, trim);
  box('Unified grand doorway left frame', -2.30, 2.10, 6.48, .18, 4.05, .32, trim);
  box('Unified grand doorway right frame', 2.30, 2.10, 6.48, .18, 4.05, .32, trim);
  const grandDoorMaterial = material('#49362e', { map: surfaces.wood, roughness: .66, clearcoat: 0, metalness: 0 });
  roundedPanel('One unified grand double door', 0, 2.03, 6.58, 4.38, 3.76, .15, .055, grandDoorMaterial);
  for (const side of [-1, 1]) {
    const doorX = side * 1.08;
    for (const y of [1.15, 2.12, 3.14]) {
      roundedPanel('Grand door inset panel', doorX, y, 6.485, 1.72, .63, .026, .04, darkWood);
    }
    add(new THREE.SphereGeometry(.06, 16, 12), brass, 'Grand door knob', [side * .18, 2.02, 6.38]);
  }
  box('Single grand door center seam', 0, 2.03, 6.45, .045, 3.69, .025, trim);

  roundedPanel('Closet island base', 0, .52, .85, 4.75, 1.04, 2.05, .12, darkWood);
  roundedPanel('Closet island top', 0, 1.08, .85, 5.0, 2.25, .16, .12, marble, [Math.PI / 2, 0, 0]);
  for (const x of [-1.62, -.54, .54, 1.62]) {
    roundedPanel('Island inset panel', x, .54, 1.89, .91, .65, .055, .045, cabinetFace);
    roundedPanel('Island inner panel', x, .54, 1.935, .69, .43, .025, .035, darkWood);
    box('Island handle', x, .66, 1.93, .22, .035, .035, brass);
  }
  const ottomanX = 4.85;
  const ottomanZ = 3.65;
  roundedPanel('Tufted ottoman cushion', ottomanX, .55, ottomanZ, 1.85, .92, .28, .12, ottomanFabric, [Math.PI / 2, 0, 0]);
  roundedPanel('Ottoman upholstered base', ottomanX, .33, ottomanZ, 1.72, .43, .80, .08, ottomanFabric);
  for (const x of [ottomanX - .65, ottomanX + .65]) {
    for (const z of [ottomanZ - .31, ottomanZ + .31]) box('Ottoman leg', x, .12, z, .09, .25, .09, darkWood);
  }
  for (const x of [ottomanX - .40, ottomanX, ottomanX + .40]) {
    for (const z of [ottomanZ - .19, ottomanZ + .19]) {
      add(new THREE.CylinderGeometry(.035, .035, .012, 12), buttonMaterial, 'Ottoman tuft', [x, .705, z], [0, 0, 0]);
    }
  }
  box('Island perfume tray', -.95, 1.18, .70, .75, .035, .48, brass);
  for (const x of [-1.17, -.92, -.70]) {
    add(new THREE.CylinderGeometry(.07, .09, .34 + (x + 1.2) * .18, 18), mirrorMaterial, 'Perfume bottle', [x, 1.39, .70]);
    add(new THREE.CylinderGeometry(.035, .035, .06, 12), brass, 'Perfume cap', [x, 1.59 + (x + 1.2) * .09, .70]);
  }

  const ringMaterial = new THREE.MeshBasicMaterial({ color: '#fff2da', toneMapped: false });
  resources.materials.add(ringMaterial);
  const ringA = add(new THREE.TorusGeometry(1.42, .055, 12, 96), ringMaterial, 'Sculptural ceiling light', [-.62, 4.29, -.38], [Math.PI / 2, 0, .08]);
  ringA.scale.set(1.35, .76, 1);
  const ringB = add(new THREE.TorusGeometry(1.05, .055, 12, 80), ringMaterial, 'Sculptural ceiling light', [1.25, 4.27, -.25], [Math.PI / 2, 0, -.1]);
  ringB.scale.set(1.3, .72, 1);
  for (const x of [-1.35, 0, 1.35]) box('Light suspension', x, 4.48, -.3, .018, .38, .018, brass);

  return { group, mirrorSurface, mirrorMaterial, reflectiveMaterials: [mirrorMaterial, brass, marble, cabinetFace] };
}

function buildElsieCloset(scene, resources) {
  const group = new THREE.Group();
  group.name = 'Elsie blush neoclassical closet';
  scene.add(group);

  const textureLoader = new THREE.TextureLoader();
  const loadTexture = (path, { color = true, repeat = [1, 1] } = {}) => {
    const texture = textureLoader.load(new URL(path, import.meta.url).href);
    if (color) texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(...repeat);
    texture.anisotropy = 8;
    resources.textures.add(texture);
    return texture;
  };
  const marbleMap = loadTexture('./assets/closet/elsie/blush-calacatta-marble-v2.png', { repeat: [1.0, .52] });
  const rugMap = loadTexture('./assets/closet/elsie/ivory-herringbone-rug-v1.png', { repeat: [3.2, 2.35] });
  const accessoryAtlas = loadTexture('./assets/closet/elsie/accessories-atlas-v1.png');
  const vanityAccessoryAtlas = loadTexture('./assets/closet/elsie/vanity-accessories-atlas-v2.png');
  const detailedDressAtlas = loadTexture('./assets/closet/elsie/detailed-dresses-atlas-v1.png');
  const limewashMap = loadTexture('./assets/closet/elsie/warm-limewash-wall-v1.png', { repeat: [2.1, 1.12] });
  const oliveRugMap = loadTexture('./assets/closet/elsie/olive-wool-herringbone-v1.png', { repeat: [1.55, .68] });
  const linenMap = loadTexture('./assets/closet/elsie/off-white-linen-v1.png', { repeat: [7.5, 7.5] });
  const lakesideMap = loadTexture('./assets/closet/elsie/lakeside-window-view-v1.png');
  const wallBump = canvasTexture(resources, 512, (context, size) => {
    context.fillStyle = '#858585';
    context.fillRect(0, 0, size, size);
    for (let y = 0; y < size; y += 5) {
      context.strokeStyle = y % 20 ? 'rgba(150,150,150,.14)' : 'rgba(92,92,92,.12)';
      context.beginPath();
      context.moveTo(0, y);
      context.bezierCurveTo(size * .3, y + 2, size * .7, y - 2, size, y + 1);
      context.stroke();
    }
  }, { color: false, repeat: [3, 2] });
  const oakMap = canvasTexture(resources, 1024, (context, size) => {
    context.fillStyle = '#b98b68';
    context.fillRect(0, 0, size, size);
    for (let row = 0; row < 16; row++) {
      const y = row * 64;
      const offset = row % 2 ? -90 : 0;
      for (let x = offset; x < size; x += 185) {
        const tone = ['#bf916d', '#b48461', '#c79b78', '#aa7958'][(row + Math.floor(x / 185) + 12) % 4];
        context.fillStyle = tone;
        context.fillRect(x + 2, y + 2, 181, 60);
        context.strokeStyle = 'rgba(90,53,35,.26)';
        context.strokeRect(x + 2, y + 2, 181, 60);
        context.strokeStyle = 'rgba(255,229,204,.16)';
        for (let grain = 0; grain < 3; grain++) {
          context.beginPath();
          context.moveTo(x + 12, y + 14 + grain * 14);
          context.bezierCurveTo(x + 60, y + 9 + grain * 15, x + 125, y + 19 + grain * 12, x + 173, y + 13 + grain * 14);
          context.stroke();
        }
      }
    }
  }, { repeat: [2.15, 2.15] });
  const velvetBump = canvasTexture(resources, 256, (context, size) => {
    context.fillStyle = '#777';
    context.fillRect(0, 0, size, size);
    for (let x = 0; x < size; x += 3) {
      context.strokeStyle = x % 9 ? '#858585' : '#696969';
      context.beginPath(); context.moveTo(x, 0); context.lineTo(x + 1, size); context.stroke();
    }
  }, { color: false, repeat: [9, 9] });

  const material = (color, options = {}) => {
    const value = new THREE.MeshPhysicalMaterial({ color, roughness: .74, envMapIntensity: .35, ...options });
    resources.materials.add(value);
    return value;
  };
  const ivory = material('#f5e9e3', { bumpMap: wallBump, bumpScale: .018, roughness: .9, metalness: 0 });
  const insetIvory = material('#ead9d4', { roughness: .84, metalness: 0 });
  const blush = material('#dcbebd', { roughness: .88, sheen: .7, sheenColor: new THREE.Color('#fff0ec'), bumpMap: velvetBump, bumpScale: .018 });
  const rose = material('#c99e9f', { roughness: .82, sheen: .55, sheenColor: new THREE.Color('#ffe8e7') });
  const brass = material('#d1a66a', { roughness: .25, metalness: .82, clearcoat: .42 });
  const paleGold = material('#edd4a1', { roughness: .2, metalness: .62, clearcoat: .5 });
  const marble = material('#fff6f2', { map: marbleMap, bumpMap: marbleMap, bumpScale: .035, roughness: .29, metalness: .03, clearcoat: .52, clearcoatRoughness: .24 });
  const oak = material('#ffffff', { map: oakMap, roughness: .54, clearcoat: .12, clearcoatRoughness: .72 });
  const rug = material('#fffaf2', { map: rugMap, bumpMap: rugMap, bumpScale: .105, roughness: 1, metalness: 0 });
  const limewash = material('#ffffff', { map: limewashMap, bumpMap: limewashMap, bumpScale: .085, roughness: 1, metalness: 0, clearcoat: 0 });
  const oliveRug = material('#ffffff', { map: oliveRugMap, bumpMap: oliveRugMap, bumpScale: .055, roughness: 1, metalness: 0, clearcoat: 0 });
  const curtain = material('#efc4ca', { transparent: true, opacity: .50, depthWrite: false, roughness: .78, sheen: .78, sheenColor: new THREE.Color('#fff0f2'), side: THREE.DoubleSide });
  const sofaFabric = material('#e8dfd1', { map: linenMap, bumpMap: linenMap, bumpScale: .035, roughness: .94, sheen: .24, sheenColor: new THREE.Color('#fff8ed') });
  const candleWax = material('#fff0dc', { roughness: .82, subsurface: 1 });
  const petalMaterials = ['#b75f70', '#cf8290', '#e0a9ae'].map(color => material(color, { roughness: .88, sheen: .38 }));
  const mirrorMaterial = material('#c8d2d4', { roughness: .05, metalness: .96, clearcoat: 1, clearcoatRoughness: .03 });
  const crystal = material('#ffffff', { color: '#fff9f1', transparent: true, opacity: .68, roughness: .05, transmission: .56, thickness: .08, metalness: 0 });
  const lightMaterial = new THREE.MeshBasicMaterial({ color: '#fff0d2', toneMapped: false });
  resources.materials.add(lightMaterial);

  const add = (geometry, value, name, position, rotation = null, parent = group) => {
    resources.geometries.add(geometry);
    const mesh = new THREE.Mesh(geometry, value);
    mesh.name = name;
    mesh.position.set(...position);
    if (rotation) mesh.rotation.set(...rotation);
    mesh.castShadow = !/wall|ceiling|mirror|window|rug|light/i.test(name);
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };
  const box = (name, x, y, z, width, height, depth, value, parent = group) =>
    add(new THREE.BoxGeometry(width, height, depth), value, name, [x, y, z], null, parent);
  const cylinder = (name, x, y, z, top, bottom, height, value, segments = 24, rotation = null, parent = group) =>
    add(new THREE.CylinderGeometry(top, bottom, height, segments), value, name, [x, y, z], rotation, parent);
  const roundedPanel = (name, x, y, z, width, height, depth, radius, value, rotation = null, parent = group) => {
    const shape = new THREE.Shape();
    const left = -width / 2, right = width / 2, bottom = -height / 2, top = height / 2;
    shape.moveTo(left + radius, bottom);
    shape.lineTo(right - radius, bottom); shape.quadraticCurveTo(right, bottom, right, bottom + radius);
    shape.lineTo(right, top - radius); shape.quadraticCurveTo(right, top, right - radius, top);
    shape.lineTo(left + radius, top); shape.quadraticCurveTo(left, top, left, top - radius);
    shape.lineTo(left, bottom + radius); shape.quadraticCurveTo(left, bottom, left + radius, bottom);
    const bevel = Math.min(radius * .38, depth * .22);
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: Math.max(.015, depth - bevel * 2), bevelEnabled: true, bevelSegments: 2,
      bevelSize: bevel, bevelThickness: bevel, curveSegments: 5, steps: 1
    });
    geometry.translate(0, 0, -depth / 2);
    return add(geometry, value, name, [x, y, z], rotation, parent);
  };
  const goldHandle = (name, x, y, z, width, rotation = null, parent = group) => {
    box(name + ' bar', x, y, z, width, .035, .035, brass, parent);
    box(name + ' left mount', x - width * .42, y, z + .025, .035, .10, .045, brass, parent);
    box(name + ' right mount', x + width * .42, y, z + .025, .035, .10, .045, brass, parent);
  };
  const framedPanel = (name, x, y, z, width, height, parent = group) => {
    roundedPanel(name + ' face', x, y, z, width, height, .075, .045, ivory, null, parent);
    box(name + ' inset', x, y, z - .045, width - .18, height - .16, .022, insetIvory, parent);
    for (const dx of [-1, 1]) box(name + ' vertical moulding', x + dx * (width / 2 - .09), y, z - .07, .035, height - .12, .028, paleGold, parent);
    for (const dy of [-1, 1]) box(name + ' horizontal moulding', x, y + dy * (height / 2 - .08), z - .07, width - .16, .035, .028, paleGold, parent);
  };

  box('Elsie warm oak floor', 0, -.08, .15, 16.4, .16, 14.8, oak);
  roundedPanel('Elsie ivory herringbone wool rug', 0, .018, .65, 8.4, 6.15, .055, .10, rug, [Math.PI / 2, 0, 0]);
  box('Elsie back wall', 0, 2.7, -7.12, 16.4, 5.55, .18, ivory);
  box('Elsie textured wall opposite window', -8.12, 2.7, .15, .18, 5.55, 14.8, limewash);
  // Build the textured window wall around a real opening. The panorama sits
  // outside the room, so the fixed mullions reveal natural camera parallax.
  box('Elsie textured window wall rear section', 8.12, 2.7, -4.075, .18, 5.55, 6.35, limewash);
  box('Elsie textured window wall front section', 8.12, 2.7, 4.625, .18, 5.55, 5.85, limewash);
  box('Elsie textured window wall below opening', 8.12, .29, .40, .18, .58, 2.60, limewash);
  box('Elsie textured window wall above opening', 8.12, 5.12, .40, .18, .71, 2.60, limewash);
  box('Elsie front wall left', -5.55, 2.7, 7.46, 5.30, 5.55, .18, ivory);
  box('Elsie front wall right', 5.55, 2.7, 7.46, 5.30, 5.55, .18, ivory);
  box('Elsie front wall over door', 0, 5.02, 7.46, 5.8, .92, .18, ivory);
  box('Elsie ceiling', 0, 5.46, .15, 16.4, .16, 14.8, ivory);
  for (const z of [-6.93, 7.27]) {
    box('Elsie crown lower rail', 0, 5.03, z, 16.1, .16, .20, insetIvory);
    box('Elsie crown upper rail', 0, 5.24, z, 16.2, .14, .30, ivory);
  }
  for (const x of [-7.93, 7.93]) {
    box('Elsie side crown lower rail', x, 5.03, .15, .20, .16, 14.45, insetIvory);
    box('Elsie side crown upper rail', x, 5.24, .15, .30, .14, 14.55, ivory);
  }
  for (const z of [-6.93, 7.27]) box('Elsie baseboard', 0, .18, z, 16.05, .26, .14, insetIvory);
  for (const x of [-7.93, 7.93]) box('Elsie side baseboard', x, .18, .15, .14, .26, 14.45, insetIvory);

  // Symmetrical built-ins, display shelves, hanging gowns, and drawers.
  const displayBay = (x, width, index) => {
    box('Elsie display bay back', x, 2.75, -6.92, width, 4.72, .14, insetIvory);
    box('Elsie display bay left stile', x - width / 2, 2.75, -6.68, .13, 4.95, .48, ivory);
    box('Elsie display bay right stile', x + width / 2, 2.75, -6.68, .13, 4.95, .48, ivory);
    box('Elsie display bay crown', x, 5.12, -6.67, width + .12, .16, .50, ivory);
    for (const y of [1.40, 2.18, 2.96, 3.74, 4.52]) box('Elsie illuminated display shelf', x, y, -6.63, width - .14, .09, .56, ivory);
    for (let drawer = 0; drawer < 3; drawer++) {
      framedPanel('Elsie display drawer', x, .35 + drawer * .32, -6.50, width - .18, .28);
      goldHandle('Elsie display drawer handle', x, .40 + drawer * .32, -6.56, .28);
    }
    const propIndices = [index * 3, index * 3 + 1, index * 3 + 2, (index * 3 + 6) % 9];
    propIndices.forEach((propIndex, shelfIndex) => {
      const map = accessoryAtlas.clone();
      map.repeat.set(1 / 3, 1 / 3);
      map.offset.set((propIndex % 3) / 3, 1 - (Math.floor(propIndex / 3) + 1) / 3);
      map.needsUpdate = true;
      resources.textures.add(map);
      const propMaterial = material('#ffffff', { map, transparent: true, alphaTest: .06, roughness: .72, metalness: 0, side: THREE.DoubleSide });
      const prop = add(new THREE.PlaneGeometry(width * .56, .58), propMaterial, 'Elsie generated shelf accessory', [x, 1.73 + shelfIndex * .78, -6.30]);
      prop.renderOrder = 2;
    });
  };
  displayBay(5.25, 2.35, 0);
  displayBay(2.55, 2.35, 1);
  displayBay(-5.35, 2.35, 2);

  const wardrobe = new THREE.Group();
  wardrobe.name = 'Elsie gown wardrobe';
  group.add(wardrobe);
  box('Elsie gown wardrobe back', -7.76, 2.72, -2.10, .14, 4.90, 4.25, insetIvory, wardrobe);
  for (const z of [-4.10, -.12]) box('Elsie gown wardrobe stile', -7.56, 2.72, z, .48, 4.95, .13, ivory, wardrobe);
  add(new THREE.CylinderGeometry(.035, .035, 3.58, 16), brass, 'Elsie gown rail', [-7.38, 4.25, -2.1], [Math.PI / 2, 0, 0], wardrobe);
  const gownShape = new THREE.Shape();
  gownShape.moveTo(-.18, .82); gownShape.quadraticCurveTo(0, .98, .18, .82);
  gownShape.lineTo(.42, .60); gownShape.lineTo(.26, .43); gownShape.lineTo(.44, -.85);
  gownShape.quadraticCurveTo(0, -.98, -.44, -.85); gownShape.lineTo(-.26, .43);
  gownShape.lineTo(-.42, .60); gownShape.lineTo(-.18, .82);
  const gownMaterials = [blush, rose, ivory, material('#dbc8ba', { roughness: .76, sheen: .6 }), material('#e7d8cf', { roughness: .68, sheen: .72 })];
  const detailedDressMaterials = Array.from({ length: 9 }, (_, index) => {
    const map = detailedDressAtlas.clone();
    map.repeat.set(1 / 3, 1 / 3);
    map.offset.set((index % 3) / 3, 1 - (Math.floor(index / 3) + 1) / 3);
    map.needsUpdate = true;
    resources.textures.add(map);
    return material('#ffffff', {
      map,
      transparent: true,
      alphaTest: .055,
      roughness: .72,
      sheen: .42,
      sheenColor: new THREE.Color('#fff2ee'),
      metalness: 0,
      side: THREE.DoubleSide
    });
  });
  for (let index = 0; index < 7; index++) {
    const geometry = new THREE.ExtrudeGeometry(gownShape, { depth: .08, bevelEnabled: true, bevelSegments: 2, bevelSize: .018, bevelThickness: .018, curveSegments: 6 });
    geometry.translate(0, 0, -.04);
    const gown = add(geometry, gownMaterials[index % gownMaterials.length], 'Elsie dimensional hanging gown', [-7.30, 2.82, -3.42 + index * .44], [0, Math.PI / 2, 0], wardrobe);
    gown.scale.set(.78, 1.34 - index % 2 * .09, 1);
    const face = add(
      new THREE.PlaneGeometry(.94, 2.08),
      detailedDressMaterials[index],
      'Elsie generated detailed hanging garment',
      [-7.225, 2.82, -3.42 + index * .44],
      [0, Math.PI / 2, 0],
      wardrobe
    );
    face.renderOrder = 3;
  }

  // Hollywood vanity and softly illuminated mirror.
  roundedPanel('Elsie vanity desk', -1.60, .83, -6.28, 3.20, .22, .72, .08, marble);
  for (const x of [-2.90, -.30]) box('Elsie vanity pedestal', x, .43, -6.46, .52, .72, .52, ivory);
  for (const x of [-2.90, -.30]) {
    for (const y of [.25, .53]) {
      framedPanel('Elsie vanity drawer', x, y, -6.14, .46, .24);
      goldHandle('Elsie vanity handle', x, y + .04, -6.19, .18);
    }
  }
  roundedPanel('Elsie vanity mirror frame', -1.60, 3.15, -6.78, 3.35, 3.55, .16, .08, ivory);
  const mirrorSurface = roundedPanel('Elsie vanity mirror', -1.60, 3.15, -6.64, 2.88, 3.08, .035, .06, mirrorMaterial);
  const bulbPositions = [];
  for (let index = 0; index < 8; index++) {
    const x = -2.93 + index * .38;
    bulbPositions.push([x, 1.66], [x, 4.64]);
  }
  for (let index = 1; index < 7; index++) {
    const y = 1.66 + index * .43;
    bulbPositions.push([-2.98, y], [-.22, y]);
  }
  bulbPositions.forEach(([x, y]) => add(new THREE.SphereGeometry(.055, 12, 9), lightMaterial, 'Elsie vanity bulb', [x, y, -6.47]));
  for (const x of [-2.20, -.98]) {
    roundedPanel('Elsie vanity chair back', x, .98, -5.38, .86, 1.02, .18, .20, blush);
    cylinder('Elsie vanity chair seat', x, .48, -5.38, .43, .43, .16, blush, 28);
    for (const dx of [-.26, .26]) for (const dz of [-.24, .24]) cylinder('Elsie vanity chair leg', x + dx, .24, -5.38 + dz, .025, .035, .48, paleGold, 10);
  }

  // Tall arched daylight window on the right wall.
  const windowShape = new THREE.Shape();
  windowShape.moveTo(-1.30, 0); windowShape.lineTo(1.30, 0); windowShape.lineTo(1.30, 2.55);
  windowShape.bezierCurveTo(1.30, 3.42, .72, 4.05, 0, 4.18);
  windowShape.bezierCurveTo(-.72, 4.05, -1.30, 3.42, -1.30, 2.55); windowShape.lineTo(-1.30, 0);
  lakesideMap.wrapS = lakesideMap.wrapT = THREE.ClampToEdgeWrapping;
  lakesideMap.needsUpdate = true;
  const panoramaMaterial = new THREE.MeshBasicMaterial({ map: lakesideMap, side: THREE.DoubleSide, fog: false });
  panoramaMaterial.name = 'Elsie unlit lakeside panorama material';
  panoramaMaterial.toneMapped = false;
  resources.materials.add(panoramaMaterial);
  add(new THREE.PlaneGeometry(8.8, 7.6), panoramaMaterial, 'Elsie distant lakeside panorama with natural parallax', [11.60, 2.70, .40], [0, -Math.PI / 2, 0]);
  const windowGlass = material('#e8f6f5', { transparent: true, opacity: .09, depthWrite: false, roughness: .08, metalness: 0, side: THREE.DoubleSide });
  add(new THREE.ShapeGeometry(windowShape, 22), windowGlass, 'Elsie clear arched window glass', [7.99, .58, .40], [0, -Math.PI / 2, 0]);
  for (const z of [-.90, -.05, .80, 1.70]) box('Elsie window mullion', 7.86, 2.34, z, .12, 3.34, .055, ivory);
  for (const y of [1.32, 2.10, 2.88]) box('Elsie window crossbar', 7.86, y, .40, .12, .08, 2.55, ivory);
  box('Elsie window sill', 7.72, .54, .40, .52, .18, 3.16, marble);
  for (const z of [-2.55, 3.35]) box('Elsie window fluted surround', 7.72, 2.65, z, .52, 4.60, .22, ivory);
  cylinder('Elsie champagne curtain rod', 7.57, 4.88, .40, .045, .045, 3.85, brass, 18, [Math.PI / 2, 0, 0]);
  for (const [name, z, width, gather] of [
    ['left', -1.55, 1.62, .52],
    ['right', 2.35, 1.62, -.52]
  ]) {
    const geometry = new THREE.PlaneGeometry(width, 4.55, 22, 18);
    const positions = geometry.attributes.position;
    for (let index = 0; index < positions.count; index++) {
      const localX = positions.getX(index);
      const localY = positions.getY(index);
      const wave = Math.sin((localX / width + .5) * Math.PI * 7) * .075;
      const pooling = Math.max(0, -localY - 1.72) * .055;
      positions.setZ(index, wave + pooling);
      positions.setX(index, localX * (1 - Math.max(0, localY + 1.20) * .035) + gather * Math.max(0, 1 - Math.abs(localY) / 2.3) * .10);
    }
    positions.needsUpdate = true;
    geometry.computeVertexNormals();
    add(geometry, curtain, 'Elsie sheer blush curtain ' + name, [7.53, 2.57, z], [0, -Math.PI / 2, 0]);
  }
  for (const z of [-1.32, 2.12]) add(new THREE.TorusGeometry(.13, .022, 8, 24), paleGold, 'Elsie curtain tieback', [7.40, 2.18, z], [0, Math.PI / 2, 0]);

  const sofa = new THREE.Group();
  sofa.name = 'Elsie off-white linen window sofa';
  sofa.position.set(6.30, 0, -3.72);
  sofa.rotation.y = -.10;
  group.add(sofa);
  roundedPanel('Elsie sofa seat', 0, .48, 0, .98, 2.82, .34, .13, sofaFabric, [Math.PI / 2, 0, 0], sofa);
  roundedPanel('Elsie sofa back', .39, 1.02, 0, .28, 1.18, 2.72, .14, sofaFabric, null, sofa);
  for (const z of [-1.18, 1.18]) roundedPanel('Elsie sofa arm', .02, .77, z, .82, .62, .36, .14, sofaFabric, [0, Math.PI / 2, 0], sofa);
  for (const [index, z] of [-.70, .02, .74].entries()) {
    const tilt = index === 1 ? -.10 : (index === 0 ? -.16 : -.04);
    roundedPanel('Elsie sofa linen cushion leaning into back', .15, .92, z, .68, .76, .18, .11, sofaFabric, [0, Math.PI / 2, tilt], sofa);
  }
  for (const z of [-1.03, 1.03]) cylinder('Elsie sofa gold foot', 0, .16, z, .055, .07, .30, paleGold, 12, null, sofa);

  // Central marble-topped drawer island.
  roundedPanel('Elsie central island base', 0, .60, .75, 5.45, 1.20, 2.55, .10, ivory);
  roundedPanel('Elsie central marble top', 0, 1.24, .75, 5.72, 2.80, .20, .10, marble, [Math.PI / 2, 0, 0]);
  for (const side of [-1, 1]) {
    for (let column = 0; column < 3; column++) {
      const x = -1.74 + column * 1.74;
      framedPanel('Elsie island drawer', x, .63, .75 + side * 1.30, 1.52, .78);
      goldHandle('Elsie island drawer handle', x, .76, .75 + side * 1.345, .40);
    }
  }
  cylinder('Elsie round golden candle tray', 0, 1.40, .75, .92, .92, .065, paleGold, 48);
  add(new THREE.TorusGeometry(.80, .035, 10, 64), brass, 'Elsie candle tray rim', [0, 1.445, .75], [Math.PI / 2, 0, 0]);
  const wickMaterial = material('#42342f', { roughness: 1, metalness: 0 });
  [
    [-.34, .78, .48, .17],
    [.02, .86, .67, .20],
    [.38, .70, .38, .15]
  ].forEach(([x, z, height, radius], index) => {
    cylinder('Elsie cylindrical candle ' + (index + 1), x, 1.45 + height / 2, z, radius, radius, height, candleWax, 28);
    cylinder('Elsie candle wick ' + (index + 1), x, 1.47 + height, z, .009, .009, .07, wickMaterial, 8);
    add(new THREE.SphereGeometry(.035, 10, 8), lightMaterial, 'Elsie candle flame ' + (index + 1), [x, 1.535 + height, z]);
  });
  [
    [-.67, .53, .20], [-.55, 1.02, -.35], [-.18, .37, .65],
    [.25, .43, -.15], [.58, 1.04, .38], [.70, .62, -.52],
    [.12, 1.17, .82], [-.25, 1.20, -.72]
  ].forEach(([x, z, angle], index) => {
    const petal = add(new THREE.SphereGeometry(.095, 12, 8), petalMaterials[index % petalMaterials.length], 'Elsie scattered rose petal', [x, 1.49, z], [0, angle, 0]);
    petal.scale.set(1.0, .10, .48);
  });

  // Two tufted blush ottomans kept clear of the main walking aisle.
  for (const [x, z] of [[2.75, 4.20], [4.55, 4.20]]) {
    cylinder('Elsie blush ottoman cushion', x, .62, z, .73, .73, .64, blush, 40);
    cylinder('Elsie ottoman gold plinth', x, .20, z, .73, .75, .20, brass, 40);
    add(new THREE.TorusGeometry(.52, .018, 8, 48), rose, 'Elsie ottoman tuft ring', [x, .945, z], [Math.PI / 2, 0, 0]);
    for (let index = 0; index < 8; index++) {
      const angle = index * Math.PI / 4;
      cylinder('Elsie ottoman tuft button', x + Math.cos(angle) * .31, .955, z + Math.sin(angle) * .31, .025, .025, .018, paleGold, 10);
    }
    cylinder('Elsie ottoman center button', x, .96, z, .03, .03, .018, paleGold, 10);
  }

  // Ornate ceiling medallion and crystal chandelier.
  add(new THREE.CylinderGeometry(1.22, 1.22, .06, 64), ivory, 'Elsie ornate ceiling medallion', [0, 5.34, -.40]);
  add(new THREE.TorusGeometry(.92, .08, 12, 72), insetIvory, 'Elsie ceiling medallion ring', [0, 5.28, -.40], [Math.PI / 2, 0, 0]);
  cylinder('Elsie chandelier suspension', 0, 4.72, -.40, .035, .035, 1.10, brass, 16);
  cylinder('Elsie chandelier crown', 0, 4.18, -.40, .18, .28, .28, brass, 20);
  for (const radius of [.58, 1.02]) {
    add(new THREE.TorusGeometry(radius, .025, 8, 72), brass, 'Elsie chandelier gold ring', [0, 3.82 - radius * .16, -.40], [Math.PI / 2, 0, 0]);
    const count = radius < .8 ? 8 : 14;
    for (let index = 0; index < count; index++) {
      const angle = index * Math.PI * 2 / count;
      const x = Math.cos(angle) * radius, z = -.40 + Math.sin(angle) * radius;
      cylinder('Elsie chandelier candle', x, 3.88 - radius * .12, z, .025, .025, .42, brass, 8);
      add(new THREE.SphereGeometry(.055, 10, 8), lightMaterial, 'Elsie chandelier flame', [x, 4.12 - radius * .12, z]);
      add(new THREE.OctahedronGeometry(.075, 0), crystal, 'Elsie chandelier crystal', [x, 3.48 - (index % 3) * .08, z]);
    }
  }
  for (let index = 0; index < 18; index++) {
    const angle = index * Math.PI * 2 / 18;
    const radius = .34 + (index % 3) * .18;
    add(new THREE.OctahedronGeometry(.065, 0), crystal, 'Elsie chandelier crystal drop', [Math.cos(angle) * radius, 3.20 - (index % 4) * .10, -.40 + Math.sin(angle) * radius]);
  }

  // Closed grand double doors matching the pale neoclassical cabinetry.
  roundedPanel('Elsie unified grand double door', 0, 2.45, 7.35, 5.35, 4.55, .16, .06, ivory);
  for (const side of [-1, 1]) {
    for (const y of [1.40, 2.72, 4.02]) framedPanel('Elsie grand door panel', side * 1.30, y, 7.22, 2.20, .95);
    add(new THREE.SphereGeometry(.065, 16, 10), brass, 'Elsie grand door knob', [side * .18, 2.48, 7.08]);
  }
  box('Elsie grand door center seam', 0, 2.45, 7.16, .038, 4.42, .025, paleGold);
  const doorwayWardrobe = side => {
    const center = side * 5.46;
    const width = 4.38;
    box('Elsie doorway wardrobe back', center, 2.65, 7.23, width, 5.05, .14, insetIvory);
    for (const x of [center - width / 2, center, center + width / 2]) {
      box('Elsie doorway wardrobe stile', x, 2.65, 6.98, .12, 5.12, .48, ivory);
    }
    box('Elsie doorway wardrobe crown', center, 5.14, 6.98, width + .14, .18, .50, ivory);
    for (const y of [1.38, 2.22, 3.06, 3.90, 4.72]) {
      box('Elsie doorway wardrobe shelf', center, y, 6.94, width - .18, .085, .56, ivory);
    }
    for (const column of [-1, 1]) {
      const x = center + column * 1.07;
      for (let drawer = 0; drawer < 3; drawer++) {
        framedPanel('Elsie doorway wardrobe drawer', x, .33 + drawer * .31, 6.82, 1.95, .27);
        goldHandle('Elsie doorway wardrobe drawer handle', x, .38 + drawer * .31, 6.76, .27);
      }
      for (let item = 0; item < 4; item++) {
        const atlasIndex = (side < 0 ? 0 : 8) + (column < 0 ? 0 : 4) + item;
        const map = vanityAccessoryAtlas.clone();
        map.repeat.set(1 / 4, 1 / 4);
        map.offset.set((atlasIndex % 4) / 4, 1 - (Math.floor(atlasIndex / 4) + 1) / 4);
        map.needsUpdate = true;
        resources.textures.add(map);
        const propMaterial = material('#ffffff', { map, transparent: true, alphaTest: .06, roughness: .72, side: THREE.DoubleSide });
        const prop = add(new THREE.PlaneGeometry(1.02, .66), propMaterial, 'Elsie doorway lipstick perfume or elegant hat', [x, 1.73 + item * .84, 6.61]);
        prop.renderOrder = 3;
      }
    }
  };
  doorwayWardrobe(-1);
  doorwayWardrobe(1);
  roundedPanel('Elsie olive wool doorway rug', 0, .024, 5.72, 3.85, 1.42, .045, .08, oliveRug, [Math.PI / 2, 0, 0]);

  return {
    group,
    mirrorSurface,
    reflectiveMaterials: [mirrorMaterial, brass, paleGold, marble],
    profile: {
      background: '#f1e5df',
      fog: '#f1e5df',
      fogDensity: .006,
      exposure: 1.18,
      start: [-3.55, .18, 1.20],
      target: [-.30, 1.65, .25],
      reset: { yaw: .08, pitch: .22, distance: 12.4 },
      camera: { minX: -7.45, maxX: 7.45, minY: .68, maxY: 5.05, minZ: -6.25, maxZ: 7.05 },
      pan: { minX: -3.8, maxX: 3.8, minY: .82, maxY: 2.72 },
      zoom: { min: 4.8, max: 14.4 },
      walk: { minX: -7.05, maxX: 7.05, minZ: -5.85, maxZ: 6.35 },
      obstacles: [
        { minX: -3.12, maxX: 3.12, minZ: -.78, maxZ: 2.28 },
        { minX: 1.82, maxX: 5.38, minZ: 3.33, maxZ: 5.05 },
        { minX: 5.35, maxX: 7.05, minZ: -5.20, maxZ: -2.18 },
        { minX: -3.45, maxX: .20, minZ: -6.30, maxZ: -5.00 }
      ],
      reflection: [0, 2.75, -4.65]
    }
  };
}

function mountCloset(root, character, signal) {
  const resources = { geometries: new Set(), materials: new Set(), textures: new Set(), renderTargets: new Set() };
  const isElsie = character === 'elsie';
  const roomSettings = isElsie ? {
    background: '#f1e5df', fogDensity: .006, exposure: 1.18,
    start: [-3.55, .18, 1.20], target: [-.30, 1.65, .25],
    reset: { yaw: .08, pitch: .22, distance: 12.4 },
    camera: { minX: -7.45, maxX: 7.45, minY: .68, maxY: 5.05, minZ: -6.25, maxZ: 7.05 },
    pan: { minX: -3.8, maxX: 3.8, minY: .82, maxY: 2.72 },
    zoom: { min: 4.8, max: 14.4 },
    walk: { minX: -7.05, maxX: 7.05, minZ: -5.85, maxZ: 6.35 },
    obstacles: [
      { minX: -3.12, maxX: 3.12, minZ: -.78, maxZ: 2.28 },
      { minX: 1.82, maxX: 5.38, minZ: 3.33, maxZ: 5.05 },
      { minX: 5.35, maxX: 7.05, minZ: -5.20, maxZ: -2.18 },
      { minX: -3.45, maxX: .20, minZ: -6.30, maxZ: -5.00 }
    ],
    reflection: [0, 2.75, -4.65]
  } : {
    background: '#171719', fogDensity: .014, exposure: 1.08,
    start: [0, .18, 2.30], target: [0, 1.45, .30],
    reset: { yaw: 0, pitch: .10, distance: 9.7 },
    camera: { minX: -6.85, maxX: 6.85, minY: .68, maxY: 4.18, minZ: -5.65, maxZ: 6.05 },
    pan: { minX: -3.1, maxX: 3.1, minY: .85, maxY: 2.4 },
    zoom: { min: 4.6, max: 13.4 },
    walk: { minX: -6.55, maxX: 6.55, minZ: -5.25, maxZ: 5.95 },
    obstacles: [
      { minX: -2.88, maxX: 2.88, minZ: -.52, maxZ: 2.30 },
      { minX: 3.62, maxX: 6.08, minZ: 2.92, maxZ: 4.42 }
    ],
    reflection: [0, 2.22, -3.9]
  };
  let disposed = false;
  let frame = 0;
  let actor = null;
  let elapsed = 0;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(roomSettings.background);
  scene.fog = new THREE.FogExp2(roomSettings.background, roomSettings.fogDensity);
  const camera = new THREE.PerspectiveCamera(42, 1, .08, 70);
  const target = new THREE.Vector3(...roomSettings.target);
  let yaw = roomSettings.reset.yaw;
  let pitch = roomSettings.reset.pitch;
  let distance = roomSettings.reset.distance;
  let actorFacingYaw = 0;
  const movementKeys = new Set();
  const movementDirection = new THREE.Vector3();
  const movementForward = new THREE.Vector3();
  const movementRight = new THREE.Vector3();

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = roomSettings.exposure;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  root.append(renderer.domElement);
  const canvas = renderer.domElement;
  canvas.tabIndex = 0;
  canvas.style.touchAction = 'none';
  canvas.setAttribute('aria-label', `Interactive 3D closet for ${isElsie ? 'Elsie' : 'Eddy'}. Use W A S D to move, drag to look around, and scroll or pinch to zoom.`);

  const orbit = () => {
    const horizontal = Math.cos(pitch) * distance;
    camera.position.set(
      target.x + Math.sin(yaw) * horizontal,
      target.y + Math.sin(pitch) * distance,
      target.z + Math.cos(yaw) * horizontal
    );
    camera.position.x = clamp(camera.position.x, roomSettings.camera.minX, roomSettings.camera.maxX);
    camera.position.y = clamp(camera.position.y, roomSettings.camera.minY, roomSettings.camera.maxY);
    camera.position.z = clamp(camera.position.z, roomSettings.camera.minZ, roomSettings.camera.maxZ);
    camera.lookAt(target);
  };
  orbit();

  scene.add(new THREE.HemisphereLight(isElsie ? 0xfffbf7 : 0xe4e7ec, isElsie ? 0xb88876 : 0x2b1b14, isElsie ? 1.20 : .82));
  scene.add(new THREE.AmbientLight(isElsie ? 0xffe9df : 0x8b7969, isElsie ? .54 : .30));
  const key = new THREE.SpotLight(isElsie ? 0xfff4e6 : 0xffe2bd, isElsie ? 76 : 54, 20, Math.PI / 4.7, .62, 1.18);
  key.position.set(0, isElsie ? 5.10 : 4.25, 2.4);
  key.target.position.set(0, 1.15, -.9);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.bias = -.00025;
  key.shadow.normalBias = .035;
  scene.add(key, key.target);
  const leftGlow = new THREE.PointLight(isElsie ? 0xffd8cf : 0xe4a26f, isElsie ? 27 : 20, 8.5, 1.7);
  leftGlow.position.set(-4.6, isElsie ? 3.1 : 2.25, -.8);
  const rightGlow = new THREE.PointLight(isElsie ? 0xfff8e9 : 0xb6c8df, isElsie ? 35 : 14, 9, 1.8);
  rightGlow.position.set(isElsie ? 6.5 : 4.7, isElsie ? 2.8 : 2.1, -.4);
  const frontGlow = new THREE.PointLight(isElsie ? 0xffd5c7 : 0xffbd80, isElsie ? 19 : 13, 7.8, 1.7);
  frontGlow.position.set(0, isElsie ? 3.8 : 3.15, 3.9);
  scene.add(leftGlow, rightGlow, frontGlow);

  const environment = isElsie ? buildElsieCloset(scene, resources) : buildCloset(scene, resources);
  batchClosetSurfaces(scene, environment.group, resources, environment.mirrorSurface);
  const plinthMaterial = new THREE.MeshStandardMaterial({ color: isElsie ? '#d6af91' : '#312823', roughness: .55, metalness: isElsie ? .36 : .12 });
  resources.materials.add(plinthMaterial);
  const plinthGeometry = new THREE.CylinderGeometry(.74, .82, .14, 48);
  resources.geometries.add(plinthGeometry);
  const plinth = new THREE.Mesh(plinthGeometry, plinthMaterial);
  plinth.position.set(roomSettings.start[0], .07, roomSettings.start[2]);
  plinth.receiveShadow = true;
  plinth.castShadow = true;
  scene.add(plinth);

  const mascots = new MascotCharacters();
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const loading = root.closest('.expression-closet')?.querySelector('[data-closet-loading]');
  mascots.create(character, 'standing').then(created => {
    if (!created || disposed || signal.aborted) return;
    actor = created;
    actor.mesh.position.set(...roomSettings.start);
    canvas.dataset.actorPosition = roomSettings.start[0] + ',' + roomSettings.start[2];
    scene.add(actor.mesh);
    if (loading) loading.hidden = true;
  }).catch(() => {
    if (loading) loading.textContent = `${isElsie ? 'Elsie' : 'Eddy'} could not load, but you can still explore the closet.`;
  });

  const dialog = root.closest('.expression-closet');
  const controls = dialog?.querySelector('.expression-closet-controls');
  const zoom = amount => {
    distance = clamp(distance + amount, roomSettings.zoom.min, roomSettings.zoom.max);
    orbit();
  };
  const reset = () => {
    yaw = roomSettings.reset.yaw;
    pitch = roomSettings.reset.pitch;
    distance = roomSettings.reset.distance;
    target.set(actor?.mesh.position.x ?? roomSettings.target[0], roomSettings.target[1], actor?.mesh.position.z ?? roomSettings.target[2]);
    orbit();
  };
  controls?.addEventListener('click', event => {
    const action = event.target.closest('[data-closet-camera]')?.dataset.closetCamera;
    if (action === 'left') yaw -= .22;
    if (action === 'right') yaw += .22;
    if (action === 'in') zoom(-.7);
    if (action === 'out') zoom(.7);
    if (action === 'reset') reset();
    orbit();
  }, { signal });

  const pointers = new Map();
  let drag = null;
  let pinch = 0;
  canvas.addEventListener('pointerdown', event => {
    canvas.focus({ preventScroll: true });
    canvas.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    drag = { x: event.clientX, y: event.clientY, lastX: event.clientX, lastY: event.clientY };
    if (pointers.size === 2) {
      const [first, second] = [...pointers.values()];
      pinch = Math.hypot(first.x - second.x, first.y - second.y);
    }
  }, { signal });
  canvas.addEventListener('pointermove', event => {
    if (!drag || !pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size === 2) {
      const [first, second] = [...pointers.values()];
      const next = Math.hypot(first.x - second.x, first.y - second.y);
      zoom((pinch - next) * .018);
      pinch = next;
      return;
    }
    const dx = event.clientX - drag.lastX;
    const dy = event.clientY - drag.lastY;
    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
    if (event.shiftKey || event.buttons === 2) {
      target.x = clamp(target.x - dx * .006, roomSettings.pan.minX, roomSettings.pan.maxX);
      target.y = clamp(target.y + dy * .006, roomSettings.pan.minY, roomSettings.pan.maxY);
    } else {
      yaw -= dx * .0045;
      pitch = clamp(pitch + dy * .004, -.06, .46);
    }
    orbit();
  }, { signal });
  const releasePointer = event => {
    pointers.delete(event.pointerId);
    if (!pointers.size) drag = null;
  };
  canvas.addEventListener('pointerup', releasePointer, { signal });
  canvas.addEventListener('pointercancel', releasePointer, { signal });
  canvas.addEventListener('contextmenu', event => event.preventDefault(), { signal });
  canvas.addEventListener('wheel', event => {
    event.preventDefault();
    zoom(Math.sign(event.deltaY) * .58);
  }, { passive: false, signal });
  canvas.addEventListener('keydown', event => {
    if (['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(event.code)) {
      movementKeys.add(event.code);
      event.preventDefault();
      return;
    }
    if (event.key === 'ArrowLeft') yaw -= .1;
    else if (event.key === 'ArrowRight') yaw += .1;
    else if (event.key === 'ArrowUp') zoom(-.3);
    else if (event.key === 'ArrowDown') zoom(.3);
    else return;
    event.preventDefault();
    orbit();
  }, { signal });
  window.addEventListener('keyup', event => {
    movementKeys.delete(event.code);
  }, { signal });
  window.addEventListener('blur', () => movementKeys.clear(), { signal });

  const resize = () => {
    const width = root.clientWidth || 800;
    const compact = width < 650;
    const minimumHeight = compact ? 300 : 390;
    const maximumHeight = Math.min(690, Math.max(minimumHeight, innerHeight - (compact ? 190 : 220)));
    const height = clamp(width * .59, minimumHeight, maximumHeight);
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.fov = clamp(46 / Math.max(.8, camera.aspect / 1.45), 36, 56);
    camera.updateProjectionMatrix();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(root);
  resize();
  const cubeTarget = new THREE.WebGLCubeRenderTarget(256, {
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter
  });
  resources.renderTargets.add(cubeTarget);
  const reflectionCamera = new THREE.CubeCamera(.15, 24, cubeTarget);
  reflectionCamera.position.set(...roomSettings.reflection);
  scene.add(reflectionCamera);
  environment.mirrorSurface.visible = false;
  reflectionCamera.update(renderer, scene);
  environment.mirrorSurface.visible = true;
  scene.remove(reflectionCamera);
  for (const value of environment.reflectiveMaterials) {
    value.envMap = cubeTarget.texture;
    value.needsUpdate = true;
  }
  let updatePlanarMirror = null;
  if (isElsie) {
    const planarTarget = new THREE.WebGLRenderTarget(512, 512, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: true
    });
    resources.renderTargets.add(planarTarget);
    const textureMatrix = new THREE.Matrix4();
    const mirrorMaterial = new THREE.ShaderMaterial({
      uniforms: {
        mirrorMap: { value: planarTarget.texture },
        textureMatrix: { value: textureMatrix }
      },
      vertexShader: `
        uniform mat4 textureMatrix;
        varying vec4 mirrorCoordinate;
        void main() {
          mirrorCoordinate = textureMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D mirrorMap;
        varying vec4 mirrorCoordinate;
        void main() {
          vec3 reflection = texture2DProj(mirrorMap, mirrorCoordinate).rgb;
          gl_FragColor = vec4(mix(reflection, vec3(0.965, 0.945, 0.940), 0.065), 1.0);
        }
      `,
      side: THREE.DoubleSide
    });
    mirrorMaterial.name = 'Elsie live planar mirror material';
    resources.materials.add(mirrorMaterial);
    environment.mirrorSurface.material = mirrorMaterial;
    environment.mirrorSurface.userData.livePlanarReflection = true;

    const virtualCamera = new THREE.PerspectiveCamera();
    const mirrorPosition = new THREE.Vector3();
    const cameraPosition = new THREE.Vector3();
    const rotationMatrix = new THREE.Matrix4();
    const normal = new THREE.Vector3();
    const view = new THREE.Vector3();
    const lookAtPosition = new THREE.Vector3();
    const reflectedTarget = new THREE.Vector3();
    const cameraDirection = new THREE.Vector3();
    const reflectorPlane = new THREE.Plane();
    const clipPlane = new THREE.Vector4();
    const projectionQ = new THREE.Vector4();
    const reflectionOccluders = [];
    scene.traverse(node => {
      if (node.isMesh && node.name === 'Elsie back wall') reflectionOccluders.push(node);
    });
    const biasMatrix = new THREE.Matrix4().set(
      .5, 0, 0, .5,
      0, .5, 0, .5,
      0, 0, .5, .5,
      0, 0, 0, 1
    );

    updatePlanarMirror = () => {
      const mirror = environment.mirrorSurface;
      mirror.updateMatrixWorld();
      camera.updateMatrixWorld();
      mirrorPosition.setFromMatrixPosition(mirror.matrixWorld);
      cameraPosition.setFromMatrixPosition(camera.matrixWorld);
      rotationMatrix.extractRotation(mirror.matrixWorld);
      normal.set(0, 0, 1).applyMatrix4(rotationMatrix).normalize();
      view.subVectors(mirrorPosition, cameraPosition);
      if (view.dot(normal) > 0) return;

      view.reflect(normal).negate().add(mirrorPosition);
      camera.getWorldDirection(cameraDirection);
      lookAtPosition.copy(cameraPosition).add(cameraDirection);
      reflectedTarget.subVectors(mirrorPosition, lookAtPosition).reflect(normal).negate().add(mirrorPosition);
      virtualCamera.position.copy(view);
      virtualCamera.up.copy(camera.up).reflect(normal);
      virtualCamera.lookAt(reflectedTarget);
      virtualCamera.near = camera.near;
      virtualCamera.far = camera.far;
      virtualCamera.aspect = camera.aspect;
      virtualCamera.projectionMatrix.copy(camera.projectionMatrix);
      virtualCamera.updateMatrixWorld();
      virtualCamera.matrixWorldInverse.copy(virtualCamera.matrixWorld).invert();

      textureMatrix.copy(biasMatrix)
        .multiply(virtualCamera.projectionMatrix)
        .multiply(virtualCamera.matrixWorldInverse)
        .multiply(mirror.matrixWorld);

      reflectorPlane.setFromNormalAndCoplanarPoint(normal, mirrorPosition);
      reflectorPlane.applyMatrix4(virtualCamera.matrixWorldInverse);
      clipPlane.set(reflectorPlane.normal.x, reflectorPlane.normal.y, reflectorPlane.normal.z, reflectorPlane.constant);
      const projection = virtualCamera.projectionMatrix.elements;
      projectionQ.x = (Math.sign(clipPlane.x) + projection[8]) / projection[0];
      projectionQ.y = (Math.sign(clipPlane.y) + projection[9]) / projection[5];
      projectionQ.z = -1;
      projectionQ.w = (1 + projection[10]) / projection[14];
      clipPlane.multiplyScalar(2 / clipPlane.dot(projectionQ));
      projection[2] = clipPlane.x;
      projection[6] = clipPlane.y;
      projection[10] = clipPlane.z + 1 - .003;
      projection[14] = clipPlane.w;
      virtualCamera.projectionMatrixInverse.copy(virtualCamera.projectionMatrix).invert();

      const previousTarget = renderer.getRenderTarget();
      const previousXr = renderer.xr.enabled;
      const actorRotation = actor?.mesh.rotation.y;
      const mirrorWasVisible = mirror.visible;
      const occluderVisibility = reflectionOccluders.map(node => node.visible);
      if (actor) {
        actor.mesh.getWorldPosition(actor.world);
        actor.mesh.rotation.y = Math.atan2(
          virtualCamera.position.x - actor.world.x,
          virtualCamera.position.z - actor.world.z
        );
      }
      mirror.visible = false;
      reflectionOccluders.forEach(node => { node.visible = false; });
      renderer.xr.enabled = false;
      try {
        renderer.setRenderTarget(planarTarget);
        renderer.clear();
        renderer.render(scene, virtualCamera);
      } finally {
        renderer.setRenderTarget(previousTarget);
        renderer.xr.enabled = previousXr;
        mirror.visible = mirrorWasVisible;
        reflectionOccluders.forEach((node, index) => { node.visible = occluderVisibility[index]; });
        if (actor && actorRotation !== undefined) actor.mesh.rotation.y = actorRotation;
      }
    };
  }
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;

  const clock = new THREE.Clock();
  let reflectionFrame = 0, lastRender = 0, budgetSamples = 0, slowFrames = 0;
  document.addEventListener('visibilitychange', () => {
    movementKeys.clear();
    if (!document.hidden && !disposed) { clock.getDelta(); cancelAnimationFrame(frame); frame=requestAnimationFrame(render); }
  }, {signal});
  const render = (now = performance.now()) => {
    if (disposed || document.hidden) return;
    if (!movementKeys.size && !drag && now-lastRender < 32) { frame=requestAnimationFrame(render); return; }
    if (lastRender && now-lastRender > (movementKeys.size || drag ? 26 : 46)) slowFrames++;
    if (++budgetSamples >= 24) {
      if (slowFrames > 12 && renderer.getPixelRatio() > .65) { renderer.setPixelRatio(Math.max(.65, renderer.getPixelRatio() * .8)); resize(); }
      budgetSamples=0;slowFrames=0;
    }
    lastRender=now;
    const delta = Math.min(clock.getDelta(), .05);
    elapsed += delta;
    if (actor) {
      const forwardInput = Number(movementKeys.has('KeyW')) - Number(movementKeys.has('KeyS'));
      const sideInput = Number(movementKeys.has('KeyD')) - Number(movementKeys.has('KeyA'));
      movementDirection.set(0, 0, 0);
      if (forwardInput || sideInput) {
        movementForward.set(target.x - camera.position.x, 0, target.z - camera.position.z).normalize();
        movementRight.set(-movementForward.z, 0, movementForward.x);
        movementDirection.addScaledVector(movementForward, forwardInput);
        movementDirection.addScaledVector(movementRight, sideInput).normalize();
        const step = 1.72 * delta;
        const walkable = (x, z) => {
          const bounds = roomSettings.walk;
          if (x < bounds.minX || x > bounds.maxX || z < bounds.minZ || z > bounds.maxZ) return false;
          return !roomSettings.obstacles.some(obstacle =>
            x > obstacle.minX && x < obstacle.maxX && z > obstacle.minZ && z < obstacle.maxZ
          );
        };
        const nextX = actor.mesh.position.x + movementDirection.x * step;
        const nextZ = actor.mesh.position.z + movementDirection.z * step;
        if (walkable(nextX, actor.mesh.position.z)) actor.mesh.position.x = nextX;
        if (walkable(actor.mesh.position.x, nextZ)) actor.mesh.position.z = nextZ;
        canvas.dataset.actorPosition = actor.mesh.position.x.toFixed(3) + ',' + actor.mesh.position.z.toFixed(3);
        actorFacingYaw = Math.atan2(movementDirection.x, movementDirection.z);
        const follow = 1 - Math.exp(-delta * 7.5);
        target.x += (actor.mesh.position.x - target.x) * follow;
        target.z += (actor.mesh.position.z - target.z) * follow;
        orbit();
      }
      actor.mesh.getWorldPosition(actor.world);
      const cameraAzimuth = Math.atan2(camera.position.x - actor.world.x, camera.position.z - actor.world.z);
      const walking = movementDirection.lengthSq() > 0;
      mascots.update(
        actor,
        cameraAzimuth,
        actorFacingYaw,
        elapsed,
        reducedMotion.matches,
        false,
        walking ? 0 : Math.sin(elapsed * .28) * .10,
        walking ? Math.sin(elapsed * 9) * .018 : 0
      );
      actor.mesh.rotation.y = cameraAzimuth;
      if (walking && !reducedMotion.matches) actor.mesh.position.y += Math.abs(Math.sin(elapsed * 9)) * .035;
    }
    if (updatePlanarMirror && reflectionFrame++ % 2 === 0) updatePlanarMirror();
    renderer.render(scene, camera);
    frame = requestAnimationFrame(render);
  };
  render();

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    mascots.dispose();
    for (const resource of [...resources.geometries, ...resources.materials, ...resources.textures, ...resources.renderTargets]) resource.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    root.replaceChildren();
  };
  signal.addEventListener('abort', dispose, { once: true });
  return { dispose };
}

export function openCompanionCloset({ character = 'eddy' } = {}) {
  activeClose?.();
  const isElsie = character === 'elsie';
  const characterName = isElsie ? 'Elsie' : 'Eddy';
  const collection = isElsie
    ? '<tr><td><div class="expression-closet-item"><span aria-hidden="true" style="font-size:38px">👜</span><strong>Blush Handbag</strong><span>On display</span></div></td>' +
      '<td><div class="expression-closet-item"><span aria-hidden="true" style="font-size:38px">👠</span><strong>Evening Heels</strong><span>On display</span></div></td></tr>' +
      '<tr><td><div class="expression-closet-item"><span aria-hidden="true" style="font-size:38px">🧣</span><strong>Silk Scarf</strong><span>On display</span></div></td>' +
      '<td><div class="expression-closet-item"><span aria-hidden="true" style="font-size:38px">💎</span><strong>Pearl Case</strong><span>On display</span></div></td></tr>'
    : '<tr><td><button type="button" class="expression-closet-item" disabled aria-disabled="true">' +
        '<span aria-hidden="true" style="font-size:38px">🎩</span><strong>White Fedora</strong><span>Fitting on hold</span></button></td>' +
      '<td><div class="expression-closet-empty" aria-label="Empty inventory slot">＋<span>Empty slot</span></div></td></tr>' +
      '<tr><td><div class="expression-closet-empty" aria-label="Empty inventory slot">＋<span>Empty slot</span></div></td>' +
      '<td><div class="expression-closet-empty" aria-label="Empty inventory slot">＋<span>Empty slot</span></div></td></tr>';
  const dialog = document.createElement('dialog');
  dialog.className = 'expression-closet';
  dialog.setAttribute('aria-labelledby', 'expression-closet-title');
  dialog.innerHTML =
    '<header class="expression-closet-header">' +
      `<div><p>${characterName.toUpperCase()}’S DRESSING ROOM</p><h2 id="expression-closet-title">${isElsie ? 'The Rose Atelier' : 'The Closet'} <small>3D 衣櫥</small></h2></div>` +
      '<button type="button" class="expression-closet-close" data-close-closet aria-label="Close closet">×</button>' +
    '</header>' +
    '<div class="expression-closet-controls" aria-label="Closet camera controls">' +
      '<button type="button" data-closet-camera="left">← Rotate</button>' +
      '<button type="button" data-closet-camera="right">Rotate →</button>' +
      '<button type="button" data-closet-camera="in">＋ Zoom</button>' +
      '<button type="button" data-closet-camera="out">− Zoom</button>' +
      '<button type="button" data-closet-camera="reset">Reset view</button>' +
      `<span><strong>Click the scene, then use WASD to move ${characterName}</strong> · Drag to orbit · Scroll or pinch to zoom · Shift-drag to pan</span>` +
    '</div>' +
    '<div class="expression-closet-workspace">' +
      '<div class="expression-closet-stage" data-closet-stage>' +
        '<p class="expression-closet-loading" data-closet-loading>Preparing the dressing room…</p>' +
      '</div>' +
      '<aside class="expression-closet-inventory" aria-labelledby="expression-closet-inventory-title">' +
        `<p class="expression-closet-inventory-kicker">${characterName.toUpperCase()}’S COLLECTION</p>` +
        '<h3 id="expression-closet-inventory-title">Inventory <small>物品欄</small></h3>' +
        '<table><caption class="sr-only">Two-column clothing inventory</caption><tbody>' +
          collection +
        '</tbody></table>' +
        `<p class="expression-closet-inventory-help">${isElsie ? 'Elsie’s accessories are arranged throughout the illuminated display bays.' : 'Outfit fitting is on hold while the walk-in closet is refined.'}</p>` +
      '</aside>' +
    '</div>';
  document.body.append(dialog);

  const controller = new AbortController();
  if(character==='eddy')mountClosetInventory(dialog.querySelector('.expression-closet-inventory'),controller.signal);
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    controller.abort();
    if (dialog.open) dialog.close();
    dialog.remove();
    delete document.body.dataset.closetOpen;
    window.dispatchEvent(new CustomEvent('edmund-closet-visibility', {detail:false}));
    if (activeClose === close) activeClose = null;
  };
  activeClose = close;
  dialog.querySelector('[data-close-closet]').addEventListener('click', close, { signal: controller.signal });
  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    close();
  }, { signal: controller.signal });
  dialog.addEventListener('click', event => {
    if (event.target === dialog) close();
  }, { signal: controller.signal });
  document.body.dataset.closetOpen = 'true';
  window.dispatchEvent(new CustomEvent('edmund-closet-visibility', {detail:true}));
  dialog.showModal();
  mountCloset(dialog.querySelector('[data-closet-stage]'), character, controller.signal);
  return { close };
}
