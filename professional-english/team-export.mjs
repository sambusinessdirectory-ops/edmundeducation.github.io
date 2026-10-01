const count=value=>Number(value)||0;
const dayNumber=iso=>{const [year,month,day]=iso.split('-').map(Number);return Math.floor(Date.UTC(year,month-1,day)/86400000);};
const isoDay=number=>new Date(number*86400000).toISOString().slice(0,10);
const hkToday=now=>{
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Hong_Kong',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
 const part=type=>parts.find(item=>item.type===type).value;
 return `${part('year')}-${part('month')}-${part('day')}`;
};

export function teamExportRows(course,now=new Date()){
 const daily=new Map();
 const memberDaily=new Map();
 for(const item of course.daily||[]){
  const row=daily.get(item.date)||{total:0,cards:0,polysemy:0};
  row.total+=count(item.cards);row.cards+=count(item.card_questions);row.polysemy+=count(item.polysemy_words);
  daily.set(item.date,row);
  const key=`${item.account_id}:${item.date}`;
  const individual=memberDaily.get(key)||{cards:0,blanks:0,polysemy:0};
  individual.cards+=count(item.card_questions);
  individual.blanks+=count(item.blank_questions);
  individual.polysemy+=count(item.polysemy_words);
  memberDaily.set(key,individual);
 }
 const members=[...(course.members||[])].sort((a,b)=>count(b.cards)-count(a.cards)||String(a.username).localeCompare(String(b.username)));
 const sums=members.reduce((result,member)=>{
  result.total+=count(member.cards);result.cards+=count(member.card_questions);
  result.blanks+=count(member.blank_questions);result.polysemy+=count(member.polysemy_words);
  return result;
 },{total:0,cards:0,blanks:0,polysemy:0});
 const rows=[['Date since first counting (dd/mm/yyyy)','總題數','字卡','一詞多義','Total Work Count, accumulative',sums.total,'Team member','總題數','字卡','填空','一詞多義',
  ...members.flatMap(member=>[`${member.username} · 日期 (dd/mm/yyyy)`,`${member.username} · 字卡`,`${member.username} · 填空`,`${member.username} · 一詞多義`])]];
 const today=dayNumber(hkToday(now));
 const first=Math.min(today,...[...daily.keys()].map(dayNumber));
 const memberFirst=new Map(members.map(member=>[member.account_id,Math.min(today,...(course.daily||[]).filter(item=>item.account_id===member.account_id).map(item=>dayNumber(item.date)))]));
 for(let day=today,index=0;day>=first||index<members.length||index<3;day--,index++){
  const date=day>=first?isoDay(day):null,activity=date?daily.get(date):null,member=members[index];
  const labels=['Flash cards','Fill in the blanks','Polysemy'];
  const totals=[sums.cards,sums.blanks,sums.polysemy];
  rows.push([
   date,date?activity?.total||0:null,date?activity?.cards||0:null,date?activity?.polysemy||0:null,
   labels[index]||null,totals[index]??null,
   member?.username||null,member?count(member.cards):null,member?count(member.card_questions):null,
   member?count(member.blank_questions):null,member?count(member.polysemy_words):null,
   ...members.flatMap(account=>{
    if(day<memberFirst.get(account.account_id))return [null,null,null,null];
    const accountDate=isoDay(day),record=memberDaily.get(`${account.account_id}:${accountDate}`);
    return [accountDate,record?.cards||0,record?.blanks||0,record?.polysemy||0];
   })
  ]);
 }
 return rows;
}

