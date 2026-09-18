// Export frozen source-order sentences; each module restarts the four-voice cycle.
import {modules} from '../polysemy-lab/catalogue.mjs';
console.log(JSON.stringify(modules.filter(m=>m.id!=='show').flatMap(m=>m.questions.map(q=>({id:q.id,en:q.en,index:q.sentenceIndex,module:m.id}))),null,2));
