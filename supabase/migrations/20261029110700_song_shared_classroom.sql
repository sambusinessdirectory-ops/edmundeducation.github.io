begin;
create table song_live_private.rooms(student_id uuid primary key, session_id uuid, owner_device uuid, song_id uuid, mode_id text, exercise_version integer, started_at timestamptz, expires_at timestamptz, peers jsonb not null default '{}', media jsonb, media_revision bigint not null default 0);
alter table song_live_private.rooms enable row level security;
revoke all on song_live_private.rooms from public,anon,authenticated;
create function song_live_private.room(p_token uuid,p_device uuid,p_action text,p_session uuid,p_song uuid,p_mode text,p_version integer,p_media jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare sid uuid; r song_live_private.rooms; accepted boolean:=true; peer jsonb; count_peers integer;
begin
 if auth.uid() is null then raise exception 'Sign in required';end if;
 sid:=public._song_appreciation_student_id(p_token);
 if sid is null or p_device is null then raise exception 'Student sign in required';end if;
 if p_action not in ('poll','start','join','media','end') or p_action is null then raise exception 'Invalid action';end if;
 insert into song_live_private.rooms(student_id) values(sid) on conflict do nothing;
 select * into r from song_live_private.rooms where student_id=sid for update;
 select coalesce(jsonb_object_agg(key,value),'{}') into r.peers from jsonb_each(r.peers) where (value->>'seen')::timestamptz>now()-interval '90 seconds';
 if r.expires_at<=now() then r.session_id:=null;r.media:=null;end if;
 peer:=coalesce(r.peers->p_device::text,'{}');
 if p_action='start' then
  if r.session_id is not null and r.session_id is distinct from p_session then accepted:=false;
  else
   if p_session is null or p_song is null or p_mode is null or length(p_mode) not between 1 and 100 or p_version is null or p_version<1 or not public._song_appreciation_student_can_access(sid,p_song) then raise exception 'Invalid exercise or access denied';end if;
   if r.session_id is null then
    r.session_id:=p_session;r.owner_device:=p_device;r.song_id:=p_song;r.mode_id:=p_mode;r.exercise_version:=p_version;r.started_at:=now();r.media:=null;r.media_revision:=r.media_revision+1;
   end if;
   peer:=peer||jsonb_build_object('joined',r.session_id);r.expires_at:=now()+interval '90 seconds';
  end if;
 elsif p_action in ('join','media','end') then
  if r.session_id is null or r.session_id is distinct from p_session or not public._song_appreciation_student_can_access(sid,r.song_id) then raise exception 'Session ended. Please refresh.';end if;
  if p_action='join' then peer:=peer||jsonb_build_object('joined',r.session_id);
  else
   if peer->>'joined' is distinct from r.session_id::text then raise exception 'Join the exercise first';end if;
   if p_action='end' then r.session_id:=null;r.media:=null;
   else
    if jsonb_typeof(p_media->'position') is distinct from 'number' or jsonb_typeof(p_media->'rate') is distinct from 'number' or jsonb_typeof(p_media->'playing') is distinct from 'boolean' or (p_media->>'position')::numeric not between 0 and 86400 or (p_media->>'rate')::numeric not between 0.25 and 2 or not(p_media ?& array['position','rate']) then raise exception 'Invalid playback state';end if;
    r.media_revision:=r.media_revision+1;
    r.media:=jsonb_build_object('playing',p_media->'playing','position',(p_media->>'position')::numeric,'rate',(p_media->>'rate')::numeric,'at',now(),'device',p_device);
   end if;
  end if;
 end if;
 if r.session_id is not null and peer->>'joined'=r.session_id::text and p_session=r.session_id then
  if r.expires_at<now()+interval '60 seconds' then r.expires_at:=now()+interval '90 seconds';end if;
 end if;
 if peer->>'seen' is null or (peer->>'seen')::timestamptz<now()-interval '15 seconds' or p_action<>'poll' then peer:=peer||jsonb_build_object('seen',now());end if;
 r.peers:=jsonb_set(r.peers,array[p_device::text],peer);
 update song_live_private.rooms set session_id=r.session_id,owner_device=r.owner_device,song_id=r.song_id,mode_id=r.mode_id,exercise_version=r.exercise_version,started_at=r.started_at,expires_at=r.expires_at,peers=r.peers,media=r.media,media_revision=r.media_revision where student_id=sid and (session_id,expires_at,peers,media_revision) is distinct from (r.session_id,r.expires_at,r.peers,r.media_revision);
 select count(*) into count_peers from jsonb_each(r.peers);
 return jsonb_build_object('accepted',accepted,'devices',count_peers,'server_time',now(),'session',case when r.session_id is null then null else jsonb_build_object('id',r.session_id,'owner',r.owner_device,'song',r.song_id,'mode',r.mode_id,'version',r.exercise_version,'started_at',r.started_at,'media',r.media,'revision',r.media_revision) end);
end;$$;
revoke all on function song_live_private.room(uuid,uuid,text,uuid,uuid,text,integer,jsonb) from public,anon;
grant execute on function song_live_private.room(uuid,uuid,text,uuid,uuid,text,integer,jsonb) to authenticated;
create function public.song_appreciation_room(p_token uuid,p_device uuid,p_action text default 'poll',p_session uuid default null,p_song uuid default null,p_mode text default null,p_version integer default null,p_media jsonb default null)
returns jsonb language sql security invoker set search_path='' as $$select song_live_private.room(p_token,p_device,p_action,p_session,p_song,p_mode,p_version,p_media)$$;
revoke all on function public.song_appreciation_room(uuid,uuid,text,uuid,uuid,text,integer,jsonb) from public,anon;
grant execute on function public.song_appreciation_room(uuid,uuid,text,uuid,uuid,text,integer,jsonb) to authenticated;
commit;
