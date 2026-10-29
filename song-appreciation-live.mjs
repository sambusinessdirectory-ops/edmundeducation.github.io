// Read saved choices without changing playback or writing duplicate drafts.
export function createSongLiveSync({context,rpc,apply,environment=globalThis}) {
 const env=environment,doc=env.document,now=()=>Date.now();
 let key='',since='',busy=false,next=0,lastActivity=now(),failures=0,stopped=false;
 const identity=c=>c?.owner&&c?.token&&c?.song&&c?.mode?`${c.owner}:${c.token}:${c.song}:${c.mode}:${c.version}`:'';
 const activity=()=>{lastActivity=now();};
 const resume=()=>{next=0;activity();void tick();};
 async function tick(){
  if(stopped||busy||doc.hidden)return;
  const c=context(),requestKey=identity(c);
  if(requestKey!==key){key=requestKey;since='';next=0;activity();}
  if(!key||now()<next)return;
  const started=now();busy=true;
  try{
   const result=await rpc({p_student_token:c.token,p_song_id:c.song,p_mode_id:c.mode,p_exercise_version:c.version,p_since:since});
   if(stopped||identity(context())!==requestKey)return;
   if(result?.revision!==undefined){
    if(result.payload){if(await apply(result.payload)===false){next=now()+1000;return;}activity();}
    since=String(result.revision);
   }
   failures=0;
   // Use half-second reads during music playback; one second for other recent activity.
   next=Math.max(started+(c.playing?500:now()-lastActivity<60000?1000:15000),now());
  }catch{next=now()+Math.min(30000,1000*2**Math.min(++failures,5));}
  finally{busy=false;}
 }
 for(const event of ['pointerdown','keydown'])doc.addEventListener(event,activity,{passive:true});
 doc.addEventListener('visibilitychange',resume);env.addEventListener?.('online',resume);
 const timer=env.setInterval(()=>void tick(),250);
 return {tick,refresh:resume,stop(){stopped=true;env.clearInterval(timer);for(const e of ['pointerdown','keydown'])doc.removeEventListener(e,activity);doc.removeEventListener('visibilitychange',resume);env.removeEventListener?.('online',resume);}};
}
