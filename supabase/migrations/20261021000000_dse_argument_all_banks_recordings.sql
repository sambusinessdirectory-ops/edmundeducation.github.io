-- Admit all curated DSE speaking modules and store private oral-practice recordings.
create or replace function public.dse_argument_valid_module(p_module_id text)
returns boolean language sql stable set search_path = '' as $$
  select p_module_id = any(array['2024-digital-museums','2024-feeding-communities','2024-food-delivery-workers','2024-tourism-management','2025-1-2-photo-taking-visitors','2025-a-hot-social-media-site-among-teens-linkedin','2025-hong-kong-s-growing-second-hand-luxury-clothes-culture','2025-how-an-app-is-reshaping-hong-kong-tourism','2025-learning-to-drive-in-hong-kong','2025-once-in-a-lifetime-adventures','2025-personal-shopping-ai-and-the-future-of-retail','2025-subtitles-campus-tv','2025-the-art-of-self-care','2025-why-was-super-mario-a-plumber','undated-comfort-food','undated-homeschooling','undated-multi-functional-caf-s-in-hong-kong','undated-scouts-create-a-better-world','undated-talent-based-reality-tv-shows']::text[])
$$;
create or replace function public.dse_argument_state(p_student_token uuid, p_module_id text)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare v_key text;
begin
  if not public.dse_argument_valid_module(p_module_id) then raise exception 'Unknown DSE module' using errcode='22023'; end if;
  v_key := public.news_discussion_account_key(p_student_token, null::uuid);
  return coalesce((select jsonb_object_agg(s.item_id,jsonb_build_object('checked',s.checked,'bookmarked',s.bookmarked)) from public.dse_argument_item_state s where s.account_key=v_key and s.module_id=p_module_id),'{}'::jsonb);
end;$$;
create or replace function public.dse_argument_save_state(p_student_token uuid,p_module_id text,p_item_id text,p_checked boolean,p_bookmarked boolean)
returns void language plpgsql volatile security definer set search_path = '' as $$
declare v_key text;v_max_syn integer;
begin
  select x.max_syn into v_max_syn from (values ('2024-digital-museums',143),('2024-feeding-communities',155),('2024-food-delivery-workers',111),('2024-tourism-management',111),('2025-1-2-photo-taking-visitors',63),('2025-a-hot-social-media-site-among-teens-linkedin',102),('2025-hong-kong-s-growing-second-hand-luxury-clothes-culture',113),('2025-how-an-app-is-reshaping-hong-kong-tourism',129),('2025-learning-to-drive-in-hong-kong',100),('2025-once-in-a-lifetime-adventures',184),('2025-personal-shopping-ai-and-the-future-of-retail',105),('2025-subtitles-campus-tv',119),('2025-the-art-of-self-care',119),('2025-why-was-super-mario-a-plumber',119),('undated-comfort-food',97),('undated-homeschooling',92),('undated-multi-functional-caf-s-in-hong-kong',118),('undated-scouts-create-a-better-world',104),('undated-talent-based-reality-tv-shows',181)) as x(module_id,max_syn) where x.module_id=p_module_id;
  if v_max_syn is null or p_checked is null or p_bookmarked is null then raise exception 'Invalid DSE item' using errcode='22023'; end if;
  if p_item_id is null or p_item_id !~ '^(arg:(A[123]|B[1-8])-[A-Z0-9]+|gloss:(A[123]|B[1-8])-[A-Z0-9]+:[0-4]|structure:([1-9]|1[0-9]|20)|syn:([0-9]|[1-9][0-9]|1[0-9][0-9]))$' then raise exception 'Invalid DSE item' using errcode='22023'; end if;
  if p_item_id like 'syn:%' and substring(p_item_id from 5)::integer>v_max_syn then raise exception 'Invalid DSE item' using errcode='22023'; end if;
  v_key:=public.news_discussion_account_key(p_student_token,null::uuid);
  insert into public.dse_argument_item_state(account_key,module_id,item_id,checked,bookmarked)
  values(v_key,p_module_id,p_item_id,p_checked,p_bookmarked)
  on conflict(account_key,module_id,item_id) do update set checked=excluded.checked,bookmarked=excluded.bookmarked,updated_at=now();
end;$$;
revoke all on function public.dse_argument_valid_module(text) from public,anon,authenticated;
revoke all on function public.dse_argument_state(uuid,text),public.dse_argument_save_state(uuid,text,text,boolean,boolean) from public,anon,authenticated;
grant execute on function public.dse_argument_state(uuid,text),public.dse_argument_save_state(uuid,text,text,boolean,boolean) to authenticated;

