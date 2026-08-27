-- Eddie Farm: private, server-owned rewards and seed inventory.
-- Reward configuration and administrator credentials are provisioned separately.
-- No existing exercise data is changed and past work is baselined, not rewarded.
begin;
set local lock_timeout = '5s';

create schema eddie_farm;
revoke all on schema eddie_farm from public, anon, authenticated;
grant usage on schema eddie_farm to anon, authenticated;

create table eddie_farm.rules (
  system_key text primary key check (length(system_key) between 1 and 100),
  label text not null,
  exercise_count integer not null check (exercise_count between 1 and 10000),
  points integer not null check (points between 0 and 10000),
  enabled boolean not null default true,
  revision integer not null default 1,
  updated_at timestamptz not null default now()
);
create table eddie_farm.wallets (
  student_id uuid primary key references public.flashcard_students(id) on delete cascade,
  balance bigint not null default 0 check (balance >= 0)
);
create table eddie_farm.source_counts (
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  system_key text not null,
  source_key text not null,
  units bigint not null check (units >= 0),
  primary key (student_id, system_key, source_key)
);
create table eddie_farm.counters (
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  system_key text not null,
  rule_key text not null,
  revision integer not null,
  pending bigint not null default 0 check (pending >= 0),
  primary key (student_id, system_key)
);
create table eddie_farm.ledger (
  id bigint generated always as identity primary key,
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  kind text not null,
  system_key text,
  points bigint not null,
  created_at timestamptz not null default now()
);
create index on eddie_farm.ledger(student_id, created_at);
create table eddie_farm.activity_days (
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  day date not null,
  primary key (student_id, day)
);
create table eddie_farm.seeds (
  id text primary key,
  name text not null,
  price integer not null default 5 check (price = 5),
  enabled boolean not null default true
);
insert into eddie_farm.seeds(id,name) values
 ('carrot','Carrot'),('tomato','Tomato'),('corn','Sweet corn'),('wheat','Wheat'),
 ('lettuce','Lettuce'),('cabbage','Cabbage'),('potato','Potato'),('pumpkin','Pumpkin'),
 ('strawberry','Strawberry'),('beetroot','Beetroot'),('pepper','Bell pepper'),
 ('watermelon','Watermelon'),('cucumber','Cucumber'),('onion','Onion'),
 ('eggplant','Eggplant'),('sunflower','Sunflower'),('radish','Radish'),('pea','Pea and climbing bean');
create table eddie_farm.inventory (
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  seed_id text not null references eddie_farm.seeds(id),
  quantity bigint not null default 0 check (quantity >= 0),
  primary key(student_id,seed_id)
);
create index on eddie_farm.inventory(seed_id);
create table eddie_farm.operations (
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  request_id uuid not null,
  kind text not null,
  seed_id text not null references eddie_farm.seeds(id),
  plot_id text,
  created_at timestamptz not null default now(),
  primary key(student_id,request_id)
);
create index on eddie_farm.operations(seed_id);
create table eddie_farm.plots (
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  plot_id text not null check (plot_id ~ '^bed-[1-8]$'),
  seed_id text not null references eddie_farm.seeds(id),
  planted_at timestamptz not null default now(),
  primary key(student_id,plot_id)
);
create index on eddie_farm.plots(seed_id);
create table eddie_farm.harvests (
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  seed_id text not null references eddie_farm.seeds(id),
  quantity bigint not null default 0 check (quantity >= 0),
  primary key(student_id,seed_id)
);
create index on eddie_farm.harvests(seed_id);
create table eddie_farm.admin_accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  password_hash text not null,
  active boolean not null default true
);
create table eddie_farm.admin_sessions (
  token_hash bytea primary key,
  admin_id uuid not null references eddie_farm.admin_accounts(id) on delete cascade,
  expires_at timestamptz not null
);
create index on eddie_farm.admin_sessions(admin_id);
create index on eddie_farm.admin_sessions(expires_at);
create table eddie_farm.login_throttles (
  name_hash text primary key,
  attempts integer not null default 0,
  window_start timestamptz not null default now()
);
create table eddie_farm.rule_audit (
  id bigint generated always as identity primary key,
  admin_id uuid not null references eddie_farm.admin_accounts(id),
  system_key text not null,
  before_value jsonb not null,
  after_value jsonb not null,
  changed_at timestamptz not null default now()
);
create index on eddie_farm.rule_audit(admin_id);
-- Listening previously marked locally only; retain submitted answers, not
-- client-supplied point totals. Rechecking the same question is idempotent.
create table eddie_farm.listening_answers (
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  question_number integer not null check (question_number between 1 and 40),
  answer text not null check (length(answer) between 1 and 200),
  primary key(student_id,question_number)
);

