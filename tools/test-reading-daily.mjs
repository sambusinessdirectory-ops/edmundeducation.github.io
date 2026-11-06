#!/usr/bin/env node
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,stat} from 'node:fs/promises';

const root=new URL('../',import.meta.url);
const read=path=>readFile(new URL(path,root),'utf8');
const [html,runtime,css,homepage,nav,sitemap,manifest]=await Promise.all([
  read('daily-reading.html'),read('daily-reading/daily-reading.mjs'),read('daily-reading/daily-reading.css'),
  read('index.html'),read('shared-system-nav.js'),read('sitemap.xml'),read('pwa-manifests/daily-reading.webmanifest')
]);
const image=await readFile(new URL('daily-reading/parking-meter-article.png',root));

assert.match(html,/data-system="daily-reading"/);
assert.match(html,/data-view="login"/);
assert.match(html,/data-view="library" hidden/);
assert.match(html,/data-view="exercise" hidden/);
assert.match(html,/flashcard_student_login|daily-reading\.mjs/);
assert.match(runtime,/flashcard_student_login/);
assert.match(runtime,/flashcard_student_session_profile/);
assert.match(runtime,/getStudentSession/);
assert.match(runtime,/rememberStudentSession/);
assert.match(runtime,/new FormData\(form\)/);
assert.match(runtime,/credentials:'omit'/);
assert.match(runtime,/AbortController/);
assert.match(runtime,/登入成功，正在開啟文章目錄/);
assert.match(runtime,/try\{window\.EdmundSystemNav\?\.rememberStudentSession/);
assert.match(html,/Software update triggers HK parking meter outage/);
assert.match(html,/Read the article carefully and answer <b>ALL<\/b> questions/);
const passageBlock=runtime.match(/const passage = \[([\s\S]*?)\n\];/)?.[1]||'';
assert.equal((passageBlock.match(/^\s*'/gm)||[]).length,8,'passage must retain eight numbered paragraphs');

const questionRows=[...runtime.matchAll(/\{id:(\d+),section:'([A-E])',marks:(\d+),refs:/g)];
assert.equal(questionRows.length,24,'daily reading must expose all 24 supplied questions');
assert.equal(new Set(questionRows.map(match=>match[1])).size,24,'question ids must be unique');
assert.equal(questionRows.reduce((sum,match)=>sum+Number(match[3]),0),40,'question marks must total 40');
for(const operation of ["type:'choice'","type:'select'","type:'multi'","type:'text'","type:'textarea'"])assert.match(runtime,new RegExp(operation));
for(const phrase of ['True (T), False (F), or Not Given (NG)','back-end software fault','Digital Policy Office','12.15pm','Factual and cautious'])assert.match(runtime,new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));

assert.match(homepage,/data-system-card-deck-position>01 \/ 83</);
assert.match(homepage,/data-system-card-deck-last[^>]*>83<\/button>/);
assert.match(homepage,/href="news-reader\.html"[^>]*aria-label="日常聆聽系統 Daily Listening Practice"/);
assert.match(homepage,/href="daily-reading\.html"[^>]*aria-label="日常閱讀理解系統 Daily Reading Comprehension"/);
assert.match(nav,/id: "news-reader"[^\n]+zh: "日常聆聽系統"[^\n]+homepageCard: 82/);
assert.match(nav,/id: "daily-reading"[^\n]+homepageCard: 83/);
assert.match(sitemap,/https:\/\/edmundeducation\.com\/daily-reading\.html/);

const parsed=JSON.parse(manifest);
assert.equal(parsed.id,'/apps/daily-reading');
assert.equal(parsed.start_url,'/daily-reading.html?source=pwa');
assert.equal(image[0],0x89);assert.equal(image.subarray(1,4).toString(),'PNG');
assert.ok((await stat(new URL('daily-reading/parking-meter-article.png',root))).size>100000);
assert.equal(createHash('sha256').update(image).digest('hex'),'d5c328e029031a62ad42f85ecdf5a7c09a0e11e874feba7f57f49eca4d6b0583','thumbnail must remain byte-identical to the supplied screenshot');
assert.match(css,/\[hidden\]\{display:none!important\}/,'author display rules must not override hidden views');
assert.match(css,/\.article-card/);assert.match(css,/\.question-card\.is-correct/);assert.match(css,/@media\(max-width:640px\)/);
console.log('Daily Reading portal contract passed: 24 questions, 40 marks, Card 83, student login, article thumbnail and PWA metadata.');
