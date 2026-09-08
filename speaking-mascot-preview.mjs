import {mountClassroom} from './speaking-classroom-3d.mjs?v=20260908-mascots8';
import {eddyFrameURL, idleFrame} from './speaking-mascot-sprites.mjs?v=20260908-mascots8';
import {MASCOT_ART} from './speaking-mascot-art.mjs?v=20260908-mascots8';

const names = ['Eddy', 'Elsie', 'Phoebe', 'Eddy'];
const fields = document.querySelector('#names'), count = document.querySelector('#count'), status = document.querySelector('#selected');
let scene, generation = 0;
function showFields() {
  fields.replaceChildren();
  for (let i = 0; i < Number(count.value); i++) {
    const label = document.createElement('label');
    label.textContent = `Candidate ${'ABCD'[i]}`;
    const input = document.createElement('input');
    input.value = names[i]; input.placeholder = 'Student name'; input.setAttribute('aria-label', `Candidate ${'ABCD'[i]} name`);
    const select = document.createElement('select');
    select.setAttribute('aria-label', `Candidate ${'ABCD'[i]} mascot`);
    for (const name of names.slice(0, 3)) select.add(new Option(name, name.toLowerCase()));
    select.value = names[i].toLowerCase(); label.append(input, select); fields.append(label);
  }
}
async function update() {
  const current = ++generation;
  scene?.dispose(); scene = null;
  const candidates = [...fields.children].map((label, i) => ({id: 'ABCD'[i], name: label.querySelector('input').value, mascot: label.querySelector('select').value}));
  const root = document.createElement('div');
  document.querySelector('#classroom').replaceChildren(root);
  status.textContent = 'Loading classroom…';
  try {
    const mounted = await mountClassroom(root, candidates, id => {
      scene?.active(id); status.textContent = `Candidate ${id} is the active speaker.`;
    });
    if (current !== generation) { mounted.dispose(); return; }
    scene = mounted;
    status.textContent = 'Select a character or desk to mark the active speaker.';
  } catch { if (current === generation) status.textContent = 'The classroom could not load. Please reload this page.'; }
}
count.onchange = () => { showFields(); update(); };
document.querySelector('#apply').onclick = update;
showFields(); update();

const images = new Map(), direction = document.querySelector('#direction'), reduced = matchMedia('(prefers-reduced-motion: reduce)');
function getImage(url) {
  if (!images.has(url)) { const image = new Image(); image.src = url; images.set(url, image); }
  return images.get(url);
}
function draw(time) {
  for (const canvas of document.querySelectorAll('[data-art]')) {
    const name = canvas.dataset.art, d = direction.value;
    const url = name === 'eddy' ? eddyFrameURL(d, idleFrame(time / 1000, reduced.matches)) : `assets/speaking-system/mascots/${name}-directions-v1.png`;
    const image = getImage(url);
    if (!image.complete || !image.naturalWidth) continue;
    const rect = name === 'eddy' ? [136, 73, 240, 376] : MASCOT_ART[name].frames[d];
    const [x, y, width, height] = rect, h = 300, w = h * width / height;
    const ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, x, y, width, height, (canvas.width - w) / 2, canvas.height - 20 - h, w, h);
  }
  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);
addEventListener('pagehide', () => scene?.dispose());
