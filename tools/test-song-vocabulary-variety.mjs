import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(new URL('./email-qa/package.json',import.meta.url));
const {PGlite}=require('@electric-sql/pglite');
const db=new PGlite();
await db.exec(`create role anon;create role authenticated;
create table flashcard_students(id uuid primary key);
create table song_appreciation_songs(id uuid primary key, title text,published boolean,translations jsonb default '[]'::jsonb);
create function _song_appreciation_student_id(uuid) returns uuid language sql as $$select id from public.flashcard_students where id=$1$$;
create function _song_appreciation_admin_id(uuid) returns uuid language sql as $$select case when $1='00000000-0000-4000-8000-000000000099' then $1 end$$;
create function _song_appreciation_student_can_access(uuid,uuid) returns boolean language sql as $$select exists(select 1 from public.song_appreciation_songs where id=$2 and published) and $1 is not null$$;`);
await db.exec(fs.readFileSync('supabase/migrations/20261028090623_song_album_media_vocabulary.sql','utf8'));
await db.exec(fs.readFileSync('supabase/migrations/20261028091757_song_media_domain_validation.sql','utf8'));
await db.exec(fs.readFileSync('supabase/migrations/20261028133224_song_lyrics_discovery_index.sql','utf8'));
const id=n=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0');
await db.query('insert into flashcard_students values($1)',[id(1)]);
const songs=fs.readdirSync('tools/song-content').filter(x=>x.endsWith('.json')).map(x=>JSON.parse(fs.readFileSync('tools/song-content/'+x)));
let checked=0;
for(const [index,song] of songs.entries()){
 await db.query('insert into song_appreciation_songs(id,title,published,vocabulary) values($1,$2,true,$3)',[id(index+10),song.title,JSON.stringify(song.vocabulary)]);
 for(const q of song.vocabulary){
  for(let selected=0;selected<4;selected++){
   const result=(await db.query('select song_appreciation_vocabulary_answer($1,$2,$3,$4) as data',[id(1),id(index+10),q.number,selected])).rows[0].data;
   assert.equal(result.answer,q.answer);assert.equal(result.selected,selected);
   assert.deepEqual(result.optionExplanations,q.optionExplanations);assert.equal(result.explanation,q.explanation);checked++;
  }
 }
}
const extras=(await db.query('select song_appreciation_lesson_extras($1,false) as data',[id(1)])).rows[0].data;
assert.equal(extras.length,songs.length);
for(const item of extras){assert.equal(Object.keys(item.vocabulary_progress).length,10);for(const q of item.vocabulary){assert.ok(!('answer' in q));assert.ok(!('optionExplanations' in q));}}
await db.close();console.log(songs.length+' songs: '+checked+' answer/feedback round trips; saved progress and answer privacy PASS.');
