CREATE OR REPLACE FUNCTION public.song_appreciation_lesson_extras(p_token uuid, p_admin boolean DEFAULT false)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_student uuid; v_result jsonb;
begin
 if p_admin then
  if public._song_appreciation_admin_id(p_token) is null then raise exception 'Unauthorized' using errcode='42501'; end if;
 else
  v_student:=public._song_appreciation_student_id(p_token);
  if v_student is null then raise exception 'Unauthorized' using errcode='42501'; end if;
 end if;
 select coalesce(jsonb_agg(jsonb_build_object('id',s.id,'cover_url',s.cover_url,'audio_url',s.audio_url,'translations',s.translations,
 'vocabulary',case when p_admin then s.vocabulary else (select coalesce(jsonb_agg(q-'answer'-'explanation'-'optionExplanations'),'[]'::jsonb) from jsonb_array_elements(s.vocabulary) q) end,
 'vocabulary_progress',(select coalesce(jsonb_object_agg(p.question_number::text,jsonb_build_object('selected',p.selected,'answer',q->'answer','explanation',q->'explanation','optionExplanations',q->'optionExplanations')),'{}'::jsonb)
 from public.song_appreciation_vocabulary_progress p cross join lateral jsonb_array_elements(s.vocabulary) q
 where p.student_id=v_student and p.song_id=s.id and (q->>'number')::int=p.question_number))), '[]'::jsonb)
 into v_result from public.song_appreciation_songs s
 where p_admin or public._song_appreciation_student_can_access(v_student,s.id);
 return v_result;
end $function$
;
