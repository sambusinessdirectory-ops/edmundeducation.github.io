import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs/promises";

const root = new URL("../", import.meta.url);
const html = await fs.readFile(new URL("index.html", root), "utf8");
const display = await fs.readFile(new URL("review-display.js", root), "utf8");
const listSource = html.match(/const studentCommentFiles = \[([\s\S]*?)\n    \];/)?.[1] || "";
const files = [...listSource.matchAll(/"([^"]+)"/g)].map(match => match[1]);

assert.equal(files.length, 39, "homepage and review window must expose all 39 reviews");
assert.deepEqual(files.slice(-16), [
  "Comment 24 from Student TX.png",
  "Comment 25 from Student AM.png",
  "Comment 26 from Student FE.png",
  "Comment 27 from Student RK.png",
  "Comment 28 from Student NV.png",
  "Comment 29 from Student JL.png",
  "Comment 30 from Student QD.png",
  "Comment 31 from Student BW.png",
  "Comment 32 from Student CP.png",
  "Comment 33 from Student GS.png",
  "Comment 34 from Student UH.png",
  "Comment 35 from Student ZK.png",
  "Comment 36 from Student VR.png",
  "Comment 37 from Student DY.png",
  "Comment 38 from Student LF.png",
  "Comment 39 from Student XO.png",
]);
const newCodes = files.slice(-16).map(file => file.match(/Student ([A-Z]{2})\.png$/)?.[1]);
assert.ok(newCodes.every(Boolean), "every new review needs an anonymous two-letter student code");
assert.equal(new Set(newCodes).size, 16, "new anonymous student codes must be unique");
assert.match(html, /data-company-review-feed/);
assert.match(html, /data-student-comments/);
assert.match(html, /studentCommentFiles\.map\(\(file, index\) =>/);
assert.match(display, /fetch\('\/protected-reviews\/'\+n\+'\.png'\)/);
assert.match(display, /offset=13763/);

const keyBytes = Buffer.from("Y+pZYENE1hrEw5XkJOMLHoWvAaJa3Ek82wq71jjqUqo=", "base64");
const key = await crypto.webcrypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM" }, false, ["decrypt"]);
const dimensions = [];
for (let number = 1; number <= 39; number += 1) {
  const packed = new Uint8Array(await fs.readFile(new URL(`protected-reviews/${number}.png`, root)));
  assert.equal(Buffer.from(packed.slice(1, 4)).toString("ascii"), "PNG", `${number}: public wrapper must remain a warning PNG`);
  assert.ok(packed.length > 13763 + 12 + 16, `${number}: encrypted review payload is missing`);
  const plain = Buffer.from(await crypto.webcrypto.subtle.decrypt(
    { name: "AES-GCM", iv: packed.slice(13763, 13775) },
    key,
    packed.slice(13775),
  ));
  assert.equal(plain.subarray(0, 4).toString("ascii"), "RIFF", `${number}: decrypted payload must be WebP`);
  assert.equal(plain.subarray(8, 12).toString("ascii"), "WEBP", `${number}: decrypted payload must be WebP`);
  const signature = plain.indexOf(Buffer.from([0x9d, 0x01, 0x2a]));
  assert.ok(signature >= 0, `${number}: lossy WebP frame header missing`);
  const width = plain.readUInt16LE(signature + 3) & 0x3fff;
  const height = plain.readUInt16LE(signature + 5) & 0x3fff;
  assert.ok(width > 0 && height > 0, `${number}: review dimensions are invalid`);
  if (number >= 24) assert.ok(width >= 800 && height >= 280, `${number}: new review must retain readable source dimensions`);
  dimensions.push(`${width}x${height}`);
}

console.log(`Homepage student reviews passed: ${files.length} shared entries, 16 new anonymous codes, and 39 decryptable protected WebP canvases (${dimensions.slice(-16).join(", ")}).`);
