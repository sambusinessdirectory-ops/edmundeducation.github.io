import assert from 'node:assert/strict';
import {eventsByModule} from '../../natural-english/progress-index.mjs';
import {modules,latestRun,completed} from '../../natural-english/catalogue.mjs';
const events=[];
for(const module of modules){
 const base={module:module.id,at:'2026-10-16T01:00:00Z',run:'first'};
 events.push({...base,id:module.id+'-start',kind:'start'});
 for(const q of module.questions.slice(0,2))events.push({...base,id:q.id,kind:'answer',question:q.id,choice:q.answers[0]});
}
events.push({id:'legacy-start',kind:'start',run:'legacy',at:'2026-10-16T02:00:00Z'});
events.push({id:'legacy-answer',kind:'answer',run:'legacy',at:'2026-10-16T02:01:00Z',question:'scoop-spot',choice:'scoop'});
const grouped=eventsByModule(events);
for(const module of modules){
 const expectedRun=latestRun(events,module.id),actualRun=latestRun(grouped.get(module.id)||[],module.id);
 assert.equal(actualRun,expectedRun);
 assert.deepEqual(completed(grouped.get(module.id)||[],actualRun,module),completed(events,expectedRun,module));
}
assert.equal(eventsByModule([]).size,0);
assert.equal(grouped.get('scoop').at(-1).id,'legacy-answer');
console.log(`Grouped library progress matches full-history grading for ${modules.length} modules, including legacy events.`);
