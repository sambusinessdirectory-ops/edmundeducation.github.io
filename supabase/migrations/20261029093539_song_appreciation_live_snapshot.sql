begin;
create schema if not exists song_live_private;
revoke all on schema song_live_private from public,anon;
grant usage on schema song_live_private to authenticated;
create index if not exists song_appreciation_attempts_live_lookup_idx
 on public.song_appreciation_attempts(student_id,song_id,mode_id,exercise_version,started_at,completed_at desc);
create or replace function song_live_private.snapshot(p_student_token uuid,p_song_id uuid,p_mode_id text,p_exercise_version integer,p_since text)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare student uuid; d public.song_appreciation_drafts; a public.song_appreciation_attempts; revision text;
begin
 if auth.uid() is null then raise exception 'Sign in required' using errcode='28000';end if;
 student:=public._song_appreciation_student_id(p_student_token);
 if student is null or not public._song_appreciation_student_can_access(student,p_song_id) then raise exception 'Song access denied' using errcode='42501';end if;
 if p_mode_id is null or length(p_mode_id) not between 1 and 100 or p_exercise_version is null or p_exercise_version<1 then raise exception 'Invalid exercise' using errcode='22023';end if;
 select * into d from public.song_appreciation_drafts where student_id=student and song_id=p_song_id and mode_id=p_mode_id and exercise_version=p_exercise_version;
 if not found then return jsonb_build_object('revision','0');end if;
 select * into a from public.song_appreciation_attempts where student_id=student and song_id=p_song_id and mode_id=p_mode_id and exercise_version=p_exercise_version and started_at=d.started_at order by completed_at desc,id desc limit 1;
 revision:=d.revision::text||':'||coalesce(a.id::text,'');
 if revision=p_since then return jsonb_build_object('revision',revision);end if;
 -- Return only the current exercise, never the song's answer key or the student's history.
 return jsonb_build_object('revision',revision,'payload',jsonb_build_object(
  'draft',jsonb_build_object('song_id',d.song_id,'mode_id',d.mode_id,'exercise_version',d.exercise_version,'revision',d.revision,'answers',d.answers,'result',d.result,'started_at',d.started_at,'duration_ms',d.duration_ms),
  'attempt',case when a.id is null then null else jsonb_build_object('id',a.id,'song_id',a.song_id,'mode_id',a.mode_id,'exercise_version',a.exercise_version,'answers',a.answers,'result',a.result,'correct_count',a.correct_count,'total_count',a.total_count,'duration_ms',a.duration_ms,'started_at',a.started_at,'completed_at',a.completed_at) end));
end;$$;
revoke all on function song_live_private.snapshot(uuid,uuid,text,integer,text) from public,anon;
grant execute on function song_live_private.snapshot(uuid,uuid,text,integer,text) to authenticated;
create or replace function public.song_appreciation_live_snapshot(p_student_token uuid,p_song_id uuid,p_mode_id text,p_exercise_version integer,p_since text default '')
returns jsonb language sql stable security invoker set search_path='' as $$select song_live_private.snapshot(p_student_token,p_song_id,p_mode_id,p_exercise_version,p_since)$$;
revoke all on function public.song_appreciation_live_snapshot(uuid,uuid,text,integer,text) from public,anon;
grant execute on function public.song_appreciation_live_snapshot(uuid,uuid,text,integer,text) to authenticated;
commit;
