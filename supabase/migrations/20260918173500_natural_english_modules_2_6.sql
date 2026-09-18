-- Native English Modules 2-6. Preserves the existing Scoop endpoint and data.
insert into natural_english_private.catalogue(module,senses,questions) values
('box','["phrase"]'::jsonb,'{"box-spot":{"type":"mc","answers":["Can I get a box?"],"options":["Can I get a box?","Please close my food.","Please make this outside."]},"box-listen":{"type":"mc","answers":["想拿盒子裝吃不完的食物"],"options":["想再點一份食物","想拿盒子裝吃不完的食物","想結帳","想換枱"]},"box-choose":{"type":"mc","answers":["Can I get a box?"],"options":["Can I get some more water?","Can I get another fork?","Can I get a box?","Can I get the check?"]},"box-blank1":{"type":"blank","answers":["box"],"options":[]},"box-blank2":{"type":"blank","answers":["a box"],"options":[]},"box-blank3":{"type":"blank","answers":["Can I get a box?"],"options":[]},"box-extra":{"type":"mc","answers":["Can I get a bag, too?"],"options":["Can I get a bag, too?","Can I get another meal?","Can I get a table?"]},"box-dialogue1":{"type":"blank","answers":["box"],"options":[]},"box-dialogue2":{"type":"blank","answers":["bag"],"options":[]},"box-final":{"type":"blank","answers":["Can I get a box?"],"options":[]}}'::jsonb),
('flat','["phrase"]'::jsonb,'{"flat-spot":{"type":"mc","answers":["It''s flat."],"options":["It''s flat.","It''s empty.","It''s weak."]},"flat-listen":{"type":"mc","answers":["汽水沒有氣"],"options":["汽水太甜","汽水沒有氣","汽水太凍","汽水太少"]},"flat-choose":{"type":"mc","answers":["This soda is flat."],"options":["This soda is too sweet.","This soda is flat.","This soda is too cold.","This soda is empty."]},"flat-blank1":{"type":"blank","answers":["flat"],"options":[]},"flat-blank2":{"type":"blank","answers":["flat"],"options":[]},"flat-blank3":{"type":"blank","answers":["soda"],"options":[]},"flat-blank4":{"type":"blank","answers":["flat"],"options":[]},"flat-extra":{"type":"mc","answers":["幫你換一杯新的"],"options":["幫你換一杯新的","幫你加冰","幫你拿帳單"]},"flat-dialogue":{"type":"blank","answers":["flat"],"options":[]},"flat-final":{"type":"blank","answers":["It''s flat.","This soda is flat."],"options":[]}}'::jsonb),
('ready','["phrase"]'::jsonb,'{"ready-spot":{"type":"mc","answers":["We''re ready to order."],"options":["We''re ready to order.","We''re ready to eat.","We want the check."]},"ready-listen":{"type":"mc","answers":["你準備好點餐未？"],"options":["你準備好點餐未？","你食完未？","你要埋單嗎？","你想轉枱嗎？"]},"ready-choose":{"type":"mc","answers":["Yes, we''re ready to order."],"options":["Yes, we''re ready to order.","Yes, we''re ready to leave.","Yes, we''re ready for the check.","Yes, we''re still looking."]},"ready-blank1":{"type":"blank","answers":["order"],"options":[]},"ready-blank2":{"type":"blank","answers":["ready"],"options":[]},"ready-blank3":{"type":"blank","answers":["ready to order"],"options":[]},"ready-extra":{"type":"mc","answers":["We need a few more minutes."],"options":["We need a few more minutes.","We''re ready to order.","We need the check."]},"ready-dialogue":{"type":"blank","answers":["ready to order"],"options":[]},"ready-final":{"type":"blank","answers":["We''re ready to order."],"options":[]}}'::jsonb),
('club','["phrase"]'::jsonb,'{"club-spot":{"type":"mc","answers":["company → club"],"options":["company → club","sandwich → burger","get → eat"]},"club-listen":{"type":"mc","answers":["公司三文治"],"options":["公司三文治","芝士漢堡","火腿三文治","沙律"]},"club-choose":{"type":"mc","answers":["Can I get a club sandwich?"],"options":["Can I get a ham sandwich?","Can I get a club sandwich?","Can I get a chicken salad?","Can I get a cheeseburger?"]},"club-blank1":{"type":"blank","answers":["club"],"options":[]},"club-blank2":{"type":"blank","answers":["club"],"options":[]},"club-blank3":{"type":"blank","answers":["club sandwich"],"options":[]},"club-extra":{"type":"mc","answers":["Fries, please."],"options":["Fries, please.","A club sandwich, please.","The check, please."]},"club-dialogue":{"type":"blank","answers":["club"],"options":[]},"club-final":{"type":"blank","answers":["Can I get a club sandwich?"],"options":[]}}'::jsonb),
('dressing','["phrase"]'::jsonb,'{"dressing-spot":{"type":"mc","answers":["sauce → dressing"],"options":["sauce → dressing","sauce → ketchup","salad → soup"]},"dressing-listen":{"type":"mc","answers":["有甚麼沙律醬"],"options":["有甚麼沙律醬","有甚麼沙律","有甚麼湯","有甚麼飲品"]},"dressing-choose":{"type":"mc","answers":["What salad dressing do you have?"],"options":["What salad dressing do you have?","What salads do you have?","What drinks do you have?","What soup do you have?"]},"dressing-blank1":{"type":"blank","answers":["dressing"],"options":[]},"dressing-blank2":{"type":"blank","answers":["dressing"],"options":[]},"dressing-blank3":{"type":"blank","answers":["salad dressing"],"options":[]},"dressing-extra":{"type":"mc","answers":["Can I get the dressing on the side?"],"options":["Can I get the dressing on the side?","Can I get another salad?","Can I get the check?"]},"dressing-dialogue":{"type":"blank","answers":["dressing"],"options":[]},"dressing-final":{"type":"blank","answers":["dressing"],"options":[]}}'::jsonb);

