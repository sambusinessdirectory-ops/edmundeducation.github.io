// Export frozen manual-order sentences. Modules 16 onward use the approved three local accents.
import {modules} from '../polysemy-lab/catalogue.mjs';
const legacy=['american-female','american-male','british-male','british-female'],current=['american-female','british-male','british-female'];
console.log(JSON.stringify(modules.filter(m=>m.id!=='show').flatMap(m=>m.questions.map(q=>{const voices=m.number>=16?current:legacy;return {id:q.id,en:q.en,index:q.sentenceIndex,voice:voices[q.sentenceIndex%voices.length],module:m.id};})),null,2));
