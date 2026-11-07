import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {localeForVoice,preferredDeviceVoice,speakWithDevice} from '../polysemy-lab/audio-fallback.mjs';

assert.equal(localeForVoice('american-female'),'en-US');
assert.equal(localeForVoice('british-male'),'en-GB');
const voices=[{name:'US',lang:'en-US'},{name:'UK',lang:'en-GB'}];
assert.equal(preferredDeviceVoice(voices,'en-GB').name,'UK');

class FakeUtterance { constructor(text){this.text=text;} }
const spoken=[];
let cancelled=0;
const synthesis={
  cancel(){cancelled+=1;},
  getVoices(){return voices;},
  speak(utterance){spoken.push(utterance);},
};
let ended=0;
const playback=speakWithDevice({text:'A blocked recording still speaks.',voiceHint:'british-female',synthesis,Utterance:FakeUtterance,onend:()=>ended++});
assert.ok(playback);
assert.equal(spoken.length,1);
assert.equal(spoken[0].lang,'en-GB');
assert.equal(spoken[0].voice.name,'UK');
assert.equal(spoken[0].rate,0.9);
spoken[0].onend();
assert.equal(ended,1);
playback.pause();
assert.equal(cancelled,1,'completed playback is not cancelled twice');
assert.equal(speakWithDevice({text:'',synthesis,Utterance:FakeUtterance}),null);

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const media=fs.readFileSync(path.join(root,'polysemy-lab/media.mjs'),'utf8');
const app=fs.readFileSync(path.join(root,'polysemy-lab/app.mjs'),'utf8');
const html=fs.readFileSync(path.join(root,'polysemy-lab.html'),'utf8');
assert.match(media,/useDeviceSpeech\(speechVoice/);
assert.match(media,/speakWithDevice\(/);
assert.match(media,/預錄音訊未能連線，已改用裝置語音/);
assert.match(app,/media\.mjs\?v=20261107-student-network1/);
assert.match(html,/app\.mjs\?v=20261107-student-network1/);

console.log('PASS: Polysemy falls back to the matching device English voice when public audio is blocked.');
