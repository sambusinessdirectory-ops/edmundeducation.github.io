const dayMs=86400000;
export const hkDate=value=>new Date(Number(value)+8*3600000).toISOString().slice(0,10);
export function rankBadges(members){
 const sorted=[...members].sort((a,b)=>(Number(b.cards)||0)-(Number(a.cards)||0)||String(a.username).localeCompare(String(b.username))||String(a.account_id).localeCompare(String(b.account_id)));
 return new Map(sorted.map((m,i)=>[m.account_id,i<3?['gold','silver','bronze'][i]:i>=sorted.length-3?'flex':null]));
}
export function teamGrowth(course){
 const gain=Number(course.last_24h_questions),before=Number(course.total_before_24h);
 if(!Number.isFinite(gain)||!Number.isFinite(before)||gain<0||before<0)return null;
 return {gain,before,percent:before>0?Math.round(gain/before*1000)/10:null};
}
export function relativeAge(at,now=Date.now()){
 const seconds=Math.max(0,Math.floor((now-Number(at))/1000));
 if(seconds<60)return '剛剛';
 if(seconds<3600)return Math.floor(seconds/60)+' 分鐘前';
 if(seconds<86400)return Math.floor(seconds/3600)+' 小時前';
 return Math.floor(seconds/86400)+' 天前';
}
export function learningPoints(daily,range='week',now=Date.now()){
 // Use the same Hong Kong dates as the server, even on a device in another zone.
 const today=hkDate(now),t=new Date(today+'T00:00:00Z'),periods=[];
 if(range==='week'||range==='month')for(let i=(range==='week'?7:30)-1;i>=0;i--){const from=new Date(+t-i*dayMs).toISOString().slice(0,10);periods.push({from,to:from,label:`${Number(from.slice(5,7))}/${Number(from.slice(8))}`});}
 else{
  const month=t.getUTCMonth(),year=t.getUTCFullYear();let count={'three-month':3,'six-month':6,'nine-month':9,ytd:month+1,year:12}[range]||1;
  if(range==='all'&&daily.length){const first=[...daily].sort((a,b)=>a.date.localeCompare(b.date))[0].date;count=Math.max(1,(year-Number(first.slice(0,4)))*12+month-Number(first.slice(5,7))+2);}
  for(let i=count-1;i>=0;i--){const d=new Date(Date.UTC(year,month-i,1)),next=new Date(Date.UTC(year,month-i+1,1));periods.push({from:d.toISOString().slice(0,10),to:new Date(Math.min(+next-dayMs,+t)).toISOString().slice(0,10),label:`${d.getUTCMonth()+1}/${String(d.getUTCFullYear()).slice(-2)}`});}
 }
 let cumulative=daily.filter(d=>d.date<periods[0].from).reduce((n,d)=>n+(Number(d.questions)||0),0);
 return periods.map(p=>{const sum={questions:0,cards:0,blanks:0,words:0};for(const d of daily.filter(d=>d.date>=p.from&&d.date<=p.to))for(const key of Object.keys(sum))sum[key]+=Number(d[key])||0;cumulative+=sum.questions;return {...p,...sum,cumulative,title:p.from===p.to?p.from:`${p.from} – ${p.to}`};});
}