create function eddie_farm.student_id(p_token uuid) returns uuid
language plpgsql security definer set search_path='' as $$
declare v_id uuid;
begin
  v_id := public.flashcard_session_student_id(p_token);
  if v_id is null then raise exception 'Please log in again.' using errcode='42501'; end if;
  return v_id;
end $$;

create function eddie_farm.lock_wallet(p_student uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
  insert into eddie_farm.wallets(student_id) values(p_student) on conflict do nothing;
  perform 1 from eddie_farm.wallets where student_id=p_student for update;
end $$;

create function eddie_farm.visit_student(p_student uuid) returns void
language plpgsql security definer set search_path='' as $$
declare v_day date := (now() at time zone 'Asia/Hong_Kong')::date; v_rule eddie_farm.rules%rowtype;
begin
  perform eddie_farm.lock_wallet(p_student);
  insert into eddie_farm.activity_days(student_id,day) values(p_student,v_day) on conflict do nothing;
  if not found then return; end if;
  if exists(select 1 from eddie_farm.activity_days where student_id=p_student and day=v_day-1) then
    select * into v_rule from eddie_farm.rules where system_key='daily-return' and enabled;
    if found and v_rule.points>0 then
      update eddie_farm.wallets set balance=balance+v_rule.points where student_id=p_student;
      insert into eddie_farm.ledger(student_id,kind,system_key,points) values(p_student,'return','daily-return',v_rule.points);
    end if;
  end if;
end $$;

create function eddie_farm.observe(p_student uuid,p_system text,p_source text,p_units bigint,p_baseline boolean default false)
returns void language plpgsql security definer set search_path='' as $$
declare v_old bigint; v_delta bigint; v_rule eddie_farm.rules%rowtype; v_counter eddie_farm.counters%rowtype; v_pending bigint; v_points bigint;
begin
  if p_student is null or p_source is null or p_units is null or p_units<0 then return; end if;
  -- Every path locks wallet before counters/inventory/ledger: no lock inversion.
  if not p_baseline then perform eddie_farm.lock_wallet(p_student); end if;
  select units into v_old from eddie_farm.source_counts where student_id=p_student and system_key=p_system and source_key=p_source;
  v_delta:=p_units-coalesce(v_old,0);
  if v_delta<=0 then return; end if;
  insert into eddie_farm.source_counts values(p_student,p_system,p_source,p_units)
  on conflict(student_id,system_key,source_key) do update set units=greatest(eddie_farm.source_counts.units,excluded.units);
  if p_baseline then return; end if;
  perform eddie_farm.visit_student(p_student);
  select * into v_rule from eddie_farm.rules where system_key in(p_system,'*') order by (system_key=p_system) desc limit 1;
  if not found or not v_rule.enabled then return; end if;
  select * into v_counter from eddie_farm.counters where student_id=p_student and system_key=p_system;
  v_pending:=v_delta+case when v_counter.revision=v_rule.revision and v_counter.rule_key=v_rule.system_key then v_counter.pending else 0 end;
  v_points:=(v_pending/v_rule.exercise_count)*v_rule.points;
  insert into eddie_farm.counters values(p_student,p_system,v_rule.system_key,v_rule.revision,v_pending%v_rule.exercise_count)
  on conflict(student_id,system_key) do update set rule_key=excluded.rule_key,revision=excluded.revision,pending=excluded.pending;
  if v_points>0 then
    update eddie_farm.wallets set balance=balance+v_points where student_id=p_student;
    insert into eddie_farm.ledger(student_id,kind,system_key,points) values(p_student,'exercise',p_system,v_points);
  end if;
end $$;

create function eddie_farm.array_value(p_value jsonb) returns jsonb
language sql immutable set search_path='' as $$ select case when jsonb_typeof(p_value)='array' then p_value else '[]'::jsonb end $$;

-- Converts canonical, already-saved source records into monotonic completion
-- counts. Stable attempt/question keys survive retries, resets and reimports.
create function eddie_farm.source_rows(p_table text,p_row jsonb)
returns table(student_id uuid,system_key text,source_key text,units bigint)
language plpgsql stable security definer set search_path='' as $$
declare a jsonb; v_result jsonb;
begin
  student_id:=(p_row->>'student_id')::uuid;
  source_key:=p_table||':'||coalesce(p_row->>'id',p_row->>'attempt_id');
  case p_table
  when 'flashcard_student_state' then
    if p_row->>'key'<>'edmundFlashcardAttempts' then return; end if;
    for a in select value from jsonb_array_elements(eddie_farm.array_value(case when jsonb_typeof(p_row->'value')='array' then p_row->'value' else p_row->'value'->'attempts' end)) loop
      if nullif(a->>'id','') is null then continue; end if;
      system_key:='flashcards'; source_key:='flashcards:'||(a->>'id');
      select count(distinct coalesce(o->>'key',(o->>'deckId')||':'||(o->>'index'),o->>'index',o->>'front')) into units
      from jsonb_array_elements(eddie_farm.array_value(a->'cardOutcomes')) o where o->>'status' in ('red','green');
      units:=greatest(units,least(coalesce(public._student_progress_json_number(a->'totalCards'),0),coalesce(public._student_progress_json_number(a->'answeredCount'),0))::bigint);
      return next;
    end loop;
    return;
  when 'sentence_structure_attempts','idiom_system_attempts','proverb_system_attempts','phrasal_verb_system_attempts' then
    system_key:=case p_table when 'sentence_structure_attempts' then 'sentence-structure' when 'idiom_system_attempts' then 'idioms' when 'proverb_system_attempts' then 'proverbs' else 'phrasal-verbs' end;
    v_result:=p_row->'result';
    select count(distinct q) into units from (
      select jsonb_array_elements_text(eddie_farm.array_value(v_result->'correctIds')) q
      union all
      select jsonb_array_elements_text(eddie_farm.array_value(r->'checkedIds')) q from jsonb_array_elements(eddie_farm.array_value(v_result->'rounds')) r
    ) checked;
  when 'writing_practice_attempts' then
    select coalesce(w.shared_account_id,s.id) into student_id from public.writing_student_accounts w
    left join public.flashcard_students s on lower(btrim(s.name))=lower(btrim(w.name)) and s.deleted_at is null where w.id=(p_row->>'student_id')::uuid;
    system_key:='writing-practice'; units:=(p_row->>'total_count')::bigint;
  when 'learning_portal_progress_events' then system_key:=p_row->>'system_key'; source_key:='portal:'||(p_row->>'event_key'); units:=(p_row->>'activity_count')::bigint;
  when 'common_expression_question_completions' then system_key:=p_row->>'system_key'; source_key:='common:'||(p_row->>'lesson_id')||':'||(p_row->>'question_id'); units:=1;
  when 'reading_comprehension_question_results' then system_key:='reading-comprehension'; source_key:='reading:'||(p_row->>'attempt_id')||':'||(p_row->>'question_number'); units:=1;
  when 'song_appreciation_attempts' then system_key:='song-appreciation'; units:=(p_row->>'total_count')::bigint;
  when 'speaking_exam_attempts' then
    system_key:='speaking'; units:=case when p_row->>'completed_at' is not null then greatest(0,jsonb_array_length(eddie_farm.array_value(p_row->'question_manifest'))-jsonb_array_length(eddie_farm.array_value(p_row->'skipped_question_orders'))) else 0 end;
  when 'speaking_recording_attempts' then system_key:='speaking-recordings'; units:=case when p_row->>'storage_state'='ready' then 1 else 0 end;
  when 'writing_submissions' then system_key:='writing-submission'; units:=1;
  else return;
  end case;
  return next;
end $$;

create function eddie_farm.capture_completion() returns trigger
language plpgsql security definer set search_path='' as $$
declare r record;
begin
  for r in select * from eddie_farm.source_rows(TG_TABLE_NAME,to_jsonb(new)) loop
    perform eddie_farm.observe(r.student_id,r.system_key,r.source_key,r.units);
  end loop;
  return new;
end $$;

-- Snapshot before installing triggers in the same transaction. Do not replay
-- this baseline on an already-running installation.
do $$ declare t text; row_value jsonb; r record;
begin
  foreach t in array array['flashcard_student_state','sentence_structure_attempts','idiom_system_attempts','proverb_system_attempts','phrasal_verb_system_attempts','writing_practice_attempts','learning_portal_progress_events','common_expression_question_completions','reading_comprehension_question_results','song_appreciation_attempts','speaking_exam_attempts','speaking_recording_attempts','writing_submissions'] loop
    execute format('lock table public.%I in share row exclusive mode',t);
    for row_value in execute format('select to_jsonb(s) from public.%I s %s',t,case when t='flashcard_student_state' then 'where key=''edmundFlashcardAttempts''' else '' end) loop
      for r in select * from eddie_farm.source_rows(t,row_value) loop
        perform eddie_farm.observe(r.student_id,r.system_key,r.source_key,r.units,true);
      end loop;
    end loop;
    execute format('create trigger eddie_farm_completion after insert or update on public.%I for each row %s execute function eddie_farm.capture_completion()',t,
      case when t='flashcard_student_state' then 'when (new.key=''edmundFlashcardAttempts'')' else '' end);
  end loop;
end $$;

create function eddie_farm.visit(p_token uuid) returns boolean
language plpgsql security definer set search_path='' as $$
begin perform eddie_farm.visit_student(eddie_farm.student_id(p_token)); return true; end $$;

create function eddie_farm.snapshot(p_token uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_student uuid:=eddie_farm.student_id(p_token);
begin
  perform eddie_farm.visit_student(v_student);
  return jsonb_build_object(
    'id',v_student,'name',(select name from public.flashcard_students where id=v_student),
    'balance',(select balance from eddie_farm.wallets where student_id=v_student),
    'seeds',(select coalesce(jsonb_agg(jsonb_build_object('id',s.id,'name',s.name,'price',s.price,'quantity',coalesce(i.quantity,0)) order by s.name),'[]'::jsonb) from eddie_farm.seeds s left join eddie_farm.inventory i on i.seed_id=s.id and i.student_id=v_student where s.enabled),
    'plots',(select coalesce(jsonb_agg(jsonb_build_object('id',p.plot_id,'cropId',p.seed_id,'plantedAt',extract(epoch from p.planted_at)*1000)),'[]'::jsonb) from eddie_farm.plots p where p.student_id=v_student),
    'harvests',(select coalesce(jsonb_agg(jsonb_build_object('id',h.seed_id,'quantity',h.quantity)),'[]'::jsonb) from eddie_farm.harvests h where h.student_id=v_student)
  );
end $$;

create function eddie_farm.purchase(p_token uuid,p_seed text,p_request uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_student uuid:=eddie_farm.student_id(p_token); v_price integer; v_existing eddie_farm.operations%rowtype;
begin
  if p_request is null then raise exception 'A purchase reference is required.'; end if;
  perform eddie_farm.lock_wallet(v_student);
  select * into v_existing from eddie_farm.operations where student_id=v_student and request_id=p_request;
  if found then
    if v_existing.kind<>'purchase' or v_existing.seed_id<>p_seed then raise exception 'Purchase reference was already used.'; end if;
    return eddie_farm.snapshot(p_token);
  end if;
  select price into v_price from eddie_farm.seeds where id=p_seed and enabled;
  if not found then raise exception 'This seed is not available.'; end if;
  update eddie_farm.wallets set balance=balance-v_price where student_id=v_student and balance>=v_price;
  if not found then raise exception 'Not enough points.' using errcode='P0001'; end if;
  insert into eddie_farm.inventory values(v_student,p_seed,1) on conflict(student_id,seed_id) do update set quantity=eddie_farm.inventory.quantity+1;
  insert into eddie_farm.operations(student_id,request_id,kind,seed_id) values(v_student,p_request,'purchase',p_seed);
  insert into eddie_farm.ledger(student_id,kind,points) values(v_student,'purchase',-v_price);
  return eddie_farm.snapshot(p_token);
end $$;

create function eddie_farm.plant(p_token uuid,p_seed text,p_plot text,p_request uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_student uuid:=eddie_farm.student_id(p_token); v_existing eddie_farm.operations%rowtype;
begin
  if p_request is null or p_plot is null or p_plot !~ '^bed-[1-8]$' then raise exception 'Invalid planting request.'; end if;
  perform eddie_farm.lock_wallet(v_student);
  select * into v_existing from eddie_farm.operations where student_id=v_student and request_id=p_request;
  if found then
    if v_existing.kind<>'plant' or v_existing.seed_id<>p_seed or v_existing.plot_id<>p_plot then raise exception 'Planting reference was already used.'; end if;
    return eddie_farm.snapshot(p_token);
  end if;
  if exists(select 1 from eddie_farm.plots where student_id=v_student and plot_id=p_plot) then raise exception 'This garden bed is already planted.'; end if;
  update eddie_farm.inventory set quantity=quantity-1 where student_id=v_student and seed_id=p_seed and quantity>0;
  if not found then raise exception 'Buy this seed from the shop first.'; end if;
  insert into eddie_farm.plots values(v_student,p_plot,p_seed,now());
  insert into eddie_farm.operations(student_id,request_id,kind,seed_id,plot_id) values(v_student,p_request,'plant',p_seed,p_plot);
  return eddie_farm.snapshot(p_token);
end $$;

create function eddie_farm.harvest(p_token uuid,p_plot text,p_request uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_student uuid:=eddie_farm.student_id(p_token); v_plot eddie_farm.plots%rowtype; v_existing eddie_farm.operations%rowtype;
begin
  if p_request is null then raise exception 'A harvest reference is required.'; end if;
  perform eddie_farm.lock_wallet(v_student);
  select * into v_existing from eddie_farm.operations where student_id=v_student and request_id=p_request;
  if found then
    if v_existing.kind<>'harvest' or v_existing.plot_id<>p_plot then raise exception 'Harvest reference was already used.'; end if;
    return eddie_farm.snapshot(p_token);
  end if;
  select * into v_plot from eddie_farm.plots where student_id=v_student and plot_id=p_plot;
  if not found or v_plot.planted_at>now()-interval '10 seconds' then raise exception 'This crop is not ready yet.'; end if;
  delete from eddie_farm.plots where student_id=v_student and plot_id=p_plot;
  insert into eddie_farm.harvests values(v_student,v_plot.seed_id,1) on conflict(student_id,seed_id) do update set quantity=eddie_farm.harvests.quantity+1;
  insert into eddie_farm.operations(student_id,request_id,kind,seed_id,plot_id) values(v_student,p_request,'harvest',v_plot.seed_id,p_plot);
  return eddie_farm.snapshot(p_token);
end $$;

create function eddie_farm.listening_submit(p_token uuid,p_answers jsonb) returns boolean
language plpgsql security definer set search_path='' as $$
declare v_student uuid:=eddie_farm.student_id(p_token); r record; n integer;
begin
  if jsonb_typeof(p_answers)<>'object' or octet_length(p_answers::text)>16000 then raise exception 'Invalid answers.'; end if;
  perform eddie_farm.lock_wallet(v_student);
  for r in select * from jsonb_each_text(p_answers) loop
    if r.key !~ '^([1-9]|[1-3][0-9]|40)$' or length(btrim(r.value)) not between 1 and 200 then raise exception 'Invalid answer.'; end if;
    n:=r.key::integer;
    insert into eddie_farm.listening_answers values(v_student,n,btrim(r.value)) on conflict(student_id,question_number) do update set answer=excluded.answer;
    perform eddie_farm.observe(v_student,'listening','practice-one:'||n,1);
  end loop;
  return true;
end $$;

create function eddie_farm.admin_id(p_token uuid) returns uuid
language plpgsql stable security definer set search_path='' as $$
declare v_id uuid;
begin
  if (select auth.uid()) is null then raise exception 'Admin authentication required.' using errcode='42501'; end if;
  select s.admin_id into v_id from eddie_farm.admin_sessions s join eddie_farm.admin_accounts a on a.id=s.admin_id
  where s.token_hash=extensions.digest(p_token::text,'sha256') and s.expires_at>now() and a.active;
  if v_id is null then raise exception 'Admin session expired.' using errcode='42501'; end if;
  return v_id;
end $$;

create function eddie_farm.admin_login(p_name text,p_password text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_admin eddie_farm.admin_accounts%rowtype; v_name text:=lower(btrim(p_name)); v_hash text; v_attempts integer; v_token uuid:=gen_random_uuid();
begin
  if (select auth.uid()) is null then raise exception 'Authentication required.' using errcode='42501'; end if;
  if length(p_name) not between 1 and 100 or length(p_password) not between 1 and 200 then return null; end if;
  v_hash:=encode(extensions.digest(v_name,'sha256'),'hex');
  insert into eddie_farm.login_throttles(name_hash) values(v_hash) on conflict do nothing;
  update eddie_farm.login_throttles set attempts=case when window_start<now()-interval '15 minutes' then 1 else least(attempts+1,100) end,
    window_start=case when window_start<now()-interval '15 minutes' then now() else window_start end
    where name_hash=v_hash returning attempts into v_attempts;
  if v_attempts>8 then return null; end if;
  select * into v_admin from eddie_farm.admin_accounts where lower(name)=v_name and active;
  if not found then return null; end if;
  if v_admin.password_hash<>extensions.crypt(encode(extensions.digest(p_password,'sha256'),'hex'),v_admin.password_hash) then return null; end if;
  delete from eddie_farm.login_throttles where name_hash=v_hash;
  delete from eddie_farm.admin_sessions where expires_at<=now();
  insert into eddie_farm.admin_sessions values(extensions.digest(v_token::text,'sha256'),v_admin.id,now()+interval '8 hours');
  return jsonb_build_object('token',v_token,'name',v_admin.name,'role','admin');
end $$;

create function eddie_farm.admin_rules(p_token uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare v_id uuid:=eddie_farm.admin_id(p_token);
begin return jsonb_build_object('name',(select name from eddie_farm.admin_accounts where id=v_id),'rules',(select jsonb_agg(to_jsonb(r) order by r.label) from eddie_farm.rules r)); end $$;

create function eddie_farm.admin_update_rule(p_token uuid,p_system text,p_count integer,p_points integer,p_enabled boolean,p_revision integer) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_id uuid:=eddie_farm.admin_id(p_token); v_old eddie_farm.rules%rowtype; v_new eddie_farm.rules%rowtype;
begin
  if p_count is null or p_count not between 1 and 10000 or p_points is null or p_points not between 0 and 10000 or p_enabled is null then raise exception 'Enter valid whole numbers.'; end if;
  if p_system='daily-return' and p_count<>1 then raise exception 'Return bonuses are once per consecutive day.'; end if;
  select * into v_old from eddie_farm.rules where system_key=p_system for update;
  if not found or v_old.revision is distinct from p_revision then raise exception 'Settings changed. Refresh before saving.'; end if;
  update eddie_farm.rules set exercise_count=p_count,points=p_points,enabled=p_enabled,revision=revision+1,updated_at=now() where system_key=p_system returning * into v_new;
  insert into eddie_farm.rule_audit(admin_id,system_key,before_value,after_value) values(v_id,p_system,to_jsonb(v_old),to_jsonb(v_new));
  return to_jsonb(v_new);
end $$;

create function eddie_farm.admin_logout(p_token uuid) returns boolean
language plpgsql security definer set search_path='' as $$
begin delete from eddie_farm.admin_sessions where token_hash=extensions.digest(p_token::text,'sha256'); return true; end $$;

-- RLS plus no direct grants is intentional: even service clients must use the
-- narrow, identity-checked API. No reward/credit mutation is publicly callable.
do $$ declare r record;
begin
  for r in select tablename from pg_tables where schemaname='eddie_farm' loop
    execute format('alter table eddie_farm.%I enable row level security',r.tablename);
  end loop;
end $$;
revoke all on all tables in schema eddie_farm from public,anon,authenticated,service_role;
revoke all on all sequences in schema eddie_farm from public,anon,authenticated,service_role;
revoke all on all functions in schema eddie_farm from public,anon,authenticated,service_role;

-- Public functions are invokers; privileged work remains in a non-exposed
-- schema and validates the shared opaque student token on every request.
create function public.eddie_farm_visit(p_token uuid) returns boolean language sql security invoker set search_path='' as $$ select eddie_farm.visit(p_token) $$;
create function public.eddie_farm_snapshot(p_token uuid) returns jsonb language sql security invoker set search_path='' as $$ select eddie_farm.snapshot(p_token) $$;
create function public.eddie_farm_purchase(p_token uuid,p_seed text,p_request uuid) returns jsonb language sql security invoker set search_path='' as $$ select eddie_farm.purchase(p_token,p_seed,p_request) $$;
create function public.eddie_farm_plant(p_token uuid,p_seed text,p_plot text,p_request uuid) returns jsonb language sql security invoker set search_path='' as $$ select eddie_farm.plant(p_token,p_seed,p_plot,p_request) $$;
create function public.eddie_farm_harvest(p_token uuid,p_plot text,p_request uuid) returns jsonb language sql security invoker set search_path='' as $$ select eddie_farm.harvest(p_token,p_plot,p_request) $$;
create function public.eddie_farm_listening_submit(p_token uuid,p_answers jsonb) returns boolean language sql security invoker set search_path='' as $$ select eddie_farm.listening_submit(p_token,p_answers) $$;
create function public.eddie_farm_admin_login(p_name text,p_password text) returns jsonb language sql security invoker set search_path='' as $$ select eddie_farm.admin_login(p_name,p_password) $$;
create function public.eddie_farm_admin_rules(p_token uuid) returns jsonb language sql security invoker set search_path='' as $$ select eddie_farm.admin_rules(p_token) $$;
create function public.eddie_farm_admin_update_rule(p_token uuid,p_system text,p_count integer,p_points integer,p_enabled boolean,p_revision integer) returns jsonb language sql security invoker set search_path='' as $$ select eddie_farm.admin_update_rule(p_token,p_system,p_count,p_points,p_enabled,p_revision) $$;
create function public.eddie_farm_admin_logout(p_token uuid) returns boolean language sql security invoker set search_path='' as $$ select eddie_farm.admin_logout(p_token) $$;

do $$ declare r record; v_roles text;
begin
  for r in select p.oid::regprocedure signature,p.proname from pg_proc p where p.pronamespace='public'::regnamespace and p.proname like 'eddie_farm_%' loop
    execute format('revoke all on function %s from public,anon,authenticated,service_role',r.signature);
    v_roles:=case when r.proname like 'eddie_farm_admin_%' then 'authenticated' else 'anon,authenticated' end;
    execute format('grant execute on function %s to %s',r.signature,v_roles);
  end loop;
  for r in select p.oid::regprocedure signature,p.proname from pg_proc p where p.pronamespace='eddie_farm'::regnamespace and p.proname in('visit','snapshot','purchase','plant','harvest','listening_submit','admin_login','admin_rules','admin_update_rule','admin_logout') loop
    v_roles:=case when r.proname like 'admin_%' then 'authenticated' else 'anon,authenticated' end;
    execute format('grant execute on function %s to %s',r.signature,v_roles);
  end loop;
end $$;
notify pgrst,'reload schema';
commit;
