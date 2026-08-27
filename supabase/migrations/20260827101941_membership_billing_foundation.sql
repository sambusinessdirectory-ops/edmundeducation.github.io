-- Foundation only. No checkout, account provisioning, entitlement changes or live charges.
-- Seed the administrator privately AFTER applying this migration; no credentials belong here.
begin;

create schema if not exists membership_private;
revoke all on schema membership_private from public, anon, authenticated;
alter default privileges in schema membership_private revoke all on tables from public, anon, authenticated;
alter default privileges in schema membership_private revoke execute on functions from public, anon, authenticated;

create table membership_private.admin_accounts (
  id uuid primary key default gen_random_uuid(),
  username text not null unique check (char_length(username) between 1 and 80),
  password_hash text not null check (password_hash ~ '^\$2[aby]\$12\$[./A-Za-z0-9]{53}$'),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create table membership_private.admin_sessions (
  token_hash text primary key check (length(token_hash)=64),
  admin_id uuid not null references membership_private.admin_accounts(id) on delete cascade,
  auth_user_id uuid not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index membership_admin_sessions_account_idx on membership_private.admin_sessions(admin_id);
create index membership_admin_sessions_expiry_idx on membership_private.admin_sessions(expires_at);
create table membership_private.login_throttle (
  id integer primary key check (id=1),
  attempts integer not null default 0,
  window_started_at timestamptz not null default now()
);
insert into membership_private.login_throttle(id) values (1);
create table membership_private.configuration (
  id integer primary key check (id=1),
  revision integer not null default 1,
  settings jsonb not null default '{"company_name":"Edmund Education","support_email":"","terms_url":"","privacy_url":"","policy_version":"","cancellation_text":"","refund_text":"","grace_days":null}',
  updated_at timestamptz not null default now(),
  published_at timestamptz
);
insert into membership_private.configuration(id) values (1);
create table membership_private.plans (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(title) between 1 and 100),
  summary text not null default '' check(length(summary)<=1000),
  amount_minor integer check(amount_minor > 0 and amount_minor <= 100000000),
  currency text not null default 'HKD' check(currency in ('HKD','USD')),
  benefits text[] not null default '{}',
  system_ids text[] not null default '{}',
  stripe_test_price_id text not null default '' check(stripe_test_price_id='' or stripe_test_price_id ~ '^price_[A-Za-z0-9]+$'),
  stripe_live_price_id text not null default '' check(stripe_live_price_id='' or stripe_live_price_id ~ '^price_[A-Za-z0-9]+$'),
  visible boolean not null default false,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);
insert into membership_private.plans(title) values ('Edmund 月費會員');

-- This is the ONLY publicly readable table: an explicitly published, non-sensitive snapshot.
create table public.membership_catalog (
  id integer primary key check(id=1),
  payload jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.membership_catalog enable row level security;
revoke all on public.membership_catalog from public, anon, authenticated;
grant select on public.membership_catalog to anon, authenticated;
create policy membership_catalog_public_read on public.membership_catalog for select to anon, authenticated using (true);
insert into public.membership_catalog(id,payload) values (1,'{"sales_enabled":false,"phase":"foundation","plans":[],"settings":{}}');

-- Future service-only financial/identity boundary. No existing learner records are changed.
create table membership_private.learner_identities (
  id uuid primary key default gen_random_uuid(),
  normalized_email text not null unique check(normalized_email=lower(btrim(normalized_email))),
  email_verified_at timestamptz,
  auth_user_id uuid unique,
  legacy_student_id uuid unique,
  created_at timestamptz not null default now()
);
create table membership_private.signup_intents (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references membership_private.plans(id),
  payer_name text not null,
  payer_email text not null,
  learner_name text not null,
  learner_email text not null,
  status_token_hash text not null unique check(length(status_token_hash)=64),
  checkout_session_id text unique,
  state text not null default 'pending' check(state in ('pending','checkout_created','paid_pending_provisioning','active','expired','failed')),
  consent_version text not null,
  consent_at timestamptz not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index membership_signups_plan_idx on membership_private.signup_intents(plan_id);
create table membership_private.billing_customers (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references membership_private.learner_identities(id),
  payer_name text not null,
  payer_email text not null,
  stripe_customer_id text not null unique,
  livemode boolean not null default false,
  created_at timestamptz not null default now()
);
create index membership_customers_learner_idx on membership_private.billing_customers(learner_id);
create table membership_private.subscriptions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references membership_private.billing_customers(id),
  learner_id uuid not null references membership_private.learner_identities(id),
  plan_id uuid not null references membership_private.plans(id),
  stripe_subscription_id text not null unique,
  stripe_price_id text not null,
  state text not null check(state in ('incomplete','incomplete_expired','trialing','active','past_due','canceled','unpaid','paused')),
  paid_through timestamptz,
  grace_until timestamptz,
  cancel_at_period_end boolean not null default false,
  livemode boolean not null default false,
  updated_at timestamptz not null default now()
);
create index membership_subscriptions_customer_idx on membership_private.subscriptions(customer_id);
create index membership_subscriptions_plan_idx on membership_private.subscriptions(plan_id);
create index membership_subscriptions_learner_idx on membership_private.subscriptions(learner_id);
create unique index membership_one_open_subscription on membership_private.subscriptions(learner_id,livemode)
  where state in ('incomplete','trialing','active','past_due','unpaid','paused');
create table membership_private.entitlements (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references membership_private.learner_identities(id),
  subscription_id uuid not null references membership_private.subscriptions(id),
  system_id text not null,
  starts_at timestamptz not null,
  expires_at timestamptz not null check(expires_at>starts_at),
  unique(learner_id,system_id,subscription_id)
);
create index membership_entitlements_subscription_idx on membership_private.entitlements(subscription_id);
create table membership_private.billing_invoices (
  stripe_invoice_id text primary key,
  subscription_id uuid not null references membership_private.subscriptions(id),
  amount_minor bigint not null,
  currency text not null,
  state text not null,
  hosted_invoice_url text,
  invoice_pdf_url text,
  paid_at timestamptz
);
create index membership_invoices_subscription_idx on membership_private.billing_invoices(subscription_id);
create table membership_private.webhook_events (
  stripe_event_id text primary key,
  event_type text not null,
  livemode boolean not null,
  payload jsonb not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  last_error text
);
create table membership_private.provisioning_jobs (
  id uuid primary key default gen_random_uuid(),
  signup_id uuid not null unique references membership_private.signup_intents(id),
  state text not null default 'pending' check(state in ('pending','processing','complete','retry','failed')),
  attempts integer not null default 0,
  next_attempt_at timestamptz not null default now(),
  last_error text
);
create index membership_provisioning_ready_idx on membership_private.provisioning_jobs(next_attempt_at) where state in ('pending','retry');
create table membership_private.activation_tokens (
  token_hash text primary key check(length(token_hash)=64),
  learner_id uuid not null references membership_private.learner_identities(id),
  expires_at timestamptz not null,
  used_at timestamptz
);
create index membership_activation_learner_idx on membership_private.activation_tokens(learner_id);
create table membership_private.admin_audit (
  id bigint generated always as identity primary key,
  admin_id uuid not null references membership_private.admin_accounts(id),
  action text not null,
  revision integer,
  created_at timestamptz not null default now()
);
create index membership_audit_admin_idx on membership_private.admin_audit(admin_id);

do $$ declare t record; begin
  for t in select tablename from pg_tables where schemaname='membership_private' loop
    execute format('alter table membership_private.%I enable row level security',t.tablename);
    execute format('revoke all on membership_private.%I from public, anon, authenticated',t.tablename);
  end loop;
end $$;

create function membership_private.require_admin(p_token text) returns uuid
language plpgsql security definer set search_path='' as $$
declare v_admin uuid;
begin
  if auth.uid() is null or p_token is null or p_token !~ '^[a-f0-9]{64}$' then
    raise exception 'Admin authentication required' using errcode='42501';
  end if;
  select a.id into v_admin from membership_private.admin_sessions s
  join membership_private.admin_accounts a on a.id=s.admin_id
  where s.token_hash=encode(extensions.digest(p_token,'sha256'),'hex')
    and s.auth_user_id=auth.uid() and s.expires_at>now() and a.active;
  if v_admin is null then raise exception 'Admin session expired' using errcode='42501'; end if;
  return v_admin;
end $$;

create function membership_private.admin_login(p_name text,p_password text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare a membership_private.admin_accounts; t membership_private.login_throttle; v_token text;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
  select * into t from membership_private.login_throttle where id=1 for update;
  if t.window_started_at < now()-interval '15 minutes' then
    update membership_private.login_throttle set attempts=0,window_started_at=now() where id=1;
    t.attempts:=0;
  end if;
  if t.attempts>=5 then return jsonb_build_object('ok',false,'reason','rate_limited'); end if;
  select * into a from membership_private.admin_accounts where username=btrim(p_name) and active;
  if p_password is null or octet_length(p_password)>72 or a.id is null
    or a.password_hash<>extensions.crypt(p_password,a.password_hash) then
    update membership_private.login_throttle set attempts=attempts+1 where id=1;
    return jsonb_build_object('ok',false,'reason','invalid_credentials');
  end if;
  update membership_private.login_throttle set attempts=0,window_started_at=now() where id=1;
  delete from membership_private.admin_sessions where expires_at<=now();
  v_token:=encode(extensions.gen_random_bytes(32),'hex');
  insert into membership_private.admin_sessions(token_hash,admin_id,auth_user_id,expires_at)
    values(encode(extensions.digest(v_token,'sha256'),'hex'),a.id,auth.uid(),now()+interval '1 hour');
  insert into membership_private.admin_audit(admin_id,action) values(a.id,'login');
  return jsonb_build_object('ok',true,'token',v_token);
end $$;

create function membership_private.admin_load(p_admin_token text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_admin uuid; c membership_private.configuration; v_plans jsonb; v_expires timestamptz;
begin
  v_admin:=membership_private.require_admin(p_admin_token);
  select * into c from membership_private.configuration where id=1;
  select coalesce(jsonb_agg(to_jsonb(p) order by p.sort_order,p.id),'[]'::jsonb) into v_plans from membership_private.plans p;
  select expires_at into v_expires from membership_private.admin_sessions where token_hash=encode(extensions.digest(p_admin_token,'sha256'),'hex');
  return jsonb_build_object('revision',c.revision,'settings',c.settings,'plans',v_plans,'updated_at',c.updated_at,
    'published_at',c.published_at,'expires_at',v_expires,'sales_enabled',false,
    'counts',jsonb_build_object('subscriptions',(select count(*) from membership_private.subscriptions),
      'events',(select count(*) from membership_private.webhook_events),
      'jobs',(select count(*) from membership_private.provisioning_jobs where state<>'complete')));
end $$;

create function membership_private.admin_save(p_admin_token text,p_settings jsonb,p_plans jsonb,p_revision integer,p_publish boolean) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_admin uuid; c membership_private.configuration; p jsonb; s jsonb; v_benefits text[]; v_systems text[]; v_order integer:=0; v_id uuid; v_amount integer; v_catalog jsonb;
begin
  v_admin:=membership_private.require_admin(p_admin_token);
  if p_settings is null or jsonb_typeof(p_settings)<>'object' or p_plans is null or jsonb_typeof(p_plans)<>'array' then raise exception 'Invalid configuration'; end if;
  if octet_length(p_settings::text)>16000 or octet_length(p_plans::text)>100000 or jsonb_array_length(p_plans) not between 1 and 12 then raise exception 'Configuration too large'; end if;
  if (p_settings::text||p_plans::text) ~ '(sk_live_|sk_test_|whsec_|sb_secret_)' then raise exception 'Do not store secret keys in the plan editor'; end if;
  select * into c from membership_private.configuration where id=1 for update;
  if p_revision is distinct from c.revision then raise exception 'Revision conflict' using errcode='40001'; end if;
  s:=jsonb_build_object('company_name',btrim(coalesce(p_settings->>'company_name','')),'support_email',btrim(coalesce(p_settings->>'support_email','')),
    'terms_url',btrim(coalesce(p_settings->>'terms_url','')),'privacy_url',btrim(coalesce(p_settings->>'privacy_url','')),
    'policy_version',btrim(coalesce(p_settings->>'policy_version','')),'cancellation_text',btrim(coalesce(p_settings->>'cancellation_text','')),
    'refund_text',btrim(coalesce(p_settings->>'refund_text','')),'grace_days',(p_settings->>'grace_days')::integer);
  if length(s->>'company_name')>160 or length(s->>'support_email')>254 or length(s->>'policy_version')>80 or length(s->>'cancellation_text')>4000 or length(s->>'refund_text')>4000 then raise exception 'Setting exceeds maximum length'; end if;
  if (s->>'support_email')<>'' and (s->>'support_email') !~ '^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$' then raise exception 'Invalid support email'; end if;
  if (s->>'grace_days')::integer not between 0 and 30 then raise exception 'Grace period must be between 0 and 30 days'; end if;
  if exists(select 1 from jsonb_each_text(s) e where e.key in ('terms_url','privacy_url') and e.value<>'' and (length(e.value)>1000 or e.value !~ '^https://[^/\s@]+(/[^\s]*)?$')) then raise exception 'Policy URLs must use HTTPS'; end if;
  if (select count(distinct x->>'id') from jsonb_array_elements(p_plans) x) <> jsonb_array_length(p_plans) then raise exception 'Duplicate plan identifiers'; end if;
  -- Never delete existing plans/history when a client omits them.
  if exists(select 1 from membership_private.plans old where not exists(select 1 from jsonb_array_elements(p_plans) x where x->>'id'=old.id::text)) then raise exception 'Existing plans must be retained; hide them instead'; end if;
  for p in select value from jsonb_array_elements(p_plans) loop
    v_id:=(p->>'id')::uuid;
    if p->>'title' is null or btrim(p->>'title')='' or length(p->>'title')>100 then raise exception 'Plan title is required'; end if;
    if jsonb_typeof(p->'benefits') is distinct from 'array' or jsonb_typeof(p->'system_ids') is distinct from 'array' then raise exception 'Invalid plan contents'; end if;
    if exists(select 1 from jsonb_array_elements(p->'benefits') x where jsonb_typeof(x)<>'string' or length(x#>>'{}')>300)
      or jsonb_array_length(p->'benefits')>30 then raise exception 'Benefits must be text, maximum 30 items of 300 characters'; end if;
    select coalesce(array_agg(btrim(x)) filter(where btrim(x)<>''),'{}') into v_benefits from jsonb_array_elements_text(p->'benefits') x;
    select coalesce(array_agg(distinct x),'{}') into v_systems from jsonb_array_elements_text(p->'system_ids') x;
    if not v_systems <@ array['flashcards','writing-practice','writing-submission','listening','speaking','grammar','sentence-structure','idiom','proverb','phrasal-verb','video-class','schedule','song-appreciation','reading-comprehension'] then raise exception 'Unknown included system'; end if;
    v_amount:=(p->>'amount_minor')::integer;
    if p_publish and coalesce((p->>'visible')::boolean,false) and (v_amount is null or cardinality(v_benefits)=0 or cardinality(v_systems)=0) then raise exception 'Published plans need a price, benefits and included systems'; end if;
    insert into membership_private.plans(id,title,summary,amount_minor,currency,benefits,system_ids,stripe_test_price_id,stripe_live_price_id,visible,sort_order)
    values(v_id,btrim(p->>'title'),coalesce(p->>'summary',''),v_amount,coalesce(p->>'currency','HKD'),v_benefits,v_systems,
      coalesce(p->>'stripe_test_price_id',''),coalesce(p->>'stripe_live_price_id',''),coalesce((p->>'visible')::boolean,false),v_order)
    on conflict(id) do update set title=excluded.title,summary=excluded.summary,amount_minor=excluded.amount_minor,currency=excluded.currency,
      benefits=excluded.benefits,system_ids=excluded.system_ids,stripe_test_price_id=excluded.stripe_test_price_id,
      stripe_live_price_id=excluded.stripe_live_price_id,visible=excluded.visible,sort_order=excluded.sort_order,updated_at=now();
    v_order:=v_order+1;
  end loop;
  update membership_private.configuration set settings=s,revision=revision+1,updated_at=now(),published_at=case when p_publish then now() else published_at end where id=1;
  if p_publish then
    select coalesce(jsonb_agg(jsonb_build_object('id',id,'title',title,'summary',summary,'amount_minor',amount_minor,'currency',currency,'benefits',benefits) order by sort_order,id),'[]') into v_catalog from membership_private.plans where visible;
    update public.membership_catalog set payload=jsonb_build_object('sales_enabled',false,'phase','foundation','plans',v_catalog,
      'settings',jsonb_build_object('support_email',s->>'support_email','cancellation_text',s->>'cancellation_text','refund_text',s->>'refund_text','terms_url',s->>'terms_url','privacy_url',s->>'privacy_url')),updated_at=now() where id=1;
  end if;
  insert into membership_private.admin_audit(admin_id,action,revision) values(v_admin,case when p_publish then 'publish_preview' else 'save_draft' end,c.revision+1);
  return jsonb_build_object('ok',true,'sales_enabled',false,'revision',c.revision+1);
end $$;

create function membership_private.admin_logout(p_admin_token text) returns void
language plpgsql security definer set search_path='' as $$
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
  delete from membership_private.admin_sessions where auth_user_id=auth.uid() and token_hash=encode(extensions.digest(p_admin_token,'sha256'),'hex');
end $$;
create function membership_private.revoke_admin_sessions() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if old.password_hash is distinct from new.password_hash or old.active is distinct from new.active then
    delete from membership_private.admin_sessions where admin_id=new.id;
  end if;
  return new;
end $$;
create trigger membership_admin_credential_change after update on membership_private.admin_accounts
  for each row execute function membership_private.revoke_admin_sessions();

-- Exposed wrappers are invoker-only. The private implementations enforce authenticated
-- browser UID + a hashed, expiring administrator token before any privileged operation.
create function public.membership_admin_login(p_name text,p_password text) returns jsonb language sql security invoker set search_path='' as $$ select membership_private.admin_login(p_name,p_password) $$;
create function public.membership_admin_load(p_admin_token text) returns jsonb language sql security invoker set search_path='' as $$ select membership_private.admin_load(p_admin_token) $$;
create function public.membership_admin_save(p_admin_token text,p_settings jsonb,p_plans jsonb,p_revision integer,p_publish boolean default false) returns jsonb language sql security invoker set search_path='' as $$ select membership_private.admin_save(p_admin_token,p_settings,p_plans,p_revision,p_publish) $$;
create function public.membership_admin_logout(p_admin_token text) returns void language sql security invoker set search_path='' as $$ select membership_private.admin_logout(p_admin_token) $$;
revoke all on all functions in schema membership_private from public,anon,authenticated;
revoke all on function public.membership_admin_login(text,text),public.membership_admin_load(text),public.membership_admin_save(text,jsonb,jsonb,integer,boolean),public.membership_admin_logout(text) from public,anon,authenticated;
grant usage on schema membership_private to authenticated;
grant execute on function membership_private.admin_login(text,text),membership_private.admin_load(text),membership_private.admin_save(text,jsonb,jsonb,integer,boolean),membership_private.admin_logout(text) to authenticated;
grant execute on function public.membership_admin_login(text,text),public.membership_admin_load(text),public.membership_admin_save(text,jsonb,jsonb,integer,boolean),public.membership_admin_logout(text) to authenticated;
comment on schema membership_private is 'Unexposed membership configuration and billing foundation. Financial and learner records are not accessible to browser roles. Sales disabled.';
commit;
