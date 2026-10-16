import importedIndex from './advanced-imported.generated.mjs?v=20261016-full-course-v1';

// Keep full lesson payloads out of the shared catalogue. Successful shards are
// cached; failed fetches can be retried without retaining a rejected promise.
export function createAdvancedExpressionLoader({index=importedIndex,importer=url=>import(url),baseUrl=import.meta.url}={}){
 const byId=new Map(index.map(record=>[record.id,record]));
 const pending=new Map(),loaded=new Map(),attempts=new Map();
 async function load(id){
  const entry=byId.get(id);if(!entry)return null;
  if(!entry.advancedLazy)return entry;
  const path=entry.contentShard;if(!path)throw Error('Missing Advanced Native content shard.');
  if(loaded.has(path))return loaded.get(path).get(id);
  let task=pending.get(path);
  if(!task){
   const attempt=attempts.get(path)||0;attempts.set(path,attempt+1);
   const url=new URL(path,baseUrl);if(attempt)url.searchParams.set('retry',String(attempt));
   task=Promise.resolve().then(()=>importer(url.href)).then(namespace=>{
    const records=namespace.default;
    if(!Array.isArray(records))throw Error('Invalid Advanced Native content shard.');
    const expected=index.filter(record=>record.contentShard===path),map=new Map();
    for(const record of records){
     if(!record?.id||map.has(record.id)||byId.get(record.id)?.contentShard!==path)throw Error('Unexpected lesson in Advanced Native content shard.');
     map.set(record.id,record);
    }
    if(expected.length!==map.size||expected.some(record=>!map.has(record.id)))throw Error('Incomplete Advanced Native content shard.');
    loaded.set(path,map);return map;
   }).finally(()=>pending.delete(path));
   pending.set(path,task);
  }
  return (await task).get(id);
 }
 return {load,loadedShardCount:()=>loaded.size,pendingShardCount:()=>pending.size};
}
const loader=createAdvancedExpressionLoader();
export const loadAdvancedExpression=id=>loader.load(id);
