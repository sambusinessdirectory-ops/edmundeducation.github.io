// Served only by listening-study-preview.mjs; never imported by the application.
(() => {
  if(location.hostname!=='127.0.0.1'||location.port!=='8765')throw new Error('Local QA only');
  const token='11111111-1111-4111-8111-111111111111',id='22222222-2222-4222-8222-222222222222';
  let bookmarks=[{item_key:'practice1:transcript:p1:line:10',title:'Part 1 錄音稿第 11 行',detail:'A saved transcript row',href:'listening-system.html?section=ielts&practice=1&part=1#transcript-title-1',difficulty:3,created_at:new Date().toISOString(),updated_at:new Date().toISOString()}, {item_key:'practice1:p2:t11:2:building',title:'building',detail:'Part 2 transcript vocabulary',href:'listening-system.html?section=ielts&practice=1&part=2',difficulty:null,created_at:new Date().toISOString(),updated_at:new Date().toISOString()}];
  const recordings=new Map();
  const profile={id,name:'QA Student',session_token:token};
  window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{user:{id}}}}),signOut:async()=>({})},rpc:async(name,args)=>{
    if(name==='learning_portal_list_bookmarks')return {data:bookmarks};
    if(name==='learning_portal_set_bookmark'){
      bookmarks=bookmarks.filter(b=>b.item_key!==args.p_item_key);
      if(args.p_bookmarked)bookmarks.push({item_key:args.p_item_key,title:args.p_title,detail:args.p_detail,href:args.p_href,created_at:new Date().toISOString(),updated_at:new Date().toISOString()});
      return {data:true};
    }
    return {data:[profile]};
  }})};
  const nativeFetch=window.fetch.bind(window), json=data=>Promise.resolve(new Response(JSON.stringify(data),{headers:{'Content-Type':'application/json'}}));
  window.fetch=(url,options={})=>{
    const value=String(url);
    if(value.includes('/v1/listening/catalog'))return json({tracks:Array.from({length:80},(_,i)=>({practice:Math.floor(i/4)+1,part:i%4+1,url:location.origin+'/qa-tone.wav'}))});
    if(!value.includes('/functions/v1/listening-study'))return nativeFetch(url,options);
    const route=new URL(value).pathname.split('/listening-study')[1];
    if(route==='/admin/login')return json({token,name:'QA Listening Admin'});
    if(route==='/admin/me')return json({name:'QA Listening Admin'});
    if(route==='/bookmarks'||route==='/admin/bookmarks')return json({rows:bookmarks.map(b=>({...b,flashcard_students:{name:'QA Student'}})),nextOffset:null});
    if(route==='/bookmarks/rating'){const body=JSON.parse(options.body);bookmarks.find(b=>b.item_key===body.itemKey).difficulty=body.difficulty;return json({difficulty:body.difficulty});}
    if(route==='/recordings'&&options.method==='POST'){
      const f=options.body,record={id:f.get('id'),title:f.get('title'),size_bytes:f.get('file').size,duration_ms:5000,storage_state:'ready',created_at:new Date().toISOString(),blob:f.get('file')};
      recordings.set(record.id,record);return json({saved:true,id:record.id});
    }
    if(route==='/recordings')return json({rows:[...recordings.values()],quota:{usedBytes:[...recordings.values()].reduce((s,r)=>s+r.size_bytes,0),maxBytes:104857600,maxFileBytes:3145728,maxDurationMs:300000}});
    const key=route.split('/')[2];
    if(options.method==='DELETE'){recordings.delete(key);return json({deleted:true});}
    if(recordings.has(key))return Promise.resolve(new Response(recordings.get(key).blob));
    return json({ok:true});
  };
  // A synthetic stream tests the genuine recorder/codec without capturing anyone's microphone.
  Object.defineProperty(navigator.mediaDevices,'getUserMedia',{value:async()=>{
    const context=new AudioContext(),source=context.createOscillator(),gain=context.createGain(),target=context.createMediaStreamDestination();
    source.frequency.value=220;gain.gain.value=.05;source.connect(gain).connect(target);source.start();await context.resume();
    const track=target.stream.getTracks()[0],stop=track.stop.bind(track);
    track.stop=()=>{stop();source.stop();void context.close();};
    return target.stream;
  }});
})();
