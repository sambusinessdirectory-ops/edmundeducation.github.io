-- Isolated accounts, content and progress for the neutral flashcard portal.
create table public.special_flash_accounts(id uuid primary key default gen_random_uuid(), username text not null check(char_length(username) between 1 and 100),role text not null check(role in ('student','admin')),password_hash text,active boolean not null default true,created_at timestamptz not null default now(),check((role='student' and password_hash is null) or (role='admin' and password_hash is not null)));
create unique index special_flash_accounts_username_idx on public.special_flash_accounts(lower(username));
create table public.special_flash_sessions(token_hash bytea primary key,account_id uuid not null references public.special_flash_accounts(id) on delete cascade,expires_at timestamptz not null default now()+interval '30 days');
create index special_flash_sessions_account_idx on public.special_flash_sessions(account_id);
create table public.special_flash_login_limits(username text primary key,failures int not null default 0,window_start timestamptz not null default now());
create table public.special_flash_courses(id uuid primary key default gen_random_uuid(),title text not null check(char_length(title) between 1 and 200),description text not null default '' check(char_length(description)<=2000),active boolean not null default true,created_at timestamptz not null default now());
create table public.special_flash_decks(id uuid primary key default gen_random_uuid(),course_id uuid not null references public.special_flash_courses(id) on delete cascade,title text not null check(char_length(title) between 1 and 200),cards jsonb not null default '[]' check(jsonb_typeof(cards)='array'),version int not null default 1,active boolean not null default true,created_at timestamptz not null default now());
create index special_flash_decks_course_idx on public.special_flash_decks(course_id);
create table public.special_flash_enrollments(account_id uuid not null references public.special_flash_accounts(id) on delete cascade,course_id uuid not null references public.special_flash_courses(id) on delete cascade,all_decks boolean not null default false,primary key(account_id,course_id));
create index special_flash_enrollments_course_idx on public.special_flash_enrollments(course_id);
create table public.special_flash_deck_access(account_id uuid not null references public.special_flash_accounts(id) on delete cascade,deck_id uuid not null references public.special_flash_decks(id) on delete cascade,primary key(account_id,deck_id));
create index special_flash_deck_access_deck_idx on public.special_flash_deck_access(deck_id);
create table public.special_flash_progress(account_id uuid not null references public.special_flash_accounts(id) on delete cascade,deck_id uuid not null references public.special_flash_decks(id) on delete cascade,version int not null,marks jsonb not null default '{}',study jsonb,revision bigint not null default 0,mutation_id uuid,mutation_payload jsonb,updated_at timestamptz not null default now(),primary key(account_id,deck_id));
create index special_flash_progress_deck_idx on public.special_flash_progress(deck_id);
DO $$declare t text;begin foreach t in array array['accounts','sessions','login_limits','courses','decks','enrollments','deck_access','progress'] loop execute format('alter table public.special_flash_%I enable row level security',t);execute format('revoke all on public.special_flash_%I from public,anon,authenticated,service_role',t);end loop;end$$;

create function public._special_flash_account(p_token uuid) returns public.special_flash_accounts language sql stable security definer set search_path='' as $$select a.* from public.special_flash_accounts a join public.special_flash_sessions s on s.account_id=a.id where s.token_hash=extensions.digest(p_token::text,'sha256') and s.expires_at>now() and a.active$$;
create function public._special_flash_access(p_account uuid,p_deck uuid) returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.special_flash_accounts a,public.special_flash_decks d join public.special_flash_courses c on c.id=d.course_id where a.id=p_account and a.active and d.id=p_deck and (a.role='admin' or (d.active and c.active and (exists(select 1 from public.special_flash_enrollments e where e.account_id=a.id and e.course_id=c.id and e.all_decks) or exists(select 1 from public.special_flash_deck_access g where g.account_id=a.id and g.deck_id=d.id)))))$$;
revoke all on function public._special_flash_account(uuid),public._special_flash_access(uuid,uuid) from public,anon,authenticated,service_role;

