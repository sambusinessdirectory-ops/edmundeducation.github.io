import fs from 'node:fs';
const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url)));
const words=new Set(read('./reviewed-listening-words.json'));
const rejected=new Set(read('./rejected-fallback-options.json').map(s=>s.toLowerCase().replace(/’/g,"'")));
export const plainDescription=s=>String(s||'').replace(/<[^>]*>/g,'').replace(/&nbsp;/gi,' ').trim();
export function editorialIssues(song){
 const issues=[];
 const description=plainDescription(song.description);
 if(!description || !/[。！？.!?][」』”"’')）]*$/.test(description))issues.push('description: incomplete ending; compare against source and review the complete final sentence');
 for(const mode of song.exercises||[])for(const q of mode.questions||[])for(const option of q.options||[]){
  const normalized=option.toLowerCase().replace(/’/g,"'");
  if(rejected.has(normalized))issues.push(`${mode.id} Q${q.number}: rejected mechanical distractor ${option}`);
  for(const token of normalized.match(/[a-z]+(?:'[a-z]+)?/g)||[])if(!words.has(token))issues.push(`${mode.id} Q${q.number}: unreviewed word '${token}'; verify real spelling and audible distinction before updating the reviewed lexicon`);
 }
 return issues;
}
