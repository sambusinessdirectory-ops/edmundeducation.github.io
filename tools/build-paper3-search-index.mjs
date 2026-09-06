import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
const ctx={window:{}}; vm.runInNewContext(fs.readFileSync('dse-paper3-analysis-data.js','utf8'),ctx);
const rows=[]; const listening=[];
for(const resource of Object.values(ctx.window.EDMUND_DSE_PAPER3_DATA.resources)) {
 for(const essay of resource.modelEssays||[]) rows.push({year:resource.year,level:resource.level,material:'model-essay',anchor:'essay-'+essay.id,title:essay.title,text:essay.blocks.join('\n')});
 for(const section of resource.analysisSections||[]) rows.push({year:resource.year,level:resource.level,material:'data-file-analysis',anchor:'section-'+section.id,title:section.title,text:[section.summary,...section.pages.flatMap(p=>p.blocks)].join('\n')});
}
// Include every available Part B question, transcript and analysis, not Part A.
function strings(value){if(typeof value==='string')return [value];if(Array.isArray(value))return value.flatMap(strings);if(value&&typeof value==='object')return Object.entries(value).filter(([key])=>!/(?:url|src|audio|image|id|sourceFile)/i.test(key)).flatMap(([,value])=>strings(value));return [];}
for(const year of [2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2023]) {
 for(const suffix of ['transcript','data']) { const file=`dse-listening-${year}-${suffix}.js`;if(fs.existsSync(file))vm.runInNewContext(fs.readFileSync(file,'utf8'),ctx); }
 const data=ctx.window[`EDMUND_DSE_LISTENING_${year}`];
 if(data) listening.push({year,data});
}
vm.runInNewContext(fs.readFileSync('paper3/2025-b2/sentence-analysis-data.js','utf8'),ctx);
for (const record of ctx.window.EDMUND_B2_SENTENCE_ANALYSIS.records) rows.push({year:2025,level:'B2',title:record.sectionTitle,url:'/paper3/2025-b2/',text:[record.quote,...record.blocks].join('\n')});
console.log(execFileSync('python3',['tools/build-paper3-search-html.py'],{input:JSON.stringify({rows,listening}),encoding:'utf8'}));
