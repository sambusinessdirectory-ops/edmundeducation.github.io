import {mountClassroom} from './speaking-classroom-3d.mjs?v=20260908-mascots9';
import {MascotCharacters} from './speaking-mascot-characters.mjs?v=20260908-mascots9';
import * as THREE from './vendor/three/three.module.js';

const names = ['Eddy', 'Elsie', 'Phoebe', 'Eddy'];
const fields = document.querySelector('#names'), count = document.querySelector('#count'), status = document.querySelector('#selected');
let scene, generation = 0, selected = null;
const seated = document.querySelector('#seated');
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
      selected=id;scene?.active(id); status.textContent = `Candidate ${id} is the active speaker.`;
    },{seated:seated.checked});
    if (current !== generation) { mounted.dispose(); return; }
    scene = mounted;selected=null;
    status.textContent = 'Select a character or desk to mark the active speaker.';
  } catch { if (current === generation) status.textContent = 'The classroom could not load. Please reload this page.'; }
}
count.onchange = () => { showFields(); update(); };
document.querySelector('#apply').onclick = update;
seated.onchange=()=>{update();loadGallery();};
document.querySelector('#stop-speaking').onclick=()=>{selected=null;scene?.active(null);status.textContent='Select a character or desk to mark the active speaker.';};
showFields(); update();

const reduced=matchMedia('(prefers-reduced-motion: reduce)'),angle=document.querySelector('#angle');
const galleryCanvas=document.querySelector('#mascot-gallery'),galleryScene=new THREE.Scene();
galleryScene.background=new THREE.Color('#fffdf9');
const galleryCamera=new THREE.OrthographicCamera(-3.8,3.8,1.25,-1.25,.1,20);
galleryCamera.position.set(0,1.15,8);galleryCamera.lookAt(0,1.15,0);
const galleryRenderer=new THREE.WebGLRenderer({canvas:galleryCanvas,antialias:true});
galleryRenderer.setPixelRatio(Math.min(devicePixelRatio,1.7));galleryRenderer.outputColorSpace=THREE.SRGBColorSpace;
const resizeGallery=()=>{const w=galleryCanvas.clientWidth,h=w/3.04;galleryCanvas.style.height=h+'px';galleryRenderer.setSize(w,h,false);};
const galleryObserver=new ResizeObserver(resizeGallery);galleryObserver.observe(galleryCanvas);resizeGallery();
let gallerySprites=null,galleryActors=[],galleryGeneration=0,stopped=false;
async function loadGallery(){
 const gen=++galleryGeneration;gallerySprites?.dispose();galleryActors=[];galleryScene.clear();
 const library=new MascotCharacters();gallerySprites=library;
 try{for(let i=0;i<3;i++){
  const art=await library.create(names[i].toLowerCase(),seated.checked?'seated':'standing');
  if(gen!==galleryGeneration||!art){library.dispose();return;}
  art.mesh.position.x=(i-1)*2.5;galleryScene.add(art.mesh);galleryActors.push(art);
 }}catch{if(gen===galleryGeneration)status.textContent='Character preview could not load. Please reload.';}
}
function draw(time){
 if(stopped)return;
 const radians=Number(angle.value)*Math.PI/180;
 document.querySelector('#angle-label').value=Number(angle.value).toFixed(1)+'°';
 galleryActors.forEach((art,i)=>{
  gallerySprites.update(art,0,radians,time/1000+i*.3,reduced.matches,selected==='ABC'[i]);
  // The gallery rotates the illustrated view while keeping the presentation facing the camera.
  art.mesh.rotation.y=0;
 });
 galleryRenderer.render(galleryScene,galleryCamera);requestAnimationFrame(draw);
}
loadGallery();requestAnimationFrame(draw);
addEventListener('pagehide',()=>{stopped=true;scene?.dispose();gallerySprites?.dispose();galleryObserver.disconnect();galleryRenderer.dispose();galleryRenderer.forceContextLoss();});
