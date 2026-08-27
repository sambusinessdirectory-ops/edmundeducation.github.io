// Local-only UI fixture. Never deploy; no real account, password or database writes.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../../', import.meta.url));
const catalog = JSON.parse(await fs.readFile(process.argv[2], 'utf8'));
const fixture = `
window.EDMUND_SUPABASE={url:'http://127.0.0.1:8768/fixture-db',anonKey:'local-fixture'};
window.EdmundSystemNav={getStudentSession:()=>({role:'student',token:'local-fixture'}),rememberStudentSession:()=>{},forgetStudentSession:()=>{}};
const originalFetch=window.fetch.bind(window);let fixtureBookmarks=[];
window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{user:{id:'fixture'}}}}),signOut:async()=>({})},rpc:async(name,args)=>{
 if(name==='learning_portal_set_bookmark'){
  fixtureBookmarks=fixtureBookmarks.filter(row=>row.item_key!==args.p_item_key);
  if(args.p_bookmarked)fixtureBookmarks.push({item_key:args.p_item_key,title:args.p_title,detail:args.p_detail,href:args.p_href,difficulty:null});
 }
 return {data:name==='flashcard_student_session_profile'?[{id:'fixture',name:'Local preview',session_token:'local-fixture'}]:fixtureBookmarks,error:null};
}})};
window.fetch=async(input,options)=>{
 const url=String(input);
 if(url.includes('/v1/listening/catalog'))return new Response(JSON.stringify(${JSON.stringify(catalog)}),{headers:{'Content-Type':'application/json'}});
 if(url.includes('/fixture-db/')){
  if(options?.method==='PATCH'){
   const value=JSON.parse(options.body);const row=fixtureBookmarks.find(row=>row.item_key===value.itemKey);if(row)row.difficulty=value.difficulty;
  }
  return new Response(JSON.stringify({rows:url.includes('/recordings')?[]:fixtureBookmarks,nextOffset:null,quota:{usedBytes:0,maxBytes:104857600}}),{headers:{'Content-Type':'application/json'}});
 }
 if(url.includes('supabase.co'))throw new Error('Live database requests are disabled in local preview');
 return originalFetch(input,options);
};`;
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.css':'text/css','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.mp3':'audio/mpeg'};
http.createServer(async(req,res)=>{
 try {
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(pathname==='/fixture-session.js'){
   res.writeHead(200,{'Content-Type':'text/javascript','Cache-Control':'no-store'});res.end(fixture);return;
  }
  const filename=path.resolve(root,'.'+pathname);
  if(!filename.startsWith(root)||pathname.includes('..')){res.writeHead(403);res.end();return;}
  let body=await fs.readFile(filename);
  if(pathname==='/listening-system.html'){
   body=body.toString().replace(/<script[^>]+src="[^"]*(?:supabase-js|supabase-config|shared-system-nav|pwa-register)[^"]*"[^>]*><\/script>/g,'');
   body=body.replace('<script type="module"','<script src="/fixture-session.js"></script><script type="module"');
  }
  res.writeHead(200,{'Content-Type':mime[path.extname(filename)]||'application/octet-stream','Cache-Control':'no-store'});res.end(body);
 }catch{res.writeHead(404);res.end('Not found');}
}).listen(8768,'127.0.0.1',()=>console.log('Local Listening preview: http://127.0.0.1:8768/listening-system.html?section=ielts&practice=2'));