create function public.special_flash_login(p_username text,p_password text default '') returns jsonb language plpgsql security definer set search_path='' as $$
declare a public.special_flash_accounts;lim public.special_flash_login_limits;tok uuid;
begin
 if p_username is null or char_length(p_username) not between 1 and 100 or char_length(coalesce(p_password,''))>500 then return jsonb_build_object('error','Check your username and try again.');end if;
 if p_username='Sam White Label Admin' then
  perform pg_advisory_xact_lock(hashtextextended('special-flash-admin-login',0));
  insert into public.special_flash_login_limits(username) values(p_username) on conflict do nothing;
  select * into lim from public.special_flash_login_limits where username=p_username for update;
  if lim.window_start<now()-interval '15 minutes' then update public.special_flash_login_limits set failures=0,window_start=now() where username=p_username;lim.failures:=0;end if;
  if lim.failures>=8 then return jsonb_build_object('error','Too many attempts. Please try again in 15 minutes.');end if;
  select * into a from public.special_flash_accounts where username=p_username and role='admin' and active;
  if a.id is null or a.password_hash<>extensions.crypt(coalesce(p_password,''),a.password_hash) then update public.special_flash_login_limits set failures=failures+1 where username=p_username;return jsonb_build_object('error','Check your username and password.');end if;
  update public.special_flash_login_limits set failures=0 where username=p_username;
 else select * into a from public.special_flash_accounts where lower(username)=lower(btrim(p_username)) and role='student' and active;
 end if;
 if a.id is null then return jsonb_build_object('error','Username not found. Please ask your tutor.');end if;
 delete from public.special_flash_sessions where account_id=a.id and expires_at<now();
 tok:=gen_random_uuid();insert into public.special_flash_sessions(token_hash,account_id) values(extensions.digest(tok::text,'sha256'),a.id);
 return jsonb_build_object('token',tok,'user',jsonb_build_object('id',a.id,'username',a.username,'role',a.role));
end$$;
create function public.special_flash_logout(p_token uuid) returns boolean language plpgsql security definer set search_path='' as $$begin delete from public.special_flash_sessions where token_hash=extensions.digest(p_token::text,'sha256');return true;end$$;

