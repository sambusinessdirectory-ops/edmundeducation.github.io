import assert from 'node:assert/strict';
import {createSongLiveSync} from '../song-appreciation-live.mjs';
const original=Date.now;let now=100000;Date.now=()=>now;
const doc=new EventTarget();doc.hidden=false;
let c={owner:'mary',token:'mary',song:'song',mode:'standard',version:1,playing:true},calls=0,applied=[],offline=false,defer=false;
let row={revision:'1:',payload:{draft:{answers:{1:'light'}}}};
const sync=createSongLiveSync({environment:{document:doc,setInterval:()=>1,clearInterval(){}},context:()=>c,apply:p=>{if(defer)return false;applied.push(p);},rpc:async args=>{calls++;if(offline)throw Error('offline');return args.p_since===row.revision?{revision:row.revision}:row;}});
try{
 await sync.tick();assert.equal(calls,1);now+=499;await sync.tick();assert.equal(calls,1);now++;await sync.tick();assert.equal(calls,2);assert.equal(applied.length,1);
 now+=61000;await sync.tick();now+=500;await sync.tick();assert.equal(calls,4,'music keeps passive viewer at half-second playback cadence');
 defer=true;row={revision:'2:',payload:{draft:{answers:{1:'rain'}}}};now+=1000;await sync.tick();assert.equal(applied.length,1);defer=false;now+=1000;await sync.tick();assert.equal(applied.length,2,'unsaved local edits defer rather than discard the remote revision');
 offline=true;now+=1000;await sync.tick();const before=calls;now+=1000;await sync.tick();assert.equal(calls,before);offline=false;now+=1000;await sync.tick();
 doc.hidden=true;now+=60000;const hidden=calls;await sync.tick();assert.equal(calls,hidden);doc.hidden=false;c={...c,song:null};await sync.tick();assert.equal(calls,hidden);c={...c,owner:null,song:'song'};await sync.tick();assert.equal(calls,hidden);
 console.log('PASS song live transport: half-second playback cadence, playback keeps it fast, unchanged payloads, pending-edit deferral, offline backoff, hidden/exit/logout cleanup.');
}finally{sync.stop();Date.now=original;}
