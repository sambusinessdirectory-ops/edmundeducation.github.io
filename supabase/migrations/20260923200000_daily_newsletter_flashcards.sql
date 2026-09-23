alter table public.daily_newsletter_posts
  add column if not exists flashcards jsonb not null default '[]'::jsonb;

create table if not exists public.daily_newsletter_flashcard_progress (
  owner_kind text not null check (owner_kind in ('auth', 'student')),
  owner_id uuid not null,
  post_id text not null references public.daily_newsletter_posts(id) on delete cascade,
  progress jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (owner_kind, owner_id, post_id)
);

alter table public.daily_newsletter_flashcard_progress enable row level security;

drop policy if exists daily_newsletter_flashcard_progress_own_select on public.daily_newsletter_flashcard_progress;
create policy daily_newsletter_flashcard_progress_own_select
  on public.daily_newsletter_flashcard_progress for select to authenticated
  using (owner_kind = 'auth' and owner_id = auth.uid());

drop policy if exists daily_newsletter_flashcard_progress_own_insert on public.daily_newsletter_flashcard_progress;
create policy daily_newsletter_flashcard_progress_own_insert
  on public.daily_newsletter_flashcard_progress for insert to authenticated
  with check (owner_kind = 'auth' and owner_id = auth.uid());

drop policy if exists daily_newsletter_flashcard_progress_own_update on public.daily_newsletter_flashcard_progress;
create policy daily_newsletter_flashcard_progress_own_update
  on public.daily_newsletter_flashcard_progress for update to authenticated
  using (owner_kind = 'auth' and owner_id = auth.uid())
  with check (owner_kind = 'auth' and owner_id = auth.uid());

grant select, insert, update on public.daily_newsletter_flashcard_progress to authenticated;

create or replace function public.daily_newsletter_student_flashcard_progress_get(p_token uuid, p_post_id text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_student_id uuid;
  v_progress jsonb;
begin
  select profile.id into v_student_id
  from public.flashcard_student_session_profile(p_token) profile
  limit 1;
  if v_student_id is null then raise exception 'Student session expired'; end if;
  select saved.progress into v_progress
  from public.daily_newsletter_flashcard_progress saved
  where saved.owner_kind = 'student' and saved.owner_id = v_student_id and saved.post_id = p_post_id;
  return coalesce(v_progress, '{}'::jsonb);
end;
$function$;

create or replace function public.daily_newsletter_student_flashcard_progress_save(p_token uuid, p_post_id text, p_progress jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_student_id uuid;
  v_progress jsonb := coalesce(p_progress, '{}'::jsonb);
begin
  select profile.id into v_student_id
  from public.flashcard_student_session_profile(p_token) profile
  limit 1;
  if v_student_id is null then raise exception 'Student session expired'; end if;
  if not exists (select 1 from public.daily_newsletter_posts where id = p_post_id and published) then
    raise exception 'Newsletter post not found';
  end if;
  insert into public.daily_newsletter_flashcard_progress(owner_kind, owner_id, post_id, progress, updated_at)
  values ('student', v_student_id, p_post_id, v_progress, now())
  on conflict (owner_kind, owner_id, post_id)
  do update set progress = excluded.progress, updated_at = now();
  return v_progress;
end;
$function$;

revoke all on function public.daily_newsletter_student_flashcard_progress_get(uuid, text) from public;
revoke all on function public.daily_newsletter_student_flashcard_progress_save(uuid, text, jsonb) from public;
grant execute on function public.daily_newsletter_student_flashcard_progress_get(uuid, text) to anon, authenticated;
grant execute on function public.daily_newsletter_student_flashcard_progress_save(uuid, text, jsonb) to anon, authenticated;
