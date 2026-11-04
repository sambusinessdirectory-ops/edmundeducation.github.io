#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT_DIRECTORY = path.join(ROOT, "country-name-spelling-map");
const source = {
  world: process.env.COUNTRY_MAP_WORLD || "/private/tmp/ne_50m_admin_0_countries.geojson",
  districts: process.env.COUNTRY_MAP_HK || "/private/tmp/hk_18_districts.geojson",
  stations: process.env.COUNTRY_MAP_MTR || "/private/tmp/hk_mtr_stations.geojson",
  elevation113: process.env.COUNTRY_MAP_HGT_113 || "/private/tmp/country-map-source/N22E113.hgt",
  elevation114: process.env.COUNTRY_MAP_HGT_114 || "/private/tmp/country-map-source/N22E114.hgt"
};

const WORLD_SIZE = Object.freeze({ width:1600, height:800 });
const HK_SIZE = Object.freeze({ width:1100, height:650, padding:42 });
const HK_BOUNDS = Object.freeze({ west:113.82, east:114.46, south:22.14, north:22.58 });

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function collectCoordinates(geometry, destination = []) {
  if (!geometry) return destination;
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  for (const polygon of polygons) for (const ring of polygon) for (const coordinate of ring) destination.push(coordinate);
  return destination;
}

function pointDistanceSquared(point, start, end) {
  let x = start[0];
  let y = start[1];
  let dx = end[0] - x;
  let dy = end[1] - y;
  if (dx || dy) {
    const t = ((point[0] - x) * dx + (point[1] - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) { x = end[0]; y = end[1]; }
    else if (t > 0) { x += dx * t; y += dy * t; }
  }
  dx = point[0] - x;
  dy = point[1] - y;
  return dx * dx + dy * dy;
}

function simplify(points, tolerance) {
  if (points.length <= 4) return points;
  const squareTolerance = tolerance * tolerance;
  const markers = new Uint8Array(points.length);
  const stack = [[0, points.length - 1]];
  markers[0] = markers[points.length - 1] = 1;
  while (stack.length) {
    const [first, last] = stack.pop();
    let index = 0;
    let maximum = squareTolerance;
    for (let cursor = first + 1; cursor < last; cursor += 1) {
      const distance = pointDistanceSquared(points[cursor], points[first], points[last]);
      if (distance > maximum) { index = cursor; maximum = distance; }
    }
    if (index) {
      markers[index] = 1;
      stack.push([first, index], [index, last]);
    }
  }
  return points.filter((_, index) => markers[index]);
}

function pathForGeometry(geometry, project, tolerance) {
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  const paths = [];
  for (const polygon of polygons) {
    for (const ring of polygon) {
      const projected = ring.map(project);
      const simplified = simplify(projected, tolerance);
      if (simplified.length < 3) continue;
      paths.push(`M${simplified.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join("L")}Z`);
    }
  }
  return paths.join("");
}

function worldProject([longitude, latitude]) {
  return [
    ((longitude + 180) / 360) * WORLD_SIZE.width,
    ((90 - latitude) / 180) * WORLD_SIZE.height
  ];
}

function hkProjection() {
  return ([longitude, latitude]) => [
    ((longitude - HK_BOUNDS.west) / (HK_BOUNDS.east - HK_BOUNDS.west)) * HK_SIZE.width,
    ((HK_BOUNDS.north - latitude) / (HK_BOUNDS.north - HK_BOUNDS.south)) * HK_SIZE.height
  ];
}

function normaliseName(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/gi, "")
    .toLowerCase();
}

