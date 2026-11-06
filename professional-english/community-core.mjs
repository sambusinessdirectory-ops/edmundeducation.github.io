export const ASSESSMENT_QUESTIONS=[
 ['我有信心用英語接待訪客。','I feel confident welcoming visitors in English.'],
 ['我能用英語清楚地解釋方向和大廈程序。','I can explain directions and building procedures clearly in English.'],
 ['我有信心冷靜地回應投訴。','I feel confident responding calmly to complaints.'],
 ['我能把較簡單的句子改成得體的專業英語。','I can turn simple sentences into appropriate professional English.'],
 ['字卡及錄音有助我記住和說出實用詞語。','Flashcards and audio help me remember and say useful words.'],
 ['填充練習有助我理解和運用對話。','Fill-in-the-blanks exercises help me understand and use the dialogues.'],
 ['一詞多義練習有助我按語境理解詞語。','Polysemy exercises help me understand words in context.'],
 ['這個課程的內容能應用在我的工作。','I can apply the course content to my work.']
];
export const TEAM_COLOURS=['#2563eb','#dc2626','#059669','#9333ea','#ea580c','#0891b2','#be185d','#64748b','#a16207','#4338ca','#15803d','#c2410c','#0e7490','#86198f','#6b21a8','#374151'];
export const lessonNumber=title=>Number((String(title).match(/(?:Class|Lesson)\s*(\d+)/i)||[])[1])||({'一':1,'二':2,'三':3})[(String(title).match(/第([一二三])課/)||[])[1]]||999;
export const lessonSort=(a,b)=>lessonNumber(a.title||a.deck_title)-lessonNumber(b.title||b.deck_title)||String(a.title||a.deck_title).localeCompare(String(b.title||b.deck_title));
export const memberBreakdown=m=>({total:Number(m.cards)||0,card:Number(m.card_questions)||0,blank:Number(m.blank_questions)||0,poly:Number(m.polysemy_words)||0});
export function teamSeries(course){
 const members=[...(course.members||[])],colourIds=members.map(m=>m.account_id).sort();
 let dates=[...new Set((course.daily||[]).map(r=>r.date))].sort();if(!dates.length)dates=[new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Hong_Kong'})];
 const totals=new Map(members.map(m=>[m.account_id,{cards:0,card_questions:0,blank_questions:0,polysemy_words:0}]));
 const daily=new Map((course.daily||[]).map(d=>[d.date+':'+d.account_id,d]));
 const series=members.map(m=>({...m,color:TEAM_COLOURS[colourIds.indexOf(m.account_id)%TEAM_COLOURS.length],points:[]}));
 const team=[];
 for(const date of dates){let all={cards:0,card_questions:0,blank_questions:0,polysemy_words:0};for(const m of series){const t=totals.get(m.account_id),d=daily.get(date+':'+m.account_id)||{};for(const k of Object.keys(t)){t[k]+=Number(d[k])||0;all[k]+=t[k];}m.points.push({date,...t});}team.push({date,...all});}
 // The final point uses the authoritative totals, including legacy history.
 for(const m of series)m.points[m.points.length-1]={date:dates.at(-1),cards:m.cards,card_questions:m.card_questions,blank_questions:m.blank_questions,polysemy_words:m.polysemy_words};
 team[team.length-1]={date:dates.at(-1),cards:Number(course.total_cards)||0};
 return {dates,series,team,max:Math.max(4,Math.ceil((Number(course.total_cards)||0)/4)*4)};
}
export function cardRows(records,status='all'){return records.filter(r=>status==='high'?Number(r.attempts)>=2:status==='green'||status==='red'?r.status===status:!!r.status).sort(lessonSort);}
