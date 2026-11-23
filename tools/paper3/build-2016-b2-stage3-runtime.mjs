import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const source = path.join(root, 'tools/paper3/2016-b2/source');
const output = path.join(root, 'paper3/2016-b2/stage3-runtime.js.gz');
const data = fs.readFileSync(path.join(source, 'super-curation-stage3-data.js'), 'utf8');
const controller = fs.readFileSync(path.join(source, 'super-curation-stage3.js'), 'utf8');
const payload = `${data}\n//# sourceURL=2016-b2-stage3-data.js\n${controller}\n//# sourceURL=2016-b2-stage3-controller.js\n`;
const compressed = zlib.gzipSync(Buffer.from(payload), {level: 9, mtime: 0});
const current = fs.existsSync(output) ? fs.readFileSync(output) : null;
if (!current?.equals(compressed)) fs.writeFileSync(output, compressed);
console.log(`2016 B2 Stage 3 runtime: ${Buffer.byteLength(payload)} -> ${compressed.length} bytes`);
