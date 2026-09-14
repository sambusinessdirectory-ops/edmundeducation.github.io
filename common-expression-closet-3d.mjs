import * as THREE from './vendor/three/three.module.js';
import { MascotCharacters } from './speaking-mascot-characters.mjs?v=20260915-mascot4';

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
    const value = new THREE.MeshPhysicalMaterial({ color, roughness: .72, envMapIntensity: .7, ...options });
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
  const foldedTops = generatedGarments.map(map => material('#ffffff', { map, transparent: true, alphaTest: .08, roughness: .96, metalness: 0, clearcoat: 0, side: THREE.DoubleSide }));
  const hangingGarmentFaces = hangingGarmentSpecs.map(([name, , roughness, sheen], index) =>
    material('#ffffff', {
      name: 'Generated ' + name + ' material',
      map: hangingGarmentMaps[index],
      transparent: true,
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
      const hangerMaterial = new THREE.LineBasicMaterial({ color: '#c9a77c', transparent: true, opacity: .92 });
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

function mountCloset(root, character, signal) {
  const resources = { geometries: new Set(), materials: new Set(), textures: new Set(), renderTargets: new Set() };
  let disposed = false;
  let frame = 0;
  let actor = null;
  let elapsed = 0;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#171719');
  scene.fog = new THREE.FogExp2('#171719', .014);
  const camera = new THREE.PerspectiveCamera(42, 1, .08, 70);
  const target = new THREE.Vector3(0, 1.45, .30);
  let yaw = 0;
  let pitch = .10;
  let distance = 9.7;
  let actorFacingYaw = 0;
  const movementKeys = new Set();
  const movementDirection = new THREE.Vector3();
  const movementForward = new THREE.Vector3();
  const movementRight = new THREE.Vector3();

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  root.append(renderer.domElement);
  const canvas = renderer.domElement;
  canvas.tabIndex = 0;
  canvas.style.touchAction = 'none';
  canvas.setAttribute('aria-label', 'Interactive low-light 3D closet. Use W A S D to move Eddy, drag to look around, and scroll or pinch to zoom.');

  const orbit = () => {
    const horizontal = Math.cos(pitch) * distance;
    camera.position.set(
      target.x + Math.sin(yaw) * horizontal,
      target.y + Math.sin(pitch) * distance,
      target.z + Math.cos(yaw) * horizontal
    );
    camera.position.x = clamp(camera.position.x, -6.85, 6.85);
    camera.position.y = clamp(camera.position.y, .68, 4.18);
    camera.position.z = clamp(camera.position.z, -5.65, 6.05);
    camera.lookAt(target);
  };
  orbit();

  scene.add(new THREE.HemisphereLight(0xe4e7ec, 0x2b1b14, .82));
  scene.add(new THREE.AmbientLight(0x8b7969, .30));
  const key = new THREE.SpotLight(0xffe2bd, 54, 18, Math.PI / 4.7, .62, 1.18);
  key.position.set(0, 4.25, 2.4);
  key.target.position.set(0, 1.15, -.9);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.bias = -.00025;
  key.shadow.normalBias = .035;
  scene.add(key, key.target);
  const leftGlow = new THREE.PointLight(0xe4a26f, 20, 7.5, 1.7);
  leftGlow.position.set(-4.6, 2.25, -.8);
  const rightGlow = new THREE.PointLight(0xb6c8df, 14, 7, 1.8);
  rightGlow.position.set(4.7, 2.1, -.4);
  const frontGlow = new THREE.PointLight(0xffbd80, 13, 5.8, 1.7);
  frontGlow.position.set(0, 3.15, 3.9);
  scene.add(leftGlow, rightGlow, frontGlow);

  const environment = buildCloset(scene, resources);
  const plinthMaterial = new THREE.MeshStandardMaterial({ color: '#312823', roughness: .55, metalness: .12 });
  resources.materials.add(plinthMaterial);
  const plinthGeometry = new THREE.CylinderGeometry(.74, .82, .14, 48);
  resources.geometries.add(plinthGeometry);
  const plinth = new THREE.Mesh(plinthGeometry, plinthMaterial);
  plinth.position.set(0, .07, 2.30);
  plinth.receiveShadow = true;
  plinth.castShadow = true;
  scene.add(plinth);

  const mascots = new MascotCharacters();
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const loading = root.closest('.expression-closet')?.querySelector('[data-closet-loading]');
  mascots.create(character, 'standing').then(created => {
    if (!created || disposed || signal.aborted) return;
    actor = created;
    actor.mesh.position.set(0, .18, 2.30);
    canvas.dataset.actorPosition = '0,2.30';
    scene.add(actor.mesh);
    if (loading) loading.hidden = true;
  }).catch(() => {
    if (loading) loading.textContent = 'Eddie could not load, but you can still explore the closet.';
  });

  const dialog = root.closest('.expression-closet');
  const controls = dialog?.querySelector('.expression-closet-controls');
  const zoom = amount => {
    distance = clamp(distance + amount, 4.6, 13.4);
    orbit();
  };
  const reset = () => {
    yaw = 0;
    pitch = .10;
    distance = 9.7;
    target.set(actor?.mesh.position.x || 0, 1.45, actor?.mesh.position.z || .30);
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
      target.x = clamp(target.x - dx * .006, -3.1, 3.1);
      target.y = clamp(target.y + dy * .006, .85, 2.4);
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
  reflectionCamera.position.set(0, 2.22, -3.9);
  scene.add(reflectionCamera);
  environment.mirrorSurface.visible = false;
  reflectionCamera.update(renderer, scene);
  environment.mirrorSurface.visible = true;
  scene.remove(reflectionCamera);
  for (const value of environment.reflectiveMaterials) {
    value.envMap = cubeTarget.texture;
    value.needsUpdate = true;
  }
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;

  const clock = new THREE.Clock();
  const render = () => {
    if (disposed) return;
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
          if (x < -6.55 || x > 6.55 || z < -5.25 || z > 5.95) return false;
          if (Math.abs(x) < 2.88 && z > -.52 && z < 2.30) return false;
          if (x > 3.62 && x < 6.08 && z > 2.92 && z < 4.42) return false;
          return true;
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
  const dialog = document.createElement('dialog');
  dialog.className = 'expression-closet';
  dialog.setAttribute('aria-labelledby', 'expression-closet-title');
  dialog.innerHTML =
    '<header class="expression-closet-header">' +
      '<div><p>EDDIE’S DRESSING ROOM</p><h2 id="expression-closet-title">The Closet <small>3D 衣櫥</small></h2></div>' +
      '<button type="button" class="expression-closet-close" data-close-closet aria-label="Close closet">×</button>' +
    '</header>' +
    '<div class="expression-closet-controls" aria-label="Closet camera controls">' +
      '<button type="button" data-closet-camera="left">← Rotate</button>' +
      '<button type="button" data-closet-camera="right">Rotate →</button>' +
      '<button type="button" data-closet-camera="in">＋ Zoom</button>' +
      '<button type="button" data-closet-camera="out">− Zoom</button>' +
      '<button type="button" data-closet-camera="reset">Reset view</button>' +
      '<span><strong>Click the scene, then use WASD to move Eddy</strong> · Drag to orbit · Scroll or pinch to zoom · Shift-drag to pan</span>' +
    '</div>' +
    '<div class="expression-closet-workspace">' +
      '<div class="expression-closet-stage" data-closet-stage>' +
        '<p class="expression-closet-loading" data-closet-loading>Preparing the dressing room…</p>' +
      '</div>' +
      '<aside class="expression-closet-inventory" aria-labelledby="expression-closet-inventory-title">' +
        '<p class="expression-closet-inventory-kicker">EDDIE’S COLLECTION</p>' +
        '<h3 id="expression-closet-inventory-title">Inventory <small>物品欄</small></h3>' +
        '<table><caption class="sr-only">Two-column clothing inventory</caption><tbody>' +
          '<tr><td><button type="button" class="expression-closet-item" disabled aria-disabled="true">' +
            '<span aria-hidden="true" style="font-size:38px">🎩</span>' +
            '<strong>White Fedora</strong><span>Fitting on hold</span>' +
          '</button></td><td><div class="expression-closet-empty" aria-label="Empty inventory slot">＋<span>Empty slot</span></div></td></tr>' +
          '<tr><td><div class="expression-closet-empty" aria-label="Empty inventory slot">＋<span>Empty slot</span></div></td><td><div class="expression-closet-empty" aria-label="Empty inventory slot">＋<span>Empty slot</span></div></td></tr>' +
        '</tbody></table>' +
        '<p class="expression-closet-inventory-help">Outfit fitting is on hold while the walk-in closet is refined.</p>' +
      '</aside>' +
    '</div>';
  document.body.append(dialog);

  const controller = new AbortController();
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    controller.abort();
    if (dialog.open) dialog.close();
    dialog.remove();
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
  dialog.showModal();
  mountCloset(dialog.querySelector('[data-closet-stage]'), character, controller.signal);
  return { close };
}
