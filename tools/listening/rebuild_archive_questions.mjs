import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {tasksByYear} from './archive-question-layouts.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
for(const [year,tasks] of Object.entries(tasksByYear)) {
  const file=path.join(root,`dse-listening-${year}-data.js`);
  const context={window:{}};
  vm.runInNewContext(fs.readFileSync(file,'utf8'),context);
  const {transcript,...metadata}=context.window[`EDMUND_DSE_LISTENING_${year}`];
  const data={...metadata,version:2,tasks};
  const script=`// Generated from source-checked layouts by tools/listening/rebuild_archive_questions.mjs.\n(function(){"use strict";\nconst data=${JSON.stringify(data,null,2)};\ndata.transcript=window.EDMUND_DSE_LISTENING_${year}_TRANSCRIPT||{partA:{},partB:[]};\nfunction freeze(value){if(value && typeof value==="object" && !Object.isFrozen(value)){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}\nwindow.EDMUND_DSE_LISTENING_${year}=freeze(data);\n})();\n`;
  fs.writeFileSync(file,script);
  console.log(`${year}: rebuilt ${tasks.length} native tasks`);
}
