create or replace function public.song_appreciation_admin_save_lesson(p_admin_token uuid,p_details jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_song jsonb; v_id uuid; v_cover text:=coalesce(p_details->>'cover_url',''); v_audio text:=coalesce(p_details->>'audio_url','');
begin
 if public._song_appreciation_admin_id(p_admin_token) is null then raise exception 'Unauthorized' using errcode='42501'; end if;
 if length(v_cover)>750000 or (v_cover<>'' and v_cover!~'^(https://edmundeducation[.]com/|assets/|data:image/(webp|png|jpeg);base64,)') or length(v_audio)>2000 or (v_audio<>'' and v_audio!~'^(https://(edmundeducation[.]com|edmund-speaking-system[.]edmundeducation[.]workers[.]dev)/|assets/)') then raise exception 'Invalid media URL' using errcode='22023'; end if;
 select to_jsonb(saved) into v_song from public.song_appreciation_admin_upsert_song(
 p_admin_token,nullif(p_details->>'id','')::uuid,p_details->>'slug',p_details->>'title',p_details->>'singer',p_details->>'exerciseName',p_details->>'description',nullif(p_details->>'youtubeUrl',''),
 array(select jsonb_array_elements_text(p_details->'tags')),p_details->'translations',p_details->'modes',(p_details->>'published')::boolean,(p_details->>'sortOrder')::integer) saved;
 v_id:=(v_song->>'id')::uuid;
 update public.song_appreciation_songs set cover_url=v_cover,audio_url=v_audio where id=v_id;
 return v_song||jsonb_build_object('cover_url',v_cover,'audio_url',v_audio,'vocabulary',(select vocabulary from public.song_appreciation_songs where id=v_id));
end $$;
notify pgrst,'reload schema';
