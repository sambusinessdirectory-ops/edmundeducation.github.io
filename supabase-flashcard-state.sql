create table if not exists public.flashcard_state_private (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  key text not null,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

create or replace function public.set_flashcard_state_private_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists flashcard_state_private_set_updated_at on public.flashcard_state_private;
create trigger flashcard_state_private_set_updated_at
before update on public.flashcard_state_private
for each row
execute function public.set_flashcard_state_private_updated_at();

alter table public.flashcard_state_private enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.flashcard_state_private to authenticated;

drop policy if exists "Users can read their own flashcard state" on public.flashcard_state_private;
create policy "Users can read their own flashcard state"
on public.flashcard_state_private
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create their own flashcard state" on public.flashcard_state_private;
create policy "Users can create their own flashcard state"
on public.flashcard_state_private
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own flashcard state" on public.flashcard_state_private;
create policy "Users can update their own flashcard state"
on public.flashcard_state_private
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own flashcard state" on public.flashcard_state_private;
create policy "Users can delete their own flashcard state"
on public.flashcard_state_private
for delete
to authenticated
using (auth.uid() = user_id);

do $$
begin
  alter publication supabase_realtime add table public.flashcard_state_private;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
