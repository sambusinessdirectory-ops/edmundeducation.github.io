// Local-only browser QA: synthetic accounts, bookmarks and microphone tone.
// Nothing is written to the production database. Never load the fixture on the live site.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const fixture=fs.readFileSync(new URL('./listening-study-fixture.js',import.meta.url));
const rate=8000, samples=rate*600, wav=Buffer.alloc(44+samples*2);
wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(rate,24);wav.writeUInt32LE(rate*2,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(samples*2,40);
for(let i=0;i<samples;i++)wav.writeInt16LE(Math.round(Math.sin(2*Math.PI*220*i/rate)*1000),44+i*2);
http.createServer((req,res)=>{
  const url=new URL(req.url,'http://127.0.0.1');
  if(url.pathname==='/qa-fixture.js'){res.setHeader('Content-Type','text/javascript');return res.end(fixture);}
  let bytes,type;
  if(url.pathname==='/qa-tone.wav'){bytes=wav;type='audio/wav';}
  else {
    const file=path.resolve(root,'.'+decodeURIComponent(url.pathname));
    if(!file.startsWith(root)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.statusCode=404;return res.end();}
    bytes=fs.readFileSync(file); type=({'.js':'text/javascript','.mjs':'text/javascript','.html':'text/html','.css':'text/css','.png':'image/png','.webp':'image/webp'})[path.extname(file)]||'application/octet-stream';
    if(url.pathname==='/listening-system.js')bytes=Buffer.from(bytes.toString().replace('/^https:\\/\\//i.test(url)','/^https?:\\/\\//i.test(url)'));
    if(url.pathname==='/listening-system.html')bytes=Buffer.from(bytes.toString().replace(/<script src="https:\/\/cdn.jsdelivr.net\/npm\/@supabase[^>]*><\/script>/,'<script src="/qa-fixture.js"></script>').replace('<body>','<body><div style="background:#fff0b8;padding:10px;text-align:center">LOCAL QA · Synthetic student and audio · No live data</div>'));
  }
  res.setHeader('Content-Type',type);res.setHeader('Cache-Control','no-store');res.setHeader('Accept-Ranges','bytes');
  const match=req.headers.range?.match(/bytes=(\d+)-(\d*)/);
  if(match){const start=Number(match[1]),end=match[2]?Math.min(Number(match[2]),bytes.length-1):bytes.length-1;res.writeHead(206,{'Content-Range':`bytes ${start}-${end}/${bytes.length}`,'Content-Length':end-start+1});return res.end(bytes.subarray(start,end+1));}
  res.setHeader('Content-Length',bytes.length);res.end(bytes);
}).listen(8765,'127.0.0.1',()=>console.log('Listening local QA: http://127.0.0.1:8765/listening-system.html'));
