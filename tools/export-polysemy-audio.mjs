// Export frozen manual-order sentences. Preserve the published three-voice recipe for modules 16–32; new modules restore the four-voice rotation.
import {modules} from '../polysemy-lab/catalogue.mjs';
const legacy=['american-female','american-male','british-male','british-female'],middle=['american-female','british-male','british-female'];
console.log(JSON.stringify(modules.filter(m=>m.id!=='show').flatMap(m=>m.questions.map(q=>{const voices=m.number>=33?legacy:m.number>=16?middle:legacy;return {id:q.id,en:q.en,index:q.sentenceIndex,voice:voices[q.sentenceIndex%voices.length],module:m.id};})),null,2));
