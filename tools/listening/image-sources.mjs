import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
export function dseImageSources(){
 const context={window:{}},sources=new Set();
 for(const file of fs.readdirSync(root).filter(name=>/^dse-listening-\d+-data\.js$/.test(name)).sort()){
  vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),context);
  const year=file.match(/\d+/)[0],tasks=context.window[`EDMUND_DSE_LISTENING_${year}`].tasks;
  for(const match of JSON.stringify(tasks).matchAll(/assets\/dse-listening\/[^"\\\s]+\.(?:jpg|jpeg|webp|png)/g))sources.add(match[0]);
 }
 return [...sources].sort();
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log(JSON.stringify(dseImageSources()));
