-- Writing question images and submitted planning snapshots, 2026-10-28.
-- Service-only wrappers preserve the existing authenticated Worker boundary.
begin;
alter table public.writing_submissions add column if not exists question_images jsonb not null default '[]', add column if not exists function_helper jsonb not null default '{}';
alter table public.writing_submission_drafts add column if not exists question_images jsonb not null default '[]';
alter table public.writing_submission_manual_topics add column if not exists question_images jsonb not null default '[]';
create or replace function public.writing_materials_validate(p_images jsonb) returns boolean language sql immutable set search_path='' as $$
 select jsonb_typeof(p_images)='array' and jsonb_array_length(p_images)<=8 and octet_length(p_images::text)<=12000000;
$$;
create or replace function public.writing_submission_submit_v6(p_id uuid,p_student_id uuid,p_topic text,p_answer text,p_word_count integer,p_duration_seconds integer,p_topic_resource jsonb,p_brainstorm text,p_question_images jsonb,p_function_helper jsonb) returns setof jsonb language plpgsql security invoker set search_path='' as $$
declare saved jsonb; existed boolean;
begin
 if not public.writing_materials_validate(p_question_images) then raise exception 'Invalid question images'; end if;
 if jsonb_typeof(p_function_helper)<>'object' or octet_length(p_function_helper::text)>450000 then raise exception 'Invalid planning'; end if;
 perform pg_advisory_xact_lock(pg_catalog.hashtextextended('writing-submission-student:' || p_student_id::text,0));
 select exists(select 1 from public.writing_submissions where id=p_id) into existed;
 select to_jsonb(r) into saved from public.writing_submission_submit_v5(p_id => p_id,p_student_id => p_student_id,p_topic => p_topic,p_answer => p_answer,p_word_count => p_word_count,p_duration_seconds => p_duration_seconds,p_topic_resource => p_topic_resource,p_brainstorm => p_brainstorm) r;
 if saved is null then return; end if;
 if existed and exists(select 1 from public.writing_submissions where id=p_id and student_id=p_student_id and (question_images is distinct from p_question_images or function_helper is distinct from p_function_helper)) then raise exception 'Submission material conflict' using errcode='23505'; end if;
 update public.writing_submissions set question_images=p_question_images,function_helper=p_function_helper where id=p_id and student_id=p_student_id;
 return next saved || jsonb_build_object('question_images',p_question_images,'function_helper',p_function_helper);
end;$$;
revoke all on function public.writing_submission_submit_v6(uuid,uuid,text,text,integer,integer,jsonb,text,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.writing_submission_submit_v6(uuid,uuid,text,text,integer,integer,jsonb,text,jsonb,jsonb) to service_role;
create or replace function public.writing_submission_save_draft_v3(p_id uuid,p_student_id uuid,p_topic text,p_answer text,p_topic_resource jsonb,p_image_zoom_tenths smallint,p_countdown_state jsonb,p_stopwatch_state jsonb,p_duration_seconds integer,p_brainstorm text,p_function_helper jsonb,p_draft_helper_open boolean,p_question_images jsonb) returns setof jsonb language plpgsql security invoker set search_path='' as $$
declare saved jsonb; existed boolean;
begin
 if not public.writing_materials_validate(p_question_images) then raise exception 'Invalid question images'; end if;
 select to_jsonb(r) into saved from public.writing_submission_save_draft_v2(p_id => p_id,p_student_id => p_student_id,p_topic => p_topic,p_answer => p_answer,p_topic_resource => p_topic_resource,p_image_zoom_tenths => p_image_zoom_tenths,p_countdown_state => p_countdown_state,p_stopwatch_state => p_stopwatch_state,p_duration_seconds => p_duration_seconds,p_brainstorm => p_brainstorm,p_function_helper => p_function_helper,p_draft_helper_open => p_draft_helper_open) r;
 if saved is null then return; end if;
 update public.writing_submission_drafts set question_images=p_question_images where id=p_id and student_id=p_student_id;
 return next saved || jsonb_build_object('question_images',p_question_images);
end;$$;
revoke all on function public.writing_submission_save_draft_v3(uuid,uuid,text,text,jsonb,smallint,jsonb,jsonb,integer,text,jsonb,boolean,jsonb) from public,anon,authenticated;
grant execute on function public.writing_submission_save_draft_v3(uuid,uuid,text,text,jsonb,smallint,jsonb,jsonb,integer,text,jsonb,boolean,jsonb) to service_role;
create or replace function public.writing_manual_topic_update_v2(p_admin_token uuid,p_id uuid,p_title text,p_prompt text,p_flashcard_url text,p_writing_practice_url text,p_model_essay_url text,p_word_list text,p_question_images jsonb) returns setof jsonb language plpgsql security invoker set search_path='' as $$
declare saved jsonb; existed boolean;
begin
 if not public.writing_materials_validate(p_question_images) then raise exception 'Invalid question images'; end if;
 select to_jsonb(r) into saved from public.writing_submission_admin_update_manual_topic(p_admin_token => p_admin_token,p_id => p_id,p_title => p_title,p_prompt => p_prompt,p_flashcard_url => p_flashcard_url,p_writing_practice_url => p_writing_practice_url,p_model_essay_url => p_model_essay_url,p_word_list => p_word_list) r;
 if saved is null then return; end if;
 update public.writing_submission_manual_topics set question_images=p_question_images where id=p_id;
 return next saved || jsonb_build_object('question_images',p_question_images);
end;$$;
revoke all on function public.writing_manual_topic_update_v2(uuid,uuid,text,text,text,text,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.writing_manual_topic_update_v2(uuid,uuid,text,text,text,text,text,text,jsonb) to service_role;
create or replace function public.writing_materials_get(p_kind text, p_ids uuid[]) returns jsonb language plpgsql security invoker set search_path='' as $$
declare result jsonb;
begin
 if cardinality(p_ids)>2000 then raise exception 'Too many materials';end if;
 if p_kind='submission' then select coalesce(jsonb_object_agg(id::text,jsonb_build_object('question_images',question_images,'function_helper',function_helper)),'{}') into result from public.writing_submissions where id=any(p_ids);
 elsif p_kind='draft' then select coalesce(jsonb_object_agg(id::text,jsonb_build_object('question_images',question_images)),'{}') into result from public.writing_submission_drafts where id=any(p_ids);
 elsif p_kind='manual' then select coalesce(jsonb_object_agg(id::text,jsonb_build_object('question_images',question_images)),'{}') into result from public.writing_submission_manual_topics where id=any(p_ids);
 else raise exception 'Invalid material kind';end if;
 return result;
end;$$;
revoke all on function public.writing_materials_get(text,uuid[]) from public,anon,authenticated;
grant execute on function public.writing_materials_get(text,uuid[]) to service_role;
revoke all on function public.writing_materials_validate(jsonb) from public,anon,authenticated;
grant execute on function public.writing_materials_validate(jsonb) to service_role;
grant select on public.writing_submissions, public.writing_submission_drafts, public.writing_submission_manual_topics to service_role;
grant update (question_images,function_helper) on public.writing_submissions to service_role;
grant update (question_images) on public.writing_submission_drafts, public.writing_submission_manual_topics to service_role;
commit;

grant execute on function public._writing_submission_word_count(text) to service_role;
