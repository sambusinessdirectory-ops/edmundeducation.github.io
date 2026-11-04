export const PAPER3_WRITING_TOPICS = Object.freeze(Array.from({length:15},(_,i)=>2012+i).flatMap(year=>['b1','b2'].flatMap(level=>(level==='b1'?[5,6,7]:[8,9,10]).map(task=>Object.freeze({
  id:`fill:paper3-${year}-${level}-task-${task}`,type:'fill-blanks',label:`${year} Paper 3 ${level.toUpperCase()} Task ${task}`,detail:`DSE Integrated Skills (Part B) · ${level.toUpperCase()} · 綜合能力寫作`,sectionKey:'dse-paper3',questionPrompt:[`${year} DSE Paper 3 Part ${level.toUpperCase()} — Task ${task}`, '請參照該年份的原卷題目及 Data File 作答。'],questionImages:[]
})))));
export function paper3Topic(value){return PAPER3_WRITING_TOPICS.find(t=>t.id===value||t.id==='fill:'+value)||null;}
export function paper3TopicRoute(value){const topic=paper3Topic(value);if(!topic)return '';const match=topic.id.match(/paper3-(\d{4})-(b[12])-task-(\d+)/);return `dse-paper3-analysis.html#${match[1]}-${match[2]}-task-${match[3]}`;}
