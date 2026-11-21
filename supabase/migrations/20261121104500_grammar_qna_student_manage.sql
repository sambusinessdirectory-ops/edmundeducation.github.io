create or replace function public.grammar_qna_student_edit(p_token uuid,p_message_id uuid,p_body text)
returns boolean
language plpgsql security definer set search_path=''
as $$
declare student uuid:=public.flashcard_session_student_id(p_token); changed integer;
begin
  if student is null then raise exception 'Please log in again' using errcode='42501'; end if;
  if char_length(trim(coalesce(p_body,''))) not between 1 and 3000 then raise exception 'Invalid question' using errcode='22023'; end if;
  update grammar_qna_private.messages message set body=trim(p_body),updated_at=now()
  from grammar_qna_private.threads thread
  where message.id=p_message_id and message.student_id=student and message.author_role='student' and message.deleted_at is null
    and thread.student_id=message.student_id and thread.module_id=message.module_id and thread.block_id=message.block_id and thread.status='open';
  get diagnostics changed=row_count;
  if changed=0 then raise exception 'Question is no longer editable' using errcode='42501'; end if;
  update grammar_qna_private.threads thread set updated_at=now()
  from grammar_qna_private.messages message where message.id=p_message_id and thread.student_id=message.student_id and thread.module_id=message.module_id and thread.block_id=message.block_id;
  return true;
end; $$;

create or replace function public.grammar_qna_student_delete(p_token uuid,p_message_id uuid)
returns boolean
language plpgsql security definer set search_path=''
as $$
declare student uuid:=public.flashcard_session_student_id(p_token); changed integer;
begin
  if student is null then raise exception 'Please log in again' using errcode='42501'; end if;
  update grammar_qna_private.messages message set deleted_at=now(),updated_at=now()
  from grammar_qna_private.threads thread
  where message.id=p_message_id and message.student_id=student and message.author_role='student' and message.deleted_at is null
    and thread.student_id=message.student_id and thread.module_id=message.module_id and thread.block_id=message.block_id and thread.status='open';
  get diagnostics changed=row_count;
  if changed=0 then raise exception 'Question is no longer deletable' using errcode='42501'; end if;
  return true;
end; $$;

revoke all on function public.grammar_qna_student_edit(uuid,uuid,text) from public;
revoke all on function public.grammar_qna_student_delete(uuid,uuid) from public;
grant execute on function public.grammar_qna_student_edit(uuid,uuid,text) to anon,authenticated,service_role;
grant execute on function public.grammar_qna_student_delete(uuid,uuid) to anon,authenticated,service_role;
