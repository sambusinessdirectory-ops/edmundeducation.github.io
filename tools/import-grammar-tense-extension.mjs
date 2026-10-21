// Usage: node tools/import-grammar-tense-extension.mjs exercises.txt curation.txt
import fs from 'node:fs';import crypto from 'node:crypto';import assert from 'node:assert/strict';
const [exerciseFile,curationFile]=process.argv.slice(2);if(!exerciseFile||!curationFile)throw new Error('Provide both supplied TXT files');
const exercises=fs.readFileSync(exerciseFile,'utf8').replace(/\r\n/g,'\n');const curation=fs.readFileSync(curationFile,'utf8').replace(/\r\n/g,'\n');
const range=value=>value.split('、').flatMap(p=>{const m=p.match(/^(\d+)(?:[–-](\d+))?$/);assert.ok(m,p);return Array.from({length:Number(m[2]||m[1])-Number(m[1])+1},(_,i)=>Number(m[1])+i);});
const concepts=curation.split(/^={10,}\s*$/m).map(s=>s.trim()).filter(s=>/^\d+\. /.test(s)).map(block=>{
 const paragraphs=block.split(/\n\s*\n/);assert.equal(paragraphs.length,5);const firstBreak=paragraphs[0].indexOf('\n');paragraphs.splice(0,1,paragraphs[0].slice(0,firstBreak),paragraphs[0].slice(firstBreak+1));
 const head=paragraphs[0].match(/^(\d+)\. (.*)$/);const examples=paragraphs[3].split('\n');assert.equal(examples.length,2);
 const refs=paragraphs[5].match(/^來源：(.*?)。練習：(.*?)。$/);assert.ok(refs);
 return {number:Number(head[1]),chapter:Number(head[1])<60?'16 · 補充時間與過程':'17 · 動詞搭配與假設延伸',title:head[2],focus:paragraphs[1],formula:paragraphs[2],examples:[examples],check:paragraphs[4],source:`補充教學 · 第 ${refs[2]} 題`,sourceReference:refs[1],questionNumbers:range(refs[2])};
});
assert.deepEqual(concepts.map(c=>c.number),Array.from({length:9},(_,i)=>i+53));
const conceptFor=new Map();for(const c of concepts){assert.equal(c.questionNumbers.length,5);for(const n of c.questionNumbers){assert.ok(!conceptFor.has(n));conceptFor.set(n,c);}}
const grouped=new Map();for(const m of exercises.matchAll(/^(5[3-9]|6[01]) · .*\n([^\n]+)/gm)){for(const n of conceptFor.values()){if(n.number===Number(m[1]))for(const no of n.questionNumbers.filter(no=>no<=177))grouped.set(no,m[2].replace(/^在第 \d+–\d+ 題，/,''));}}
const exercisePrompts=new Map([...exercises.matchAll(/^第 (\d+) 題\n([^\n]+)\n([^\n]+)/gm)].map(m=>[Number(m[1]),[m[2],m[3]]]));
const focusEn={53:'Show the activity in the future while-clause as being in progress.',54:'Show the activity as background work continuing through that past period.',55:'Complete the since-clause with the finished past event that started the period.',56:'Look back from the later past checkpoint at what had already happened or had never happened.',57:'Focus on the recent ongoing or repeated activity, rather than a completed total.',58:'Focus on the completed course or placement period at the later future checkpoint.',59:'Report the event at the finished time indicated by ago.',60:'Show that the person is currently considering an undecided plan.',61:'Complete the imagined result of a situation that is different from the present facts.'};
const focusZh={53:'突出將來 while 子句中正在進行的活動。',54:'突出過去那段時間內持續的背景活動。',55:'填寫 since 後面那件已發生的起點事件。',56:'從較後的過去檢查點，回望之前已完成或一直未發生的情況。',57:'突出近期持續或反覆進行的活動，不是已完成的總數。',58:'突出到將來檢查點時已完成的整段課程或實習。',59:'按 ago 指出的已結束時間，敘述那時發生的事。',60:'表達目前正在考慮、尚未決定的打算。',61:'按與現況不同的假設，填寫 would 後的結果。'};
const tense={53:'Present Continuous · future while-clause',54:'Past Continuous',55:'Simple Past · since-clause',56:'Past Perfect',57:'Present Perfect Continuous',58:'Future Perfect',59:'Simple Past',60:'Present Continuous · thinking of',61:'Second Conditional · would'};
const questions=[...curation.matchAll(/^第 (\d+) 題\n([\s\S]*?)(?=^第 \d+ 題\n|$(?![\s\S]))/gm)].map(m=>{
 const number=Number(m[1]);const lines=m[2].split('\n').map(s=>s.trim()).filter(s=>s&&!/^-{5,}$/.test(s));assert.equal(lines.length,11,`Q${number}`);
 const [prompt,translation,answerLine,completeLine,...explanation]=lines;const answer=answerLine.replace(/^答案：/,'');const completeSentence=completeLine.replace(/^完整句：/,'');
 assert.deepEqual([prompt,translation],exercisePrompts.get(number),`Both sources match Q${number}`);assert.equal(explanation.length,7);explanation.forEach((s,i)=>assert.ok(s.startsWith(`步驟${'一二三四五六七'[i]}：`)));
 const concept=conceptFor.get(number);assert.ok(concept);assert.equal(prompt.replace(/_+\s*\([^)]*\)/,answer),completeSentence,`Filled sentence Q${number}`);
 const acceptedAnswers=[answer];const notes=[];const direction=prompt.match(/\s+((?:Show|Focus on)\b.+)$/);const cleanPrompt=direction?prompt.slice(0,direction.index):prompt;const cleanComplete=direction?completeSentence.replace(direction[0],''):completeSentence;
 if(number===155){acceptedAnswers.push('was sorting');notes.push('補充：staff 作集合名詞時，英式英語可按成員用 were sorting，也可按整體用 was sorting；兩種主謂配合都接受。');}
 if(number===156){acceptedAnswers.push('were testing');notes.push('補充：team 可視為整體（was testing），英式英語也可著眼成員（were testing）；本題接受兩種主謂配合。');}
 if(number===185){acceptedAnswers.push('had met');notes.push('補充：本題以 met 示範 ago 所指的已結束時間；若從典禮當時回望更早的相識，也可自然地寫 had met，本題亦接受。不能把 ago 教成永遠排除過去完成式。');}
 if(notes.length)explanation.splice(6,0,...notes);
 return {id:`tense-${String(number).padStart(3,'0')}`,number,conceptNumber:concept.number,stage:number<=177?'extension-guided':'extension-mixed',sourcePrompt:prompt,sourceCompleteSentence:completeSentence,prompt:cleanPrompt,translation,answer,acceptedAnswers,completeSentence:cleanComplete,tense:tense[concept.number],instruction:grouped.get(number)||focusZh[concept.number],instructionEn:direction?direction[1]:focusEn[concept.number],explanation};
});
assert.deepEqual(questions.map(q=>q.number),Array.from({length:45},(_,i)=>i+151));assert.equal(exercisePrompts.size,45);
for(const c of concepts){const q=questions.find(q=>q.number===c.questionNumbers[1]);c.examples.push([q.completeSentence,q.translation]);}
const data={concepts,questions};
fs.writeFileSync('grammar-tense-extension-data.js',`// Imported from the supplied tense extension: concepts 53–61 and questions 151–195.\nwindow.EDMUND_GRAMMAR_TENSE_EXTENSION = ${JSON.stringify(data,null,2)};\nif (window.EDMUND_GRAMMAR_TENSE_QUESTIONS?.length === 150 && window.EDMUND_GRAMMAR_TENSE_CURATION?.length === 52) {\n  window.EDMUND_GRAMMAR_TENSE_QUESTIONS = [...window.EDMUND_GRAMMAR_TENSE_QUESTIONS, ...window.EDMUND_GRAMMAR_TENSE_EXTENSION.questions];\n  window.EDMUND_GRAMMAR_TENSE_CURATION = Object.freeze([...window.EDMUND_GRAMMAR_TENSE_CURATION, ...window.EDMUND_GRAMMAR_TENSE_EXTENSION.concepts]);\n} else { console.error('Load the original Tense data before its extension.'); }\n`);
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
fs.writeFileSync('tools/grammar-tense-extension-manifest.json',JSON.stringify({sourceHashes:{exercises:hash(exercises),curation:hash(curation)},conceptNumbers:concepts.map(c=>c.number),questionNumbers:questions.map(q=>q.number),coverage:concepts.map(({number,title,questionNumbers})=>({number,title,questionNumbers})),editorialNotes:['Original 52 concepts and 150 questions are loaded unchanged.','All source prompts, translations, answers and seven explanation steps are preserved.','Group focus instructions accompany individual questions and exports.','Collective-noun agreement variants accepted for Q155/156; past-perfect retrospective alternative accepted for Q185.','A second example for each concept is taken from its supplied exercises.']},null,2)+'\n');
console.log('Imported 9 concepts, 45 questions, 315 supplied explanation steps; both sources reconcile exactly.');
