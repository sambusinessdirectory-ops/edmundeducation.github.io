-- Song Appreciation administrator bcrypt compatibility repair.
--
-- Supabase pgcrypto's Blowfish verifier accepts the $2a$ identifier. macOS
-- htpasswd emits $2y$, and the original schema also accepted $2b$; either
-- unsupported identifier passes a superficial bcrypt-format check but cannot
-- authenticate through extensions.crypt(). Existing $2y$ hashes are converted
-- losslessly to $2a$ before the stricter constraint is installed.

begin;

update public.song_appreciation_admin_accounts account
set password_hash = '$2a$' || pg_catalog.substr(account.password_hash, 5)
where account.password_hash ~ '^\$2y\$12\$[./A-Za-z0-9]{53}$';

alter table public.song_appreciation_admin_accounts
  drop constraint if exists song_appreciation_admin_accounts_password_hash_check;

alter table public.song_appreciation_admin_accounts
  add constraint song_appreciation_admin_accounts_password_hash_check
  check (password_hash ~ '^\$2a\$12\$[./A-Za-z0-9]{53}$');

create or replace function public.song_appreciation_provision_admin(
  p_name text,
  p_password_hash text
)
returns table (admin_id uuid, admin_name text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text := pg_catalog.btrim(coalesce(p_name, ''));
  v_admin_id uuid;
begin
  if pg_catalog.char_length(v_name) not between 1 and 100
    or v_name ~ '[[:cntrl:]]'
    or coalesce(p_password_hash, '')
      !~ '^\$2a\$12\$[./A-Za-z0-9]{53}$'
  then
    raise exception 'A valid name and cost-12 $2a$ bcrypt hash are required'
      using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'song-appreciation-admin:' || pg_catalog.lower(v_name),
      0
    )
  );

  select account.id
  into v_admin_id
  from public.song_appreciation_admin_accounts account
  where pg_catalog.lower(account.name) = pg_catalog.lower(v_name)
  limit 1
  for update;

  if v_admin_id is null then
    insert into public.song_appreciation_admin_accounts (
      name,
      password_hash,
      is_active
    ) values (
      v_name,
      p_password_hash,
      true
    )
    returning id into v_admin_id;
  else
    update public.song_appreciation_admin_accounts account
    set name = v_name,
        password_hash = p_password_hash,
        is_active = true
    where account.id = v_admin_id;
  end if;

  delete from public.song_appreciation_admin_sessions session_row
  where session_row.admin_id = v_admin_id;

  return query
  select account.id, account.name
  from public.song_appreciation_admin_accounts account
  where account.id = v_admin_id;
end;
$$;

-- Provisioning remains owner-only. Revoke explicitly so a future change to
-- default privileges cannot expose password rotation through the Data API.
revoke all on function public.song_appreciation_provision_admin(text, text)
  from public, anon, authenticated, service_role;

notify pgrst, 'reload schema';

commit;
