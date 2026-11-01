const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const code = fs.readFileSync('speaking-microphone-check.js', 'utf8');
function setup(amplitude = 0) {
  let tick, time = 0, warnings = 0, closed = 0, active = true;
  class AudioContext {
    state = 'running';
    createMediaStreamSource() { return { connect() {}, disconnect() {} }; }
    createAnalyser() { return { fftSize: 2048, getFloatTimeDomainData(a) { for (let i=0;i<a.length;i++) a[i]=amplitude * Math.sin(i); } }; }
    resume() { return Promise.resolve(); }
    close() { closed++; this.state='closed'; return Promise.resolve(); }
  }
  const window = { AudioContext };
  vm.runInNewContext(code, { window, Float32Array, performance:{now:()=>time}, setInterval(fn){tick=fn;return 1;}, clearInterval(){tick=null;} });
  const stop=window.EdmundSpeakingMicrophoneCheck({}, {isActive:()=>active,onQuiet:()=>warnings++});
  return { run(n){for(let i=0;i<n;i++){time+=50;tick?.();}}, pause(){active=false;}, stop, get warnings(){return warnings;}, get closed(){return closed;} };
}
test('silence warns once after two active seconds',()=>{const h=setup();h.run(39);assert.equal(h.warnings,0);h.run(1);assert.equal(h.warnings,1);h.run(100);assert.equal(h.warnings,1);assert.equal(h.closed,1);});
test('audible waveform avoids warning and releases analyser',()=>{const h=setup(.04);h.run(45);assert.equal(h.warnings,0);assert.equal(h.closed,1);});
test('paused recording does not trigger warning',()=>{const h=setup();h.run(10);h.pause();h.run(60);assert.equal(h.warnings,0);h.stop();});
test('cancelled recording never warns later',()=>{const h=setup();h.run(10);h.stop();h.run(60);assert.equal(h.warnings,0);});
