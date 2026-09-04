import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { dseImageSources, root } from './listening/image-sources.mjs';
import { DSE_IMAGE_ENHANCEMENTS as images } from '../dse-listening-image-manifest.mjs';
import { upgradeDseImages } from '../dse-listening-images.mjs';

assert.deepEqual(Object.keys(images), dseImageSources(), 'Every active image has an enhancement');
assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root,'assets/dse-listening/reconstructed-v3/manifest.json'))).images, images);
const prompts=JSON.parse(fs.readFileSync(path.join(root,'tools/listening/reconstruction-prompts.json')));
for (const [source, image] of Object.entries(images)) {
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,source))).digest('hex'), image.sourceSha256, `${source}: original unchanged`);
  assert.equal(image.restorationInput.kind,'authorized-ai-reconstruction','Reconstruction is truthfully documented');
  assert.equal(prompts.images[source].reviewed,true,'Every reconstruction has been visually reviewed');
  assert.ok(prompts.images[source].prompt.length>100,'Reference prompt preserved');
  const master=image.restorationInput.master;
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,master.src))).digest('hex'),master.sha256,'Reviewed master is preserved');
  for (const [label, edge] of [['small',640],['preview',1280],['full',3840]]) {
    const output = image[label], bytes = fs.readFileSync(path.join(root,output.src));
    assert.equal(bytes.subarray(0,4).toString(),'RIFF');
    assert.equal(bytes.subarray(8,12).toString(),'WEBP');
    assert.equal(bytes.length,output.bytes);
    assert.equal(Math.max(output.width,output.height),edge);
    assert.ok(Math.abs(output.width-image.sourceWidth*edge/Math.max(image.sourceWidth,image.sourceHeight))<=.5);
    assert.ok(Math.abs(output.height-image.sourceHeight*edge/Math.max(image.sourceWidth,image.sourceHeight))<=.5);
  }
  const html = upgradeDseImages(`<a href="${source}"><img class="dse-inline-figure" src="${source}" alt="Original illustration" loading="lazy"></a>`);
  assert.ok(html.includes(`href="${image.full.src}"`));
  assert.ok(html.includes(`src="${image.small.src}"`));
  assert.ok(html.includes(`${image.preview.src} ${image.preview.width}w`));
  assert.equal((html.match(/loading=/g)||[]).length,1);
  assert.ok(html.includes('class="dse-inline-figure"'));
  assert.equal(upgradeDseImages(html),html,'Repeated rendering does not duplicate attributes');
  assert.ok(!html.includes('按圖放大原圖'));
}
const unknown='<img src="other.jpg" alt="Not a DSE original">';
assert.equal(upgradeDseImages(unknown),unknown);
console.log(`All ${Object.keys(images).length} original images preserved; responsive variants, 4K proportions and renderer mapping passed.`);
