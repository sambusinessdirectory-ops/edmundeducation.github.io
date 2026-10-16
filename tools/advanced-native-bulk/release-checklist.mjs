#!/usr/bin/env node
// Evidence register only. Partial automated evidence never approves a release.
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(process.argv[2]||'work/advanced-native-full-20261016');
const read=f=>{try{return JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));}catch{return null;}};
const progress=read('progress.json'),sources=read('source-reconciliation.json');
if(!progress)throw Error('Run progress.mjs first.');
const checks=[];
function add(id,requirement,status,evidence=[],scope='Whole requested course remains the release scope.'){
 checks.push({id,requirement,status,evidence,scope});
}
const pending=(id,text,evidence=[])=>add(id,text,'pending',evidence);
const partial=(id,text,evidence,scope)=>add(id,text,'partial-evidence',evidence,scope);
partial('SRC01','Reconcile every supplied PDF page, expression and occurrence.', ['sources/expressions.json','sources/occurrences.json','source-reconciliation.json'],`${progress.uniqueSourceLabels} source labels; ${progress.sourceOccurrences} occurrences; ${sources?.summary.pendingOccurrences??'unknown'} occurrences still awaiting completed canonical ownership.`);
partial('SRC02','Preserve exact source sentence, complete expression, document checksum, real page, book/question/S1–S2 and honest missing locators.',['source-reconciliation.json'],`${sources?.summary.errors??'unknown'} current reconciliation errors; this does not certify all undrafted items.`);
partial('SRC03','Distinguish original sample sentences from guide-written practice examples.',['sources/occurrences.json'], 'Source kind is stored per occurrence; guide examples must never be described as original online answers.');
partial('SRC04','Merge exact variants without losing provenance; split genuine senses and retain useful related constructions.',['drafts/aliases-*.json','reviews/sense-split-*.json','source-reconciliation.json'],`${progress.aliasesMapped} aliases currently recorded; later labels remain under curation.`);
partial('SRC05','Resolve doubtful meaning, grammar, register and taxonomy against primary language references.',['reviews/'], 'Specific disputed expressions have individually recorded decisions; not a blanket dictionary approval.');
partial('CUR01','Write one complete meaning/grammar/register/boundary/misconception/outcome brief per canonical lesson.',['drafts/batch-*.json','validation-current.json'],`${progress.savedDraftLessons} current drafts; structural presence does not prove language quality.`);
partial('CUR02','Provide seven ordered actions and six assessed questions with optional, unscored speaking.',['validation-current.json','qa/test-advanced-816.log'], 'Current draft schema and staged subset checks; final complete catalogue pending.');
partial('CUR03','Tailor listening context, four meaning choices, one key and specific feedback.',['editorial-coverage.json','reviews/independent*.json'],`${progress.aiEditorialReviewedCurrentRevision} exact current records have separate AI editorial evidence; no human approval claimed.`);
partial('CUR04','Make all four reply options naturally valid, exactly one target-bearing and golden.',['validation-current.json','editorial-coverage.json'], 'Structural target count plus individual AI pragmatic review; pending drafts retain no implicit pass.');
partial('CUR05','Write a new concrete scene, one defensible best answer and plausible alternatives.',['editorial-coverage.json','reviews/'], 'Repeated generic alternatives and ambiguous keys are returned for repair.');
partial('CUR06','Test a real boundary without inventing a restriction or rejecting a valid meaning.',['editorial-coverage.json','reviews/'], 'Source-specific figurative/literal distinctions reviewed per record.');
partial('CUR07','Write a natural next turn with consistent speaker, tone and purpose; do not mark legitimate clarification questions wrong.',['editorial-coverage.json','reviews/'], 'Current AI reviewed revisions only.');
partial('CUR08','Make final writing change the setting/task/communicative goal; reject name swaps.',['editorial-coverage.json','reviews/'], 'Separate editorial passes have required and reread transfer-task rewrites; full remaining catalogue pending.');
partial('CUR09','Supply two complete appropriate writing answers and useful self-check criteria; no exact-match or mastery claim.',['validation-current.json','qa/preview-523-final-webkit/result.json'], 'Draft structure plus staged interaction evidence.');
partial('CUR10','Extract 4–6 useful glossary rows as exact contiguous answer spans; exclude target and revealing fragments.',['validation-current.json','tools/advanced-native-bulk/test.mjs'], `${progress.structuralErrors} current structural errors; every answer edit invalidates old spans until checked.`);
partial('CUR11','Preserve natural tense/person/passive/article forms in target regex and exact target-only speaking span.',['validation-current.json','tools/advanced-native-bulk/test.mjs'], 'Current drafts validated; final all-lesson runtime match checks pending.');
partial('CUR12','Write original models and diverse scenarios, screening exact/near duplication without treating similarity as automatic deletion.',['reviews/','tools/advanced-native-bulk/near-duplicates.mjs'], 'Run source-verbatim and near-duplicate screens again against final canonical snapshot.');
partial('ZH01','Translate every English question, option, model, writing answer and takeaway in Traditional Chinese.',['validation-current.json','editorial-coverage.json'], 'Structural coverage plus individual AI English–Chinese comparison; no human language approval.');
partial('ZH02','Preserve subject, tense, uncertainty, negation, modality and the wrong meaning of each distractor.',['reviews/','editorial-coverage.json'], 'Current independently AI-reviewed revisions only.');
partial('ZH03','Pair translations by stable content identity after shuffling; bracket beneath English with no orphan closing bracket.',['qa/preview-523-final-webkit/result.json','reviews/browser-523-bounded-coverage.json'], '523 earlier staged lessons checked in both browser engines; expanded/current final coverage pending.');
partial('UI01','Conceal first-listening transcript/translation until correct; keep wrong attempts retryable.',['reviews/browser-523-bounded-coverage.json'], 'Local synthetic sessions only.');
partial('UI02','Keep four-valid replies reselectable, correct sounding, golden after selection and credited once.',['reviews/browser-523-bounded-coverage.json'], 'Local browser evidence; full final catalogue and live checks pending.');
partial('UI03','Play full British male model before optional recording/skip; preserve exact blank cue.',['qa/audio-browser/','reviews/browser-523-bounded-coverage.json'], 'Pinned bm_fable and browser flow checked; real-device listening remains pending.');
partial('UI04','Show glossary before typing; reveal examples only after an attempt and complete through explicit self-review.',['reviews/browser-523-bounded-coverage.json'], '523 staged lessons; final expanded content pending.');
partial('UI05','Use yellow target marks/glow in examples and green in revealed models, never in unanswered choices or Chinese.',['reviews/browser-523-bounded-coverage.json'], 'Automated DOM/style evidence on staged subset.');
partial('UI06','Show negative cues red and start final Chinese question on a sensible new line.',['natural-english/advanced-display.mjs','reviews/browser-523-bounded-coverage.json'], 'Shared rendering and earlier content checked; all later prompts still need coverage.');
partial('UI07','Prevent orphan final English word, lone CJK character, closing punctuation/bracket, split word, clipping and overflow.',['reviews/browser-523-bounded-coverage.json'], 'Six widths1280/1024/768/600/390/320 in Chromium/WebKit; automated geometry does not prove every physical device.');
partial('UI08','Keep Card74 exact four-line identity, image-free cards and quiet background with no beams/spheres.',['qa/test-advanced-816.log'], 'Existing accepted identity and local automated guard; final screenshots pending.');
partial('UI09','Keep full groups of five: odd3white+2black, even2black+3white; preserve DOM/data order.',['reviews/capacity-2110.json'], 'Synthetic2110-card capacity fixture; not2110 authored lessons.');
partial('UI10','Review partial final groups without fake lessons, hidden cards or reordered content.',['qa/partial-groups/result.json'], 'All16 one-to-four-card/palette/browser cases pass six widths; representative desktop and unobscured mobile screenshots inspected by AI root. No physical-device approval.');
partial('UI11','Use readable white completion, dark copy, completed count, bilingual takeaways and working actions.',['reviews/browser-523-bounded-coverage.json'], 'All523 staged completion screens checked; final/current remainder pending.');
pending('A11Y01','Verify keyboard, visible focus, touch targets, reduced motion, live status and microphone denial on supported devices.');
partial('SND01','Emit one shared answer-result event after marking only, respecting mute; no false objective sound for open writing.',['reviews/browser-523-bounded-coverage.json'], 'Browser oscillator/event evidence exists; real-device audible confirmation pending.');
pending('SND02','Listen to correct/wrong cues, mute/unmute and rapid taps on real supported desktop and phone/tablet.');
partial('AUD01','Pin Kokoro/voice hashes, four explicit roles, exact text/settings identities and British male speaking role.',['audio-state/metadata.json','tools/advanced-native-bulk/audio.py'], 'Current generated metadata, not proof that every latest canonical model has audio.');
partial('AUD02','Generate and upload only missing/changed clips with resumable checkpoints; keep MP3 binaries out of Git.',['audio-state/','audio-state/r2-uploaded.json'], 'Generation/upload continues; obsolete immutable objects are retained for rollback.');
partial('AUD03','Verify every final public clip by exact bytes, MIME, CORS, immutable cache and range support.',['reviews/public-audio-*.json'], 'Use report metadata for exact checked frozen batch; final current batch pending.');
partial('AUD04','Fully decode every clip and reject corrupt, silent or non-finite audio.',['reviews/audio-signal-*.json'], '3528-clip frozen batch passed; not human hearing/accent approval.');
partial('AUD05','Run speech-content screening, inspect flags and never confuse ASR with pronunciation/accent certification.',['reviews/audio-asr-*.json'], 'ASR comparisons and unresolved flag triage are recorded separately.');
pending('AUD06','Listen to every new/changed clip for wording, pronunciation, accent, pacing and clipping; record actual reviewer.');
pending('AUD07','Check normal/slow playback, replay, repeated taps, interruption and lesson switching on desktop and phone/tablet.',['qa/audio-browser/']);
partial('DAT01','Preserve existing ten lessons, stable IDs, legacy questions/options, Native course and student history.',['qa/test-advanced-816.log','tools/test-natural-english-modules.mjs'], 'Local evidence; compatible final server catalogue and live regression pending.');
partial('DAT02','Keep writing self-reviewed, speaking unscored, one completion per question/run and owner-scoped recordings.',['tools/test-natural-english-modules.mjs','reviews/browser-523-bounded-coverage.json'], 'Synthetic database/browser evidence only; never used a real student to fabricate completion.');
pending('DAT03','Verify outbox/reload/retry/storage-failure handling preserves typed input and does not claim an unsaved cloud record.');
partial('SCL01','Keep all lessons discoverable with sharded lazy content, stable partitions, cache retry and stale-account/selection cancellation.',['tools/advanced-native-bulk/test-lazy.mjs','reviews/lazy-browser-144.json'], 'Earlier local six-case lazy-flow check; rerun on final catalogue.');
partial('SCL02','Measure real index/full content bytes, initial requests, render/search time and hosting usage.',['reviews/capacity-2110.json','staging/'], 'Synthetic capacity and actual builder measurements distinguished; owner approved Cloudflare usage beyond free10GB.');
partial('SCL03','Retain canonical content, exact review hashes, source-only transformation proof, audio keys and reproducible batch snapshots.',['drafts/','reviews/','staging/'], 'Persistently mirror production records; do not rerun stale author scripts over peer repairs.');
pending('REL01','Reconcile all source labels/occurrences to live canonical records, aliases or explicitly resolved holds.');
pending('REL02','Close all blocking editorial, media, interaction and typography defects on exact final revision.');
pending('REL03','Create formal Supabase migration with CLI; apply compatible catalogue before frontend; verify all valid replies and old progress.');
pending('REL04','Fetch/reconcile current main, inspect selected diff, exclude private scratch/student data/secrets and audio binaries.');
pending('REL05','Version every changed entrypoint and nested cached dependency; run complete focused release gates.');
pending('REL06','Commit/push, wait for successful Pages deployment and verify public release.json contains intended change.');
pending('REL07','Open live signed-in test lessons, verify assets and standard Native regression, record URLs/screenshots/commit and rollback plan.');
pending('REL08','Record actual owner/reviewer acceptance and exceptions separately; never label push, compilation or this checklist as completion.');
// Keep subset evidence current without promoting a local pass to whole-course
// or device approval. Old reports remain available for exact inheritance.
const reviewDir=path.join(root,'reviews');
const browserReports=fs.readdirSync(reviewDir).filter(f=>/^browser-\d+-combined-coverage\.json$/.test(f)).map(f=>({file:'reviews/'+f,value:read('reviews/'+f)})).filter(r=>r.value?.result==='passed-with-explicit-exact-content-inheritance').sort((a,b)=>Date.parse(b.value.recordedAt)-Date.parse(a.value.recordedAt));
if(browserReports.length){
 const latest=browserReports[0],total=latest.value.totalCoveredIncludingBaseline;
 for(const check of checks){
  if(check.evidence.some(e=>e.includes('browser-523')||e.includes('preview-523-final-webkit'))){
   check.evidence=check.evidence.map(e=>e.includes('browser-523')||e.includes('preview-523-final-webkit')?latest.file:e).filter((e,i,a)=>a.indexOf(e)===i);
   check.scope=`Exact locally staged ${total}-lesson selection, using the report’s explicitly unchanged-content inheritance and full seven-step/six-width changed-record checks in both engines. Final full source coverage, physical devices and live release remain pending.`;
  }
 }
}
const signals=fs.readdirSync(reviewDir).filter(f=>/^audio-signal-\d+\.json$/.test(f)).map(f=>({file:'reviews/'+f,value:read('reviews/'+f)})).filter(r=>r.value?.failed===0).sort((a,b)=>(b.value.checked||0)-(a.value.checked||0));
if(signals.length){const check=checks.find(c=>c.id==='AUD04');check.evidence=[signals[0].file];check.scope=`${signals[0].value.checked} clips in the exact frozen batch fully decoded and signal-checked; not hearing, pronunciation or accent approval.`;}
const originality=read('source-originality-audit.json'),duplicates=read('near-duplicate-review.json');
if(originality){const check=checks.find(c=>c.id==='CUR12');check.evidence.push('source-originality-audit.json');check.scope=`Exact whole-text source-equality screen: ${originality.lessons} lessons, ${originality.flags.length} flags. This does not prove semantic diversity or detect every copied subsection; individual editorial review and final rerun remain required.`;}
const report={generatedAt:new Date().toISOString(),sop:'Advanced_Native_Complete_Golden_SOP_2026-10-16.docx',scope:'All supplied expressions; preserve approved baseline.',checks,productionCounts:progress,completionApproved:false,humanApprovalClaimed:false,liveNewLessons:progress.newLessonsLive};
fs.writeFileSync(path.join(root,'release-checklist.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({requirements:checks.length,pending:checks.filter(c=>c.status==='pending').length,partialEvidence:checks.filter(c=>c.status==='partial-evidence').length,releaseApproved:false}));