function districtId(name) {
  return String(name).replace(/ District$/i, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function ringAreaAndCentroid(ring, project) {
  const points = ring.map(project);
  let twiceArea = 0;
  let x = 0;
  let y = 0;
  for (let index = 0; index < points.length - 1; index += 1) {
    const a = points[index];
    const b = points[index + 1];
    const cross = a[0] * b[1] - b[0] * a[1];
    twiceArea += cross;
    x += (a[0] + b[0]) * cross;
    y += (a[1] + b[1]) * cross;
  }
  const area = twiceArea / 2;
  if (!area) return { area:0, x:points[0]?.[0] || 0, y:points[0]?.[1] || 0 };
  return { area:Math.abs(area), x:x / (6 * area), y:y / (6 * area) };
}

function geometryCentroid(geometry, project) {
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  const candidates = polygons.map((polygon) => ringAreaAndCentroid(polygon[0], project));
  return candidates.sort((a, b) => b.area - a.area)[0];
}

function buildGeometry() {
  const world = readJson(source.world);
  const districtSource = readJson(source.districts);
  const stationSource = readJson(source.stations);
  const projectHongKong = hkProjection();

  const countries = world.features.map((feature) => {
    const properties = feature.properties || {};
    const code = String(properties.ISO_A2_EH || properties.ISO_A2 || "").toLowerCase();
    return {
      code,
      name:properties.ADMIN || properties.NAME_EN || properties.NAME,
      path:pathForGeometry(feature.geometry, worldProject, .7)
    };
  }).filter((country) => country.path);

  const districts = districtSource.features.map((feature) => {
    const centroid = geometryCentroid(feature.geometry, projectHongKong);
    return {
      id:districtId(feature.properties.District),
      name:String(feature.properties.District).replace(/ District$/i, ""),
      zh:feature.properties["地區"],
      path:pathForGeometry(feature.geometry, projectHongKong, .62),
      x:Number(centroid.x.toFixed(2)),
      y:Number(centroid.y.toFixed(2))
    };
  });

  const stationIndex = new Map();
  for (const feature of stationSource.features) {
    const name = feature.properties?.SnName;
    if (!name || feature.geometry?.type !== "Point") continue;
    const key = normaliseName(name);
    if (!stationIndex.has(key)) stationIndex.set(key, feature.geometry.coordinates);
  }
  const stationOverrides = {
    "asiaworldexpo":"AsiaWorld-Expo",
    "lohaspark":"LOHAS Park"
  };
  const stations = {};
  for (const [key, coordinates] of stationIndex) {
    const [x, y] = projectHongKong(coordinates);
    stations[key] = { x:Number(x.toFixed(2)), y:Number(y.toFixed(2)) };
  }
  for (const [alias, sourceName] of Object.entries(stationOverrides)) {
    const sourceCoordinates = stationIndex.get(normaliseName(sourceName));
    if (!sourceCoordinates) continue;
    const [x, y] = projectHongKong(sourceCoordinates);
    stations[alias] = { x:Number(x.toFixed(2)), y:Number(y.toFixed(2)) };
  }

  fs.mkdirSync(OUTPUT_DIRECTORY, { recursive:true });
  const moduleSource = `// Generated by tools/build-country-map-assets.mjs.\n// Sources: Natural Earth 1:50m countries; HKSAR Home Affairs Department district boundaries; public MTR station feature layer.\nexport const WORLD_VIEWBOX = Object.freeze(${JSON.stringify(WORLD_SIZE)});\nexport const WORLD_GEOMETRY = Object.freeze(${JSON.stringify(countries)});\nexport const HK_VIEWBOX = Object.freeze(${JSON.stringify({ width:HK_SIZE.width, height:HK_SIZE.height })});\nexport const HK_GEOMETRY = Object.freeze(${JSON.stringify(districts)});\nexport const MTR_COORDINATES = Object.freeze(${JSON.stringify(stations)});\n`;
  fs.writeFileSync(path.join(OUTPUT_DIRECTORY, "map-geometry.mjs"), moduleSource);
  return { countries:countries.length, districts:districts.length, stations:Object.keys(stations).length };
}

function elevationAt(buffers, longitude, latitude) {
  const tileLongitude = Math.floor(longitude);
  const buffer = buffers[tileLongitude];
  if (!buffer) return 0;
  const size = 3601;
  const x = Math.max(0, Math.min(size - 1, Math.round((longitude - tileLongitude) * (size - 1))));
  const y = Math.max(0, Math.min(size - 1, Math.round((23 - latitude) * (size - 1))));
  const elevation = buffer.readInt16BE((y * size + x) * 2);
  return elevation < -1000 ? 0 : elevation;
}

function buildHongKongRelief() {
  const buffers = {
    113:fs.readFileSync(source.elevation113),
    114:fs.readFileSync(source.elevation114)
  };
  const width = 1400;
  const height = 880;
  const elevations = new Float32Array(width * height);
  for (let y = 0; y < height; y += 1) {
    const latitude = HK_BOUNDS.north - (y / (height - 1)) * (HK_BOUNDS.north - HK_BOUNDS.south);
    for (let x = 0; x < width; x += 1) {
      const longitude = HK_BOUNDS.west + (x / (width - 1)) * (HK_BOUNDS.east - HK_BOUNDS.west);
      elevations[y * width + x] = elevationAt(buffers, longitude, latitude);
    }
  }
  const pixels = Buffer.alloc(width * height);
  const azimuth = (315 * Math.PI) / 180;
  const altitude = (42 * Math.PI) / 180;
  const cell = 30;
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const dzdx = (elevations[y * width + x + 1] - elevations[y * width + x - 1]) / (2 * cell);
      const dzdy = (elevations[(y + 1) * width + x] - elevations[(y - 1) * width + x]) / (2 * cell);
      const slope = Math.atan(Math.hypot(dzdx, dzdy));
      const aspect = Math.atan2(dzdy, -dzdx);
      const shade = Math.sin(altitude) * Math.cos(slope) + Math.cos(altitude) * Math.sin(slope) * Math.cos(azimuth - aspect);
      pixels[y * width + x] = Math.max(30, Math.min(245, Math.round(116 + shade * 116)));
    }
  }
  const header = Buffer.from(`P5\n${width} ${height}\n255\n`);
  const output = process.env.COUNTRY_MAP_HK_RELIEF || "/private/tmp/country-map-source/hong-kong-relief.pgm";
  fs.writeFileSync(output, Buffer.concat([header, pixels]));
  return { width, height, output };
}

const geometry = buildGeometry();
const relief = buildHongKongRelief();
console.log(JSON.stringify({ geometry, relief }, null, 2));
