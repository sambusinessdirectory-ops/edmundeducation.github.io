const assert=require('assert/strict'),fs=require('fs'),path=require('path');const sharp=require(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
(async()=>{const {MASCOT_VIEWS}=await import('../speaking-mascot-views.mjs');const {TROPHY_ART}=await import('../horsey-trophy-art.mjs');for(const name of ['noir','celeste']){
 const d=MASCOT_VIEWS[name].standing;assert.notEqual(d.image,d.blinkImage,name+' must have actual closed eyes');
 const base='assets/speaking-system/mascots/v4/';const a=await sharp(base+d.image).raw().toBuffer(),b=await sharp(base+d.blinkImage).raw().toBuffer();let changes=0;
 for(let p=0;p<a.length;p+=4){assert.equal(a[p+3],b[p+3],'blinking preserves alpha silhouette');if(a[p]!==b[p]||a[p+1]!==b[p+1]||a[p+2]!==b[p+2]){changes++;const y=Math.floor(p/4/1024)%256;assert.ok(y<140,'blink must not change body or feet');}}
 assert.ok(changes>200&&changes<30000,name+' changes only visible eye areas');
 const files=[TROPHY_ART[name].map,TROPHY_ART[name].metals.silver,TROPHY_ART[name].metals.bronze];assert.equal(new Set(files).size,3);
 for(const file of files){const m=await sharp(file).metadata();assert.equal(m.hasAlpha,true,file);assert.equal(m.width,512);const data=await sharp(file).raw().toBuffer();assert.equal(data[3],0,'background corner is transparent');assert.ok(fs.statSync(file).size>10000);}
 console.log('PASS',name,changes,'eye pixels and three transparent trophy tiers');
}})();
