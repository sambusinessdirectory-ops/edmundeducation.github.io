const cefrPattern = /\b(B1|B2|C1|C2)\b/;
const cefrIdPattern = /(?:^|[-_])(B1|B2|C1|C2)(?:[-_]|$)/;
const levelOrder = ['A2','B1','B2','C1','C2','B1–C2'];

export function vocabularyLevel(question){
  if(question.id.startsWith('A2'))return 'A2';
  const explicit=String(question.level||question.cefr||question.band||'').toUpperCase().match(cefrPattern)?.[1];
  return explicit||question.id.toUpperCase().match(cefrIdPattern)?.[1]||'B1–C2';
}

export function vocabularyGroups(questions){
  const grouped=new Map();
  for(const question of questions.filter(({id})=>id.startsWith('A2')||id.startsWith('ADV'))){
    const level=vocabularyLevel(question);
    if(!grouped.has(level))grouped.set(level,[]);
    grouped.get(level).push(question);
  }
  return levelOrder.filter(level=>grouped.has(level)).map(level=>[level,grouped.get(level)]);
}
