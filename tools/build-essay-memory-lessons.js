// Generate exact bilingual sentence/audio records for every IELTS model essay.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.resolve(__dirname, '..');
const context = { window: {} };
const essayFiles = fs.readdirSync(root).filter(name => name === 'writing-practice-model-essay-106-data.js' || name === 'writing-practice-ielts-task1-data.js' || /^writing-practice-model-essays-.*-data\.js$/.test(name));
for (const file of [...essayFiles, 'writing-audio-manifest.js']) vm.runInNewContext(fs.readFileSync(path.join(root, file), 'utf8'), context, {filename:file});
const curated = new Set(['opinion:80','opinion:3','discuss-both-views:4','cause-solution:2']);
const tokenize = text => [...text.matchAll(/[\p{L}\p{N}]+(?:[-’'][\p{L}\p{N}]+)*/gu)].map(match => match[0]);
const lessons = {};
const catalog = [];
const outputDir = path.join(root,'essay-memory-lessons');
fs.mkdirSync(outputDir,{recursive:true});
const sources = Object.values(context.window).flatMap(collection => collection && typeof collection === 'object' && !Array.isArray(collection)
  ? Object.values(collection).filter(item => /^IELTS Writing Task [12]$/.test(item?.exam || '') && /^model-essay-/.test(item.id || '')) : []);
for (const source of sources) {
  const task2 = /^model-essay-(\d+)-ielts-(opinion|advantage-disadvantage|cause-solution|direct-question|discuss-both-views)$/.exec(source.id);
  const task1 = /^model-essay-(\d+)-ielts-task1-(bar-charts|line-graph|pie-charts|process-diagram|maps|tables|mixed-charts)$/.exec(source.id);
  if (!task2 && !task1) throw Error(`Unknown essay ID: ${source.id}`);
  const key = task2 ? `${task2[2]}:${task2[1]}` : `task1-${task1[2]}:${task1[1]}`;
  const id = source.id;
  if (lessons[key]) throw Error(`Duplicate essay key: ${key}`);
  const narration = context.window.EDMUND_WRITING_AUDIO?.[id];
  if (!source || !narration?.path || !Array.isArray(narration.words)) throw Error(`Missing canonical source/audio: ${id}`);
  const lines = source.translationSections.flatMap((section, paragraph) => section.items.map((item, index) => ({
    paragraph, index, role: item.label, english: item.english, chinese: item.chinese,
  })));
  if (lines.length < (task1 ? 8 : 10) || lines.some(line => !line.english || !line.chinese || !line.role)) throw Error(`Incomplete bilingual essay: ${key}`);
  const tokens = lines.flatMap(line => tokenize(line.english));
  if (tokens.length !== narration.words.length || tokens.some((word, index) => word !== narration.words[index][0])) {
    throw Error(`Narration differs from canonical essay: ${id}`);
  }
  let cursor = 0;
  const sentences = lines.map(line => {
    const count = tokenize(line.english).length;
    const words = narration.words.slice(cursor, cursor + count);
    const next = narration.words[cursor + count];
    cursor += count;
    return {
      ...line, words,
      start: Math.max(0, words[0][1] - 0.16),
      end: next ? Math.max(words.at(-1)[2], next[1] - 0.08) : words.at(-1)[2] + 0.4,
    };
  });
  const medium = source.practiceDifficultySets.find(set => set.key === 'medium');
  if (!medium?.answers?.length) throw Error(`Missing medium blanks: ${id}`);
  if (task1 && (!Array.isArray(source.questionImages) || source.questionImages.length === 0 ||
      source.questionImages.some(image => !image.src || !image.alt || !fs.existsSync(path.join(root,image.src)))))
    throw Error(`Missing Task 1 visual prompt: ${id}`);
  lessons[key] = { id, key, title: source.title, exam:source.exam, taskType:source.taskType,
    ...(task1 ? {questionImages:source.questionImages} : {}),
    question: source.questionPrompt,
    audio: narration.path, sentences, mediumAnswers: medium.answers };
  catalog.push({key,id,title:source.title,exam:source.exam,taskType:source.taskType,question:source.questionPrompt.join(' '),
    sentenceCount:sentences.length,paragraphCount:source.translationSections.length,curated:curated.has(key)});
  if (!curated.has(key)) fs.writeFileSync(path.join(outputDir,`${id}.js`),
    `/* Exact canonical source, translation and narration. */\nwindow.ESSAY_MEMORY_LESSONS=window.ESSAY_MEMORY_LESSONS||{};window.ESSAY_MEMORY_LESSONS[${JSON.stringify(key)}]=${JSON.stringify(lessons[key])};\n`);
}
if (catalog.length !== 288 || catalog.filter(item=>item.exam==='IELTS Writing Task 1').length !== 60 || catalog.filter(item=>item.exam==='IELTS Writing Task 2').length !== 228)
  throw Error(`Expected 60 Task 1 and 228 Task 2 model essays; found ${catalog.length}`);
const selected = Object.fromEntries([...curated].filter(key => key !== 'opinion:80').map(key => [key,lessons[key]]));
fs.writeFileSync(path.join(root, 'essay-memory-lessons-data.js'),
  `/* Generated from the canonical writing-practice essays and narration. */\nwindow.ESSAY_MEMORY_LESSONS = ${JSON.stringify(selected,null,2)};\n`);
fs.writeFileSync(path.join(root,'essay-memory-catalog.js'),
  `/* Canonical IELTS Task 1 and Task 2 essay index. */\nwindow.ESSAY_MEMORY_CATALOG=${JSON.stringify(catalog.sort((a,b)=>a.exam.localeCompare(b.exam)||a.taskType.localeCompare(b.taskType)||Number(a.key.split(':')[1])-Number(b.key.split(':')[1])))};\n`);
console.log(`Built ${catalog.length} essays, including ${catalog.length-curated.size} individual lesson files.`);
