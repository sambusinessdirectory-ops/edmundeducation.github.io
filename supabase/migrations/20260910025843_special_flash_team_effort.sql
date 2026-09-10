create table public.special_flash_attempts (
  id bigint generated always as identity primary key,
  account_id uuid not null references public.special_flash_accounts(id) on delete cascade,
  deck_id uuid not null references public.special_flash_decks(id) on delete cascade,
  attempt_key text not null,
  ended_at timestamptz not null,
  cards integer not null check (cards > 0 and cards <= 5000),
  known integer not null default 0 check (known >= 0),
  review integer not null default 0 check (review >= 0),
  duration_ms bigint not null default 0 check (duration_ms >= 0),
  created_at timestamptz not null default now(),
  unique (account_id, deck_id, attempt_key)
);

create index special_flash_attempts_deck_date_idx
  on public.special_flash_attempts (deck_id, ended_at);
create index special_flash_attempts_account_date_idx
  on public.special_flash_attempts (account_id, ended_at);

alter table public.special_flash_attempts enable row level security;
revoke all on public.special_flash_attempts from public, anon, authenticated, service_role;

create function public._special_flash_capture_attempts()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  item jsonb;
  ended_ms bigint;
  card_count integer;
begin
  if new.study is null or jsonb_typeof(new.study -> 'history') is distinct from 'array' then
    return new;
  end if;

  for item in select value from jsonb_array_elements(new.study -> 'history') loop
    begin
      ended_ms := (item ->> 'endedAt')::bigint;
      card_count := (item ->> 'cards')::integer;
    exception when others then
      continue;
    end;
    if ended_ms <= 0 or card_count <= 0 or card_count > 5000 then continue; end if;

    insert into public.special_flash_attempts (
      account_id, deck_id, attempt_key, ended_at, cards, known, review, duration_ms
    ) values (
      new.account_id,
      new.deck_id,
      md5(item::text),
      to_timestamp(ended_ms / 1000.0),
      card_count,
      greatest(0, coalesce((item ->> 'known')::integer, 0)),
      greatest(0, coalesce((item ->> 'review')::integer, 0)),
      greatest(0, coalesce((item ->> 'durationMs')::bigint, 0))
    ) on conflict (account_id, deck_id, attempt_key) do nothing;
  end loop;
  return new;
end
$$;

revoke all on function public._special_flash_capture_attempts() from public, anon, authenticated, service_role;

create trigger special_flash_capture_attempts
after insert or update of study on public.special_flash_progress
for each row execute function public._special_flash_capture_attempts();

-- Preserve completed rounds that predate the attempt ledger.
insert into public.special_flash_attempts (
  account_id, deck_id, attempt_key, ended_at, cards, known, review, duration_ms
)
select
  p.account_id,
  p.deck_id,
  md5(history.item::text),
  to_timestamp((history.item ->> 'endedAt')::bigint / 1000.0),
  (history.item ->> 'cards')::integer,
  greatest(0, coalesce((history.item ->> 'known')::integer, 0)),
  greatest(0, coalesce((history.item ->> 'review')::integer, 0)),
  greatest(0, coalesce((history.item ->> 'durationMs')::bigint, 0))
from public.special_flash_progress p
cross join lateral jsonb_array_elements(
  case when jsonb_typeof(p.study -> 'history') = 'array' then p.study -> 'history' else '[]'::jsonb end
) as history(item)
where (history.item ->> 'endedAt') ~ '^[0-9]+$'
  and (history.item ->> 'cards') ~ '^[0-9]+$'
  and (history.item ->> 'endedAt')::bigint > 0
  and (history.item ->> 'cards')::integer between 1 and 5000
on conflict (account_id, deck_id, attempt_key) do nothing;

create function public.special_flash_team_effort(p_token uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  viewer public.special_flash_accounts := public._special_flash_account(p_token);
  payload jsonb;
begin
  if viewer.id is null then
    raise exception 'Please sign in again.' using errcode = '42501';
  end if;

  select coalesce(jsonb_agg(course_data order by course_title), '[]'::jsonb)
  into payload
  from (
    select
      c.title as course_title,
      jsonb_build_object(
        'course_id', c.id,
        'course_title', c.title,
        'total_cards', coalesce((
          select sum(at.cards)
          from public.special_flash_attempts at
          join public.special_flash_decks d on d.id = at.deck_id
          where d.course_id = c.id
        ), 0),
        'members', coalesce((
          select jsonb_agg(jsonb_build_object(
            'account_id', member.id,
            'username', member.username,
            'cards', coalesce(member_cards.cards, 0)
          ) order by coalesce(member_cards.cards, 0) desc, lower(member.username))
          from public.special_flash_enrollments membership
          join public.special_flash_accounts member on member.id = membership.account_id and member.role = 'student' and member.active
          left join lateral (
            select sum(at.cards)::bigint as cards
            from public.special_flash_attempts at
            join public.special_flash_decks d on d.id = at.deck_id
            where at.account_id = member.id and d.course_id = c.id
          ) member_cards on true
          where membership.course_id = c.id
        ), '[]'::jsonb),
        'daily', coalesce((
          select jsonb_agg(jsonb_build_object(
            'date', daily.practice_date,
            'account_id', daily.account_id,
            'username', daily.username,
            'cards', daily.cards
          ) order by daily.practice_date, lower(daily.username))
          from (
            select
              to_char(at.ended_at at time zone 'Asia/Hong_Kong', 'YYYY-MM-DD') as practice_date,
              at.account_id,
              member.username,
              sum(at.cards)::bigint as cards
            from public.special_flash_attempts at
            join public.special_flash_decks d on d.id = at.deck_id and d.course_id = c.id
            join public.special_flash_accounts member on member.id = at.account_id and member.role = 'student' and member.active
            join public.special_flash_enrollments membership on membership.account_id = member.id and membership.course_id = c.id
            group by practice_date, at.account_id, member.username
          ) daily
        ), '[]'::jsonb)
      ) as course_data
    from public.special_flash_courses c
    where c.active
      and (
        viewer.role = 'admin'
        or exists (
          select 1 from public.special_flash_enrollments viewer_membership
          where viewer_membership.account_id = viewer.id and viewer_membership.course_id = c.id
        )
      )
  ) visible_courses;

  return jsonb_build_object('courses', payload);
end
$$;

revoke all on function public.special_flash_team_effort(uuid) from public, anon, authenticated, service_role;
grant execute on function public.special_flash_team_effort(uuid) to anon, authenticated;
