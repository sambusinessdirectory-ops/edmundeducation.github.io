alter table public.writing_submissions add column if not exists republished_at timestamptz;
create or replace function public.writing_submission_admin_republish(p_admin_token uuid,p_submission_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare stamp timestamptz;
begin
 if public._writing_submission_admin_id(p_admin_token) is null then raise exception 'Admin required' using errcode='42501';end if;
 update public.writing_submissions set republished_at=clock_timestamp() where id=p_submission_id and deleted_at is null returning republished_at into stamp;
 if stamp is null then raise exception 'Submission not found' using errcode='P0002';end if;
 return jsonb_build_object('republishedAt',stamp);
end $$;
create or replace function public.writing_submission_delivery_version(p_token uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=public.flashcard_session_student_id(p_token);
begin
 if uid is null then raise exception 'Sign in required' using errcode='42501';end if;
 return jsonb_build_object('version',(select coalesce(max(republished_at)::text,'0') from public.writing_submissions where student_id=uid and deleted_at is null));
end $$;
revoke all on function public.writing_submission_admin_republish(uuid,uuid),public.writing_submission_delivery_version(uuid) from public,anon,authenticated;
grant execute on function public.writing_submission_admin_republish(uuid,uuid),public.writing_submission_delivery_version(uuid) to service_role;
notify pgrst, 'reload schema';
