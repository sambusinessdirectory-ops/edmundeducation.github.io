-- Admin operations retain submissions and feedback for audit/history.
alter table public.writing_submission_admin_audit drop constraint if exists writing_submission_admin_audit_action_check;
alter table public.writing_submission_admin_audit add constraint writing_submission_admin_audit_action_check check(action in ('delete_occurrence','delete_rule_category','proxy_submission','hide_submission','rename_submission'));
create or replace function public.writing_submission_admin_list_submissions_v4(p_admin_token uuid,p_student_id uuid,p_limit integer,p_offset integer)
returns table(id uuid,student_id uuid,student_name text,topic text,answer_preview text,word_count integer,duration_seconds integer,submitted_at timestamptz,deleted_at timestamptz,has_published_feedback boolean,feedback_status text)
language sql stable security definer set search_path='' as $$
 select s.*,coalesce(f.status,'') from public.writing_submission_admin_list_submissions_v3(p_admin_token,p_student_id,p_limit,p_offset) s left join public.writing_submission_feedback f on f.submission_id=s.id and f.student_id=s.student_id;
$$;
create or replace function public.writing_submission_admin_manage(p_admin_token uuid,p_submission_id uuid,p_action text,p_topic text default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare admin uuid:=public._writing_submission_admin_id(p_admin_token); row public.writing_submissions%rowtype;
begin
 if admin is null then raise exception 'Admin required' using errcode='42501';end if;
 if p_action not in ('hide','rename') or p_action is null then raise exception 'Invalid action' using errcode='22023';end if;
 select * into row from public.writing_submissions s where s.id=p_submission_id for update;
 if not found then raise exception 'Submission not found' using errcode='P0002';end if;
 if p_action='rename' then
  if p_topic is null or char_length(btrim(p_topic)) not between 1 and 4000 or octet_length(p_topic)>16000 then raise exception 'Invalid topic' using errcode='22023';end if;
  update public.writing_submissions set topic=btrim(p_topic),republished_at=clock_timestamp() where id=p_submission_id returning * into row;
 else
  update public.writing_submissions set deleted_at=coalesce(deleted_at,clock_timestamp()),republished_at=clock_timestamp() where id=p_submission_id returning * into row;
 end if;
 insert into public.writing_submission_admin_audit(admin_id,student_id,action,submission_id,affected_count) values(admin,row.student_id,case p_action when 'hide' then 'hide_submission' else 'rename_submission' end,row.id,1);
 return jsonb_build_object('id',row.id,'topic',row.topic,'deletedAt',row.deleted_at);
end $$;
revoke all on function public.writing_submission_admin_list_submissions_v4(uuid,uuid,integer,integer) from public,anon,authenticated;
revoke all on function public.writing_submission_admin_manage(uuid,uuid,text,text) from public,anon,authenticated;
grant execute on function public.writing_submission_admin_list_submissions_v4(uuid,uuid,integer,integer) to service_role;
grant execute on function public.writing_submission_admin_manage(uuid,uuid,text,text) to service_role;
notify pgrst,'reload schema';
