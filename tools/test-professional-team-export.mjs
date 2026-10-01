import assert from 'node:assert/strict';
import {teamExportRows,teamExportXlsx} from '../professional-english/team-export.mjs';

const course={members:[
 {account_id:'c',username:'Candy3GR',cards:7,card_questions:3,blank_questions:2,polysemy_words:2},
 {account_id:'a',username:'Andy3GR',cards:3,card_questions:1,blank_questions:1,polysemy_words:1}
],daily:[
 {account_id:'c',date:'2026-09-28',cards:6,card_questions:2,blank_questions:2,polysemy_words:2},
 {account_id:'c',date:'2026-09-30',cards:1,card_questions:1,blank_questions:0,polysemy_words:0},
 {account_id:'a',date:'2026-09-30',cards:3,card_questions:1,blank_questions:1,polysemy_words:1}
]};
const rows=teamExportRows(course,new Date('2026-09-30T16:30:00Z'));
assert.equal(rows[0][4],'Total Work Count, accumulative');
assert.deepEqual(rows.slice(1,5).map(row=>row.slice(0,4)),[
 ['2026-10-01',0,0,0],['2026-09-30',4,2,1],['2026-09-29',0,0,0],['2026-09-28',6,2,2]
]);
assert.deepEqual(rows.slice(0,4).map(row=>row.slice(4,6)),[
 ['Total Work Count, accumulative',10],['Flash cards',4],['Fill in the blanks',3],['Polysemy',3]
]);
assert.deepEqual(rows[1].slice(6,11),['Candy3GR',7,3,2,2]);
assert.deepEqual(rows[2].slice(6,11),['Andy3GR',3,1,1,1]);
assert.deepEqual(rows[0].slice(11,19),['Candy3GR · 日期 (dd/mm/yyyy)','Candy3GR · 字卡','Candy3GR · 填空','Candy3GR · 一詞多義','Andy3GR · 日期 (dd/mm/yyyy)','Andy3GR · 字卡','Andy3GR · 填空','Andy3GR · 一詞多義']);
assert.deepEqual(rows[2].slice(11),['2026-09-30',1,0,0,'2026-09-30',1,1,1]);
assert.deepEqual(rows[3].slice(11),['2026-09-29',0,0,0,null,null,null,null]);
assert.deepEqual(rows[4].slice(11),['2026-09-28',2,2,2,null,null,null,null]);
const xlsx=teamExportXlsx(rows);
assert.equal(Buffer.from(xlsx).readUInt32LE(0),0x04034b50);
await import('node:fs/promises').then(fs=>fs.writeFile('/private/tmp/professional-team-export-test.xlsx',xlsx));
const fourMemberRows=teamExportRows({...course,members:[...course.members,{account_id:'b',username:'B',cards:0},{account_id:'d',username:'D',cards:0}]},new Date('2026-09-30T16:30:00Z'));
await import('node:fs/promises').then(fs=>fs.writeFile('/private/tmp/professional-team-export-wide-test.xlsx',teamExportXlsx(fourMemberRows)));
console.log('Professional team export rows and workbook generated.');