create schema if not exists dse_argument_private;
create table dse_argument_private.recordings(
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  id uuid not null,
  module_id text not null,
  item_type text not null check(item_type in ('glossary','demonstration','response','synonym')),
  label text not null check(length(label) between 1 and 300),
  mime text not null check(mime in ('audio/webm','audio/mp4','audio/ogg')),
  audio bytea not null check(octet_length(audio) between 32 and 3145728),
  created_at timestamptz not null default now(),
  primary key(student_id,id)
);
create index dse_argument_recordings_by_date on dse_argument_private.recordings(created_at desc,id);
alter table dse_argument_private.recordings enable row level security;
revoke all on schema dse_argument_private from public,anon,authenticated;
revoke all on dse_argument_private.recordings from public,anon,authenticated;

create function public.dse_argument_recording(p_token uuid,p_action text,p_payload jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare actor jsonb; sid uuid; is_admin boolean; rec dse_argument_private.recordings%rowtype; data bytea; mt text; rid uuid;
begin
  if auth.uid() is null then raise exception 'Sign in required' using errcode='28000'; end if;
  actor:=public.learning_hub_identity(p_token);
  sid:=(actor->>'id')::uuid;
  is_admin:=actor->>'kind'='admin';
  if p_action='list' then
    return coalesce((select jsonb_agg(row_data order by created_at desc,id) from (
      select r.created_at,r.id,jsonb_build_object('id',r.id,'moduleId',r.module_id,'itemType',r.item_type,'label',r.label,'mime',r.mime,'createdAt',r.created_at,'studentName',s.name) row_data
      from dse_argument_private.recordings r join public.flashcard_students s on s.id=r.student_id
      where is_admin or r.student_id=sid order by r.created_at desc,r.id limit 100 offset least(100000,greatest(0,coalesce((p_payload->>'offset')::int,0)))
    ) q),'[]'::jsonb);
  elsif p_action='get' then
    rid:=(p_payload->>'id')::uuid;
    select * into rec from dse_argument_private.recordings r where r.id=rid and (is_admin or r.student_id=sid) limit 1;
    if rec.id is null then raise exception 'Recording not found' using errcode='22023'; end if;
    return jsonb_build_object('mime',rec.mime,'audio',replace(encode(rec.audio,'base64'),E'\n',''));
  elsif p_action='save' then
    if is_admin then raise exception 'Student account required' using errcode='42501'; end if;
    if not public.dse_argument_valid_module(p_payload->>'moduleId') or p_payload->>'itemType' not in ('glossary','demonstration','response','synonym') or length(btrim(coalesce(p_payload->>'label',''))) not between 1 and 300 then raise exception 'Invalid recording metadata' using errcode='22023'; end if;
    if length(coalesce(p_payload->>'audio','')) not between 40 and 4194304 or p_payload->>'mime' not in ('audio/webm','audio/mp4','audio/ogg') then raise exception 'Invalid recording' using errcode='22023'; end if;
    rid:=(p_payload->>'id')::uuid;mt:=p_payload->>'mime';data:=decode(p_payload->>'audio','base64');
    if octet_length(data) not between 32 and 3145728 or not ((mt='audio/webm' and substring(data from 1 for 4)=decode('1a45dfa3','hex')) or (mt='audio/mp4' and substring(data from 5 for 4)=convert_to('ftyp','UTF8')) or (mt='audio/ogg' and substring(data from 1 for 4)=convert_to('OggS','UTF8'))) then raise exception 'Invalid audio container' using errcode='22023'; end if;
    perform pg_advisory_xact_lock(hashtextextended(sid::text,67));
    if not exists(select 1 from dse_argument_private.recordings where student_id=sid and id=rid) and (select coalesce(sum(octet_length(audio)),0) from dse_argument_private.recordings where student_id=sid)+octet_length(data)>104857600 then raise exception 'Recording storage full' using errcode='22023'; end if;
    insert into dse_argument_private.recordings(student_id,id,module_id,item_type,label,mime,audio)
    values(sid,rid,p_payload->>'moduleId',p_payload->>'itemType',btrim(p_payload->>'label'),mt,data)
    on conflict(student_id,id) do nothing;
    return jsonb_build_object('saved',true,'id',rid);
  end if;
  raise exception 'Unknown action' using errcode='22023';
end;$$;
revoke all on function public.dse_argument_recording(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.dse_argument_recording(uuid,text,jsonb) to authenticated;
notify pgrst,'reload schema';