alter table natural_english_private.recordings add column module text not null default 'scoop';
alter table natural_english_private.recordings add constraint natural_english_recordings_module_fk foreign key(module) references natural_english_private.catalogue(module);

create function natural_english_private.sync_modules(p_token uuid,p_events jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare sid uuid;e jsonb;q jsonb;k text;m text;ok boolean;ts timestamptz;result jsonb;
begin
 if auth.uid() is null then raise exception 'Sign in required' using errcode='28000';end if;
 sid:=public.flashcard_session_student_id(p_token);if sid is null then raise exception 'Student session expired. Please sign in again.' using errcode='28000';end if;
 if jsonb_typeof(p_events) is distinct from 'array' or jsonb_array_length(p_events)>100 or octet_length(p_events::text)>100000 then raise exception 'Invalid event batch' using errcode='22023';end if;
 for e in select value from jsonb_array_elements(p_events) loop
  k:=e->>'kind';m:=coalesce(nullif(e->>'module',''),'scoop');ok:=null;
  if k is null or k not in ('view','start','answer','time') or e->>'id' is null or e->>'at' is null or not exists(select 1 from natural_english_private.catalogue c where c.module=m) then raise exception 'Invalid event' using errcode='22023';end if;
  ts:=(e->>'at')::timestamptz;if not isfinite(ts) or ts>now()+interval '5 minutes' or ts<now()-interval '90 days' then raise exception 'Invalid event date' using errcode='22023';end if;
  if k='view' then
   if coalesce(e->>'sense','') !~ '^(recorded|skipped):[0-9a-f-]{36}:(phrase|dialogue)$' or not exists(select 1 from natural_english_private.events t where t.student_id=sid and t.module=m and t.kind='start' and t.run::text=split_part(e->>'sense',':',2)) then raise exception 'Invalid speaking status' using errcode='22023';end if;
  end if;
  if k in ('start','answer') and e->>'run' is null then raise exception 'Missing practice run' using errcode='22023';end if;
  if k='answer' then
   select c.questions->(e->>'question') into q from natural_english_private.catalogue c where c.module=m;
   if q is null or coalesce((e->>'round')::integer,0) not between 1 and 1000 or coalesce(length(e->>'choice'),0) not between 1 and 160 or (q->>'type'='mc' and not coalesce(q->'options' ? (e->>'choice'),false)) then raise exception 'Invalid answer' using errcode='22023';end if;
   if not exists(select 1 from natural_english_private.events t where t.student_id=sid and t.module=m and t.kind='start' and t.run=(e->>'run')::uuid) then raise exception 'Unknown practice run' using errcode='22023';end if;
   ok:=exists(select 1 from jsonb_array_elements_text(q->'answers') a where lower(regexp_replace(trim(translate(e->>'choice','’','''')),'\s+',' ','g'))=lower(translate(a,'’','''')));
  end if;
  if k='time' and coalesce((e->>'seconds')::integer,0) not between 1 and 60 then raise exception 'Invalid study duration' using errcode='22023';end if;
  insert into natural_english_private.events(student_id,id,module,kind,run,round,question,choice,sense,correct,seconds,happened_at)
  values(sid,(e->>'id')::uuid,m,k,case when k in ('start','answer') then (e->>'run')::uuid end,case when k='answer' then (e->>'round')::integer end,case when k='answer' then e->>'question' end,case when k='answer' then e->>'choice' end,case when k='view' then e->>'sense' end,ok,case when k='time' then (e->>'seconds')::integer end,ts) on conflict do nothing;
 end loop;
 select jsonb_build_object(
  'events',coalesce((select jsonb_agg(jsonb_strip_nulls(jsonb_build_object('id',t.id,'module',t.module,'kind',t.kind,'run',t.run,'round',t.round,'question',t.question,'choice',t.choice,'sense',t.sense,'correct',t.correct,'at',t.happened_at)) order by t.happened_at,t.id) from natural_english_private.events t where t.student_id=sid and t.kind<>'time'),'[]'::jsonb),
  'timeDays',coalesce((select jsonb_agg(to_jsonb(d) order by d.date) from (select (t.happened_at at time zone 'Asia/Hong_Kong')::date date,sum(t.seconds)::bigint seconds from natural_english_private.events t where t.student_id=sid and t.kind='time' group by 1)d),'[]'::jsonb),'updatedAt',now()) into result;
 return result;
end;$$;
revoke all on function natural_english_private.sync_modules(uuid,jsonb) from public,anon,authenticated;
grant execute on function natural_english_private.sync_modules(uuid,jsonb) to authenticated;
create function public.natural_english_modules_sync(p_token uuid,p_events jsonb default '[]'::jsonb) returns jsonb language sql security invoker set search_path='' as $$select natural_english_private.sync_modules(p_token,p_events);$$;
revoke all on function public.natural_english_modules_sync(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.natural_english_modules_sync(uuid,jsonb) to authenticated;

create function natural_english_private.recording_modules(p_token uuid,p_action text,p_payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare sid uuid;data bytea;result jsonb;mt text;m text;
begin
 if auth.uid() is null then raise exception 'Sign in required' using errcode='28000';end if;
 sid:=public.flashcard_session_student_id(p_token);if sid is null then raise exception 'Student session expired' using errcode='28000';end if;
 if p_action='list' then select coalesce(jsonb_agg(jsonb_build_object('id',r.id,'module',r.module,'run',r.run,'slot',r.slot,'mime',r.mime,'at',r.at) order by r.at desc),'[]'::jsonb) into result from natural_english_private.recordings r where r.student_id=sid;return result;
 elsif p_action='get' then select jsonb_build_object('mime',r.mime,'audio',replace(encode(r.audio,'base64'),E'\n','')) into result from natural_english_private.recordings r where r.student_id=sid and r.id=(p_payload->>'id')::uuid;if result is null then raise exception 'Recording not found' using errcode='22023';end if;return result;
 elsif p_action='save' then
  m:=coalesce(nullif(p_payload->>'module',''),'scoop');
  if coalesce(length(p_payload->>'audio'),0) not between 40 and 2796204 or coalesce(p_payload->>'slot','') not in ('phrase','dialogue') or coalesce(p_payload->>'mime','') not in ('audio/webm','audio/mp4','audio/ogg') or p_payload->>'id' is null or not exists(select 1 from natural_english_private.catalogue c where c.module=m and c.senses ? (p_payload->>'slot')) then raise exception 'Invalid recording' using errcode='22023';end if;
  if not exists(select 1 from natural_english_private.events e where e.student_id=sid and e.module=m and e.kind='start' and e.run=(p_payload->>'run')::uuid) then raise exception 'Unknown practice run' using errcode='22023';end if;
  data:=decode(p_payload->>'audio','base64');mt:=p_payload->>'mime';
  if octet_length(data) not between 32 and 2097152 or not ((mt='audio/webm' and substring(data from 1 for 4)=decode('1a45dfa3','hex')) or (mt='audio/mp4' and substring(data from 5 for 4)=convert_to('ftyp','UTF8')) or (mt='audio/ogg' and substring(data from 1 for 4)=convert_to('OggS','UTF8'))) then raise exception 'Invalid audio container' using errcode='22023';end if;
  perform pg_advisory_xact_lock(hashtextextended(sid::text,66));if not exists(select 1 from natural_english_private.recordings r where r.student_id=sid and r.id=(p_payload->>'id')::uuid) and (select coalesce(sum(octet_length(audio)),0) from natural_english_private.recordings where student_id=sid)+octet_length(data)>104857600 then raise exception 'Recording storage full' using errcode='22023';end if;
  insert into natural_english_private.recordings(student_id,id,module,run,slot,mime,audio) values(sid,(p_payload->>'id')::uuid,m,(p_payload->>'run')::uuid,p_payload->>'slot',mt,data) on conflict do nothing;return jsonb_build_object('saved',true);
 end if;raise exception 'Unknown action' using errcode='22023';
end;$$;
revoke all on function natural_english_private.recording_modules(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function natural_english_private.recording_modules(uuid,text,jsonb) to authenticated;
create function public.natural_english_modules_recording(p_token uuid,p_action text,p_payload jsonb default '{}'::jsonb) returns jsonb language sql security invoker set search_path='' as $$select natural_english_private.recording_modules(p_token,p_action,p_payload);$$;
revoke all on function public.natural_english_modules_recording(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.natural_english_modules_recording(uuid,text,jsonb) to authenticated;

-- Existing Scoop recordings remain valid in the new module endpoint.
update natural_english_private.catalogue set senses='["phrase","dialogue"]'::jsonb where module='scoop';
notify pgrst,'reload schema';
