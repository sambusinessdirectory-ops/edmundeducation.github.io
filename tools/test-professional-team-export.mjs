import assert from 'node:assert/strict';
import {teamExportRows,teamExportXlsx} from '../professional-english/team-export.mjs';

const course={members:[
 {username:'Candy3GR',cards:7,card_questions:3,blank_questions:2,polysemy_words:2},
 {username:'Andy3GR',cards:3,card_questions:1,blank_questions:1,polysemy_words:1}
],daily:[
 {date:'2026-09-28',cards:4,card_questions:2,polysemy_words:1},
 {date:'2026-09-28',cards:2,card_questions:1,polysemy_words:1},
 {date:'2026-09-30',cards:4,card_questions:1,polysemy_words:1}
]};
const rows=teamExportRows(course,new Date('2026-09-30T16:30:00Z'));
assert.equal(rows[0][4],'Total Work Count, accumulative');
assert.deepEqual(rows.slice(1,5).map(row=>row.slice(0,4)),[
 ['2026-10-01',0,0,0],['2026-09-30',4,1,1],['2026-09-29',0,0,0],['2026-09-28',6,3,2]
]);
assert.deepEqual(rows.slice(0,4).map(row=>row.slice(4,6)),[
 ['Total Work Count, accumulative',10],['Flash cards',4],['Fill in the blanks',3],['Polysemy',3]
]);
assert.deepEqual(rows[1].slice(6),['Candy3GR',7,3,2,2]);
assert.deepEqual(rows[2].slice(6),['Andy3GR',3,1,1,1]);
const xlsx=teamExportXlsx(rows);
assert.equal(Buffer.from(xlsx).readUInt32LE(0),0x04034b50);
await import('node:fs/promises').then(fs=>fs.writeFile('/private/tmp/professional-team-export-test.xlsx',xlsx));
console.log('Professional team export rows and workbook generated.');