const xml=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[char]));
const column=index=>{let label='';for(let n=index+1;n>0;n=Math.floor((n-1)/26))label=String.fromCharCode(65+(n-1)%26)+label;return label;};
const serial=iso=>dayNumber(iso)-dayNumber('1899-12-30');
const cell=(value,row,col)=>{
 if(value===null||value===undefined||value==='')return '';
 const ref=column(col)+(row+1);
 if(row>0&&(col===0||(col>=11&&(col-11)%4===0)))return `<c r="${ref}" s="1"><v>${serial(value)}</v></c>`;
 if(typeof value==='number')return `<c r="${ref}"><v>${value}</v></c>`;
 return `<c r="${ref}" t="inlineStr"${row===0?' s="2"':''}><is><t>${xml(value)}</t></is></c>`;
};
const encoder=new TextEncoder();
const u16=(array,value)=>{array.push(value&255,(value>>>8)&255);};
const u32=(array,value)=>{u16(array,value);u16(array,value>>>16);};
const crc32=bytes=>{let crc=0xffffffff;for(const byte of bytes){crc^=byte;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;};
function zip(files){
 const output=[],central=[];let offset=0;
 for(const [name,source] of Object.entries(files)){
  const nameBytes=encoder.encode(name),data=encoder.encode(source),crc=crc32(data),local=[];
  u32(local,0x04034b50);u16(local,20);u16(local,0x0800);u16(local,0);u16(local,0);u16(local,0);
  u32(local,crc);u32(local,data.length);u32(local,data.length);u16(local,nameBytes.length);u16(local,0);
  output.push(Uint8Array.from(local),nameBytes,data);
  const entry=[];u32(entry,0x02014b50);u16(entry,20);u16(entry,20);u16(entry,0x0800);u16(entry,0);u16(entry,0);u16(entry,0);
  u32(entry,crc);u32(entry,data.length);u32(entry,data.length);u16(entry,nameBytes.length);u16(entry,0);u16(entry,0);
  u16(entry,0);u16(entry,0);u32(entry,0);u32(entry,offset);
  central.push(Uint8Array.from(entry),nameBytes);offset+=local.length+nameBytes.length+data.length;
 }
 const centralSize=central.reduce((sum,item)=>sum+item.length,0),end=[];
 u32(end,0x06054b50);u16(end,0);u16(end,0);u16(end,Object.keys(files).length);u16(end,Object.keys(files).length);
 u32(end,centralSize);u32(end,offset);u16(end,0);
 const pieces=[...output,...central,Uint8Array.from(end)],result=new Uint8Array(offset+centralSize+end.length);
 let position=0;for(const piece of pieces){result.set(piece,position);position+=piece.length;}return result;
}

export function teamExportXlsx(rows){
 const sheetRows=rows.map((values,index)=>`<row r="${index+1}">${values.map((value,col)=>cell(value,index,col)).join('')}</row>`).join('');
 const accountColumns=Array.from({length:Math.max(0,rows[0].length-11)},(_,index)=>`<col min="${index+12}" max="${index+12}" width="${index%4===0?30:20}" customWidth="1"/>`).join('');
 const files={
  '[Content_Types].xml':'<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>',
  '_rels/.rels':'<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
  'xl/workbook.xml':'<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Team effort" sheetId="1" r:id="rId1"/></sheets></workbook>',
  'xl/_rels/workbook.xml.rels':'<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
  'xl/styles.xml':'<?xml version="1.0" encoding="UTF-8"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="164" formatCode="dd/mm/yyyy"/></numFmts><fonts count="2"><font><sz val="11"/><name val="Aptos"/></font><font><b/><sz val="11"/><name val="Aptos"/></font></fonts><fills count="1"><fill><patternFill patternType="none"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>',
  'xl/worksheets/sheet1.xml':`<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><dimension ref="A1:${column(rows[0].length-1)}${rows.length}"/><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols><col min="1" max="1" width="39" customWidth="1"/><col min="2" max="4" width="15" customWidth="1"/><col min="5" max="5" width="33" customWidth="1"/><col min="6" max="6" width="15" customWidth="1"/><col min="7" max="7" width="22" customWidth="1"/><col min="8" max="11" width="15" customWidth="1"/>${accountColumns}</cols><sheetData>${sheetRows}</sheetData></worksheet>`
 };
 return zip(files);
}

export function downloadTeamExport(course,now=new Date()){
 const bytes=teamExportXlsx(teamExportRows(course,now));
 const url=URL.createObjectURL(new Blob([bytes],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
 const link=document.createElement('a');link.href=url;link.download=`ThreeGardenRoad-team-effort-${hkToday(now)}.xlsx`;
 document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
}
