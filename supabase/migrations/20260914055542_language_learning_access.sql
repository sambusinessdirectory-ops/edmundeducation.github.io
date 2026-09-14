begin;
create table language_learning.access (
 language text not null check(language in ('it','fr')),system text not null check(system in ('writing','flashcard')),
 student_id uuid not null,value jsonb not null default '{}',primary key(language,system,student_id)
);
alter table language_learning.access enable row level security;
revoke all on language_learning.access from public,anon,authenticated;
create function public.language_learning_access(p_language text,p_system text,p_args jsonb,p_write boolean default false)
returns jsonb language plpgsql security definer set search_path='' as $$
declare student uuid; result jsonb;
begin
 if auth.uid() is null or p_language is null or p_language not in ('it','fr') or p_system is null or p_system not in ('writing','flashcard') then raise exception 'Invalid authentication or edition' using errcode='42501';end if;
 if p_args ? 'p_admin_password' then
  if p_system='flashcard' then
   if not public.flashcard_admin_ok(p_args->>'p_admin_name',p_args->>'p_admin_password') then raise exception 'Invalid admin' using errcode='42501';end if;
   select id into student from public.flashcard_students where name=btrim(p_args->>'p_student_name') and deleted_at is null;
  else student:=public._writing_practice_admin_student_id(p_args->>'p_admin_name',p_args->>'p_admin_password',p_args->>'p_student_name');end if;
 else
  if p_write then raise exception 'Admin required' using errcode='42501';end if;
  if p_system='flashcard' then student:=public.flashcard_session_student_id((p_args->>'p_token')::uuid);
  else student:=public._writing_practice_student_id((p_args->>'p_token')::uuid);end if;
 end if;
 if student is null then raise exception 'Invalid student' using errcode='42501';end if;
 if p_write then
  if coalesce(jsonb_typeof(p_args->'p_access'),'')<>'object' or octet_length((p_args->'p_access')::text)>100000 then raise exception 'Invalid access';end if;
  insert into language_learning.access values(p_language,p_system,student,p_args->'p_access') on conflict(language,system,student_id) do update set value=excluded.value;
 end if;
 select value into result from language_learning.access where language=p_language and system=p_system and student_id=student;
 return coalesce(result,'{}');
end $$;
revoke all on function public.language_learning_access(text,text,jsonb,boolean) from public,anon,authenticated;
grant execute on function public.language_learning_access(text,text,jsonb,boolean) to authenticated;
commit;