create function public.special_flash_library(p_token uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare a public.special_flash_accounts:=public._special_flash_account(p_token);items jsonb;
begin if a.id is null then raise exception 'Please sign in again.' using errcode='42501';end if;
 select coalesce(jsonb_agg(jsonb_build_object('id',d.id,'title',d.title,'course_id',c.id,'course_title',c.title,'description',c.description,'count',jsonb_array_length(d.cards),'version',d.version,'active',d.active,'known',(select count(*) from jsonb_each_text(coalesce(p.marks,'{}')) x where x.value='green' and exists(select 1 from jsonb_array_elements(d.cards) card where card->>'id'=x.key)),'review',(select count(*) from jsonb_each_text(coalesce(p.marks,'{}')) x where x.value='red' and exists(select 1 from jsonb_array_elements(d.cards) card where card->>'id'=x.key))) order by c.created_at,d.created_at),'[]') into items from public.special_flash_decks d join public.special_flash_courses c on c.id=d.course_id left join public.special_flash_progress p on p.account_id=a.id and p.deck_id=d.id where public._special_flash_access(a.id,d.id);
 return jsonb_build_object('user',jsonb_build_object('id',a.id,'username',a.username,'role',a.role),'decks',items);
end$$;
create function public.special_flash_deck(p_token uuid,p_deck uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare a public.special_flash_accounts:=public._special_flash_account(p_token);d public.special_flash_decks;p public.special_flash_progress;
begin if a.id is null or not public._special_flash_access(a.id,p_deck) then raise exception 'This deck is not available to your account.' using errcode='42501';end if;
 select * into d from public.special_flash_decks where id=p_deck;select * into p from public.special_flash_progress where account_id=a.id and deck_id=p_deck;
 return jsonb_build_object('deck',to_jsonb(d),'progress',jsonb_build_object('revision',coalesce(p.revision,0),'version',p.version,'marks',coalesce((select jsonb_object_agg(x.key,x.value) from jsonb_each(coalesce(p.marks,'{}')) x where exists(select 1 from jsonb_array_elements(d.cards) c where c->>'id'=x.key)),'{}'),'study',case when p.version=d.version then p.study else null end));
end$$;

create function public.special_flash_admin(p_token uuid,p_action text,p_data jsonb default '{}') returns jsonb language plpgsql security definer set search_path='' as $$
declare a public.special_flash_accounts:=public._special_flash_account(p_token);target uuid;cid uuid;v int;card jsonb;seen text[]:=array[]::text[];name text;
begin
 if a.id is null or a.role<>'admin' then raise exception 'Administrator access required.' using errcode='42501';end if;
 if jsonb_typeof(p_data)<>'object' or octet_length(p_data::text)>15000000 then raise exception 'Invalid request.' using errcode='22023';end if;
 if p_action='dashboard' then return jsonb_build_object('accounts',(select coalesce(jsonb_agg(jsonb_build_object('id',id,'username',username,'active',active) order by lower(username)),'[]') from public.special_flash_accounts where role='student'),'courses',(select coalesce(jsonb_agg(to_jsonb(c) order by created_at),'[]') from public.special_flash_courses c),'decks',(select coalesce(jsonb_agg(jsonb_build_object('id',id,'title',title,'course_id',course_id,'count',jsonb_array_length(cards),'active',active,'version',version) order by created_at),'[]') from public.special_flash_decks),'enrollments',(select coalesce(jsonb_agg(to_jsonb(e)),'[]') from public.special_flash_enrollments e),'access',(select coalesce(jsonb_agg(to_jsonb(g)),'[]') from public.special_flash_deck_access g));end if;
 target:=coalesce(nullif(p_data->>'id','')::uuid,gen_random_uuid());name:=btrim(coalesce(p_data->>'name',p_data->>'title',''));
 if p_action='account_save' then
  if char_length(name) not between 1 and 100 or lower(name)='sam white label admin' or name~'[[:cntrl:]]' then raise exception 'Choose a different username (1–100 characters).' using errcode='22023';end if;
  if exists(select 1 from public.special_flash_accounts where id=target and role='admin') then raise exception 'Cannot change the admin account.' using errcode='42501';end if;
  insert into public.special_flash_accounts(id,username,role,active) values(target,name,'student',coalesce((p_data->>'active')::bool,true)) on conflict(id) do update set username=excluded.username,active=excluded.active;
  if (p_data->>'active')::bool=false then delete from public.special_flash_sessions where account_id=target;end if;
 elsif p_action='course_save' then
  if char_length(name) not between 1 and 200 then raise exception 'Enter a course name.' using errcode='22023';end if;
  insert into public.special_flash_courses(id,title,description,active) values(target,name,coalesce(p_data->>'description',''),coalesce((p_data->>'active')::bool,true)) on conflict(id) do update set title=excluded.title,description=excluded.description,active=excluded.active;
 elsif p_action='deck_save' then
  cid:=(p_data->>'course_id')::uuid;
  if char_length(name) not between 1 and 200 or cid is null or not exists(select 1 from public.special_flash_courses where id=cid) or p_data->'cards' is null or jsonb_typeof(p_data->'cards')<>'array' or jsonb_array_length(p_data->'cards')>5000 then raise exception 'Enter a title, course and up to 5,000 cards.' using errcode='22023';end if;
  for card in select value from jsonb_array_elements(p_data->'cards') loop
   if jsonb_typeof(card)<>'object' or coalesce(card->>'id','') !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' or card->>'id'=any(seen) or jsonb_typeof(card->'front') is distinct from 'string' or char_length(btrim(card->>'front')) not between 1 and 5000 or jsonb_typeof(card->'back') is distinct from 'string' or char_length(btrim(card->>'back')) not between 1 and 10000 or char_length(coalesce(card->>'note',''))>2000 then raise exception 'Each card needs a unique ID, front and back.' using errcode='22023';end if;
   seen:=array_append(seen,card->>'id');
  end loop;
  perform pg_advisory_xact_lock(hashtextextended('special-deck:'||target,0));
  select version into v from public.special_flash_decks where id=target for update;
  if v is not null and v is distinct from (p_data->>'version')::int then raise exception 'The deck changed. Reopen it before saving.' using errcode='40001';end if;
  if exists(select 1 from public.special_flash_decks where id=target and course_id<>cid) then raise exception 'A deck cannot be moved to another course.' using errcode='22023';end if;
  insert into public.special_flash_decks(id,course_id,title,cards,active) values(target,cid,name,p_data->'cards',coalesce((p_data->>'active')::bool,true)) on conflict(id) do update set title=excluded.title,cards=excluded.cards,active=excluded.active,version=special_flash_decks.version+1;
 elsif p_action='access_save' then
  target:=(p_data->>'account_id')::uuid;cid:=(p_data->>'course_id')::uuid;
  if not exists(select 1 from public.special_flash_accounts where id=target and role='student') or not exists(select 1 from public.special_flash_courses where id=cid) or jsonb_typeof(p_data->'deck_ids') is distinct from 'array' then raise exception 'Choose a student and course.' using errcode='22023';end if;
  if exists(select 1 from jsonb_array_elements_text(p_data->'deck_ids') x where not exists(select 1 from public.special_flash_decks d where d.id::text=x and d.course_id=cid)) then raise exception 'Selected deck does not belong to this course.' using errcode='22023';end if;
  perform pg_advisory_xact_lock(hashtextextended('special-access:'||target||cid,0));
  insert into public.special_flash_enrollments(account_id,course_id,all_decks) values(target,cid,coalesce((p_data->>'all_decks')::bool,false)) on conflict(account_id,course_id) do update set all_decks=excluded.all_decks;
  delete from public.special_flash_deck_access g using public.special_flash_decks d where g.account_id=target and g.deck_id=d.id and d.course_id=cid;
  insert into public.special_flash_deck_access(account_id,deck_id) select distinct target,value::uuid from jsonb_array_elements_text(p_data->'deck_ids');
 else raise exception 'Unknown action.' using errcode='22023';end if;
 return jsonb_build_object('saved',true,'id',target);
end$$;

create function public.special_flash_save(p_token uuid,p_deck uuid,p_version int,p_marks jsonb,p_study jsonb,p_revision bigint,p_mutation uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare a public.special_flash_accounts:=public._special_flash_account(p_token);d public.special_flash_decks;p public.special_flash_progress;payload jsonb;k text;val text;ids text[];
begin
 if a.id is null or not public._special_flash_access(a.id,p_deck) then raise exception 'This deck is not available to your account.' using errcode='42501';end if;
 select * into d from public.special_flash_decks where id=p_deck;
 if p_version is distinct from d.version or p_mutation is null or p_revision is null or p_revision<0 or p_marks is null or jsonb_typeof(p_marks)<>'object' or octet_length(p_marks::text)>500000 then raise exception 'Reopen this deck before continuing.' using errcode='22023';end if;
 select array_agg(c->>'id') into ids from jsonb_array_elements(d.cards) c;
 for k,val in select key,value from jsonb_each_text(p_marks) loop if not coalesce(k=any(ids),false) or val is null or val not in ('green','red') then raise exception 'Invalid card mark.' using errcode='22023';end if;end loop;
 if p_study is not null and p_study<>'null'::jsonb then
  if jsonb_typeof(p_study)<>'object' or octet_length(p_study::text)>500000 or jsonb_typeof(p_study->'queue') is distinct from 'array' or jsonb_array_length(p_study->'queue')>5000 or coalesce((p_study->>'position')::int,-1) not between 0 and jsonb_array_length(p_study->'queue') then raise exception 'Invalid study session.' using errcode='22023';end if;
  if exists(select 1 from jsonb_array_elements_text(p_study->'queue') x where not coalesce(x=any(ids),false)) then raise exception 'Invalid study card.' using errcode='22023';end if;
 end if;
 perform pg_advisory_xact_lock(hashtextextended('special-progress:'||a.id||p_deck,0));
 payload:=jsonb_build_object('version',p_version,'marks',p_marks,'study',p_study);
 select * into p from public.special_flash_progress where account_id=a.id and deck_id=p_deck for update;
 if p.mutation_id=p_mutation then if p.mutation_payload is distinct from payload then raise exception 'Save request changed.' using errcode='23505';end if;return jsonb_build_object('saved',true,'revision',p.revision,'mutation_id',p_mutation);end if;
 if coalesce(p.revision,0)<>p_revision then raise exception 'Progress changed on another device. Reopen this deck to load it.' using errcode='40001';end if;
 insert into public.special_flash_progress(account_id,deck_id,version,marks,study,revision,mutation_id,mutation_payload) values(a.id,p_deck,p_version,p_marks,p_study,coalesce(p.revision,0)+1,p_mutation,payload) on conflict(account_id,deck_id) do update set version=excluded.version,marks=excluded.marks,study=excluded.study,revision=excluded.revision,mutation_id=excluded.mutation_id,mutation_payload=excluded.mutation_payload,updated_at=now() returning * into p;
 return jsonb_build_object('saved',true,'revision',p.revision,'mutation_id',p_mutation);
end$$;
revoke all on function public.special_flash_login(text,text),public.special_flash_logout(uuid),public.special_flash_library(uuid),public.special_flash_deck(uuid,uuid),public.special_flash_admin(uuid,text,jsonb),public.special_flash_save(uuid,uuid,int,jsonb,jsonb,bigint,uuid) from public,anon,authenticated,service_role;
grant execute on function public.special_flash_login(text,text),public.special_flash_logout(uuid),public.special_flash_library(uuid),public.special_flash_deck(uuid,uuid),public.special_flash_admin(uuid,text,jsonb),public.special_flash_save(uuid,uuid,int,jsonb,jsonb,bigint,uuid) to anon,authenticated;
