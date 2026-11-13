import assert from 'node:assert/strict';
import fs from 'node:fs';

const natural=fs.readFileSync('natural-english/app.mjs','utf8');
const flashcards=fs.readFileSync('flashcards.html','utf8');
const polysemy=fs.readFileSync('polysemy-lab/media.mjs','utf8');
const sharedSpeaking=fs.readFileSync('shared-speaking-practice.js','utf8');
const relay=fs.readFileSync('supabase/functions/public-audio-relay/index.ts','utf8');

assert.match(polysemy,/speakWithDevice/);
assert.match(polysemy,/預錄音訊未能連線，已改用裝置語音/);
assert.match(polysemy,/clip\.onerror=.*useDeviceSpeech/);

assert.match(natural,/function playDeviceVoice\(/);
assert.match(natural,/voiceAudio\.onerror=fallback/);
assert.match(natural,/catch\{fallback\(\);\}/);
assert.match(natural,/SpeechSynthesisUtterance/);
assert.match(natural,/AbortSignal\.timeout\(30000\)/);

assert.match(flashcards,/function playFlashcardDeviceSpeech\(/);
assert.match(flashcards,/if \(!path\)[\s\S]*playFlashcardDeviceSpeech\(text, requestId\)/);
assert.match(flashcards,/Neural audio playback failed:[\s\S]*playFlashcardDeviceSpeech\(text, requestId\)/);
assert.match(flashcards,/speechSynthesis\.cancel\(\)/);

assert.match(sharedSpeaking,/function fallbackVoice\(/);
assert.match(sharedSpeaking,/SpeechSynthesisUtterance/);
assert.match(sharedSpeaking,/VOICE_REQUEST_TIMEOUT_MS = 30_000/);
assert.match(sharedSpeaking,/Learning voice playback failed[\s\S]*fallbackVoice\(normalized, button\)/);
for(const portal of ['phrasal-verb-system.html','idiom-system.html','sentence-structure.html','proverb-system.html']){
 const html=fs.readFileSync(portal,'utf8');
 assert.match(html,/shared-speaking-practice\.js/);
}

assert.match(relay,/const NEURAL_AUDIO_ORIGIN = "https:\/\/edmund-neural-audio\.edmundeducation\.workers\.dev"/);
assert.match(relay,/const PUBLIC_MEDIA_ORIGIN = "https:\/\/edmund-public-media\.edmundeducation\.workers\.dev"/);
assert.match(relay,/const PUBLIC_FUNCTION_PATH = "\/functions\/v1\/public-audio-relay"/);
assert.match(relay,/const LISTENING_CATALOG_PATH = "v1\/listening\/catalog"/);
assert.match(relay,/\["range", "if-none-match", "if-modified-since"\]/);
assert.match(relay,/request\.method !== "GET" && request\.method !== "HEAD"/);
assert.match(relay,/decodedPath === LISTENING_CATALOG_PATH/);
assert.match(relay,/\? \{ origin: NEURAL_AUDIO_ORIGIN, path: LISTENING_CATALOG_PATH \}/);
assert.match(relay,/isListeningCatalog[\s\S]*?max-age=300, stale-while-revalidate=3600/);
assert.match(relay,/replaceAll\(NEURAL_AUDIO_ORIGIN, relayBaseUrl\(request\.url\)\)/);
assert.match(relay,/headers\.delete\("Content-Length"\)/);
assert.match(relay,/headers\.delete\("ETag"\)/);
assert.match(relay,/!AUDIO_EXTENSION\.test\(upstreamPath\)/);
assert.match(relay,/"IELTS Listening - Recordings\/"/);
assert.match(relay,/"DSE Listening - Recordings\/"/);
assert.match(relay,/NEURAL_AUDIO_PATH_PREFIXES\.some/);
assert.doesNotMatch(relay,/!upstreamPath\.startsWith\("assets\/"\)/);
assert.doesNotMatch(relay,/request\.headers\.get\(["']authorization["']\)/i);

for(const workflow of [
 '.github/workflows/pages.yml',
 '.github/workflows/pages-fast.yml',
 '.github/workflows/pages-paper3-fast.yml',
]){
 const source=fs.readFileSync(workflow,'utf8');
 assert.match(source,/--audio-origin "https:\/\/ookkxzgpdclzrrhfmvqx\.supabase\.co\/functions\/v1\/public-audio-relay\/public"/);
 assert.match(source,/--neural-audio-origin "https:\/\/ookkxzgpdclzrrhfmvqx\.supabase\.co\/functions\/v1\/public-audio-relay"/);
}

for(const portal of ['natural-english.html','advanced-native.html']){
 const html=fs.readFileSync(portal,'utf8');
 assert.match(html,/natural-english\/app\.mjs\?v=20261111-audio-reliability1/);
}

for(const portal of ['phrasal-verb-system.html','idiom-system.html','sentence-structure.html','proverb-system.html']){
 const html=fs.readFileSync(portal,'utf8');
 assert.match(html,/shared-speaking-practice\.js\?v=20261111-audio-reliability1/);
}

console.log('PASS: all audio delivery routes use the school-accessible relay or a tested device-voice fallback.');
