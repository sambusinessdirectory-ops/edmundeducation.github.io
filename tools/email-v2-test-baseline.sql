-- Minimal isolated PostgreSQL fixture. NOT a production migration.
create role anon; create role authenticated; create role service_role;
create schema auth; create schema extensions;
create function auth.uid() returns uuid language sql as $$select '11111111-1111-4111-8111-111111111111'::uuid$$;
create function extensions.digest(text,text) returns bytea language sql immutable as $$select sha256(convert_to($1,'UTF8'))$$;
create table public.schedule_admin_accounts(id uuid primary key default gen_random_uuid(),name text not null unique,password_hash text not null);
create table public.schedule_admin_sessions(token_hash bytea primary key,admin_id uuid references public.schedule_admin_accounts(id),created_at timestamptz default now(),expires_at timestamptz not null);
create table public.schedule_worker_secrets(name text primary key,secret_hash bytea not null);
create function public._schedule_worker_ok(p_service_secret text) returns boolean language sql stable security definer set search_path='' as $$select coalesce(length(p_service_secret),0)>=32 and exists(select 1 from public.schedule_worker_secrets s where s.secret_hash=extensions.digest(p_service_secret,'sha256'))$$;
create function public._schedule_admin_id(p_admin_token uuid) returns uuid language sql stable security definer set search_path='' as $$select admin_id from public.schedule_admin_sessions where token_hash=extensions.digest(p_admin_token::text,'sha256') and expires_at>now() limit 1$$;
create table public.flashcard_students(id uuid primary key default gen_random_uuid(),name text,deleted_at timestamptz);
create table public.schedule_student_reminder_emails(student_id uuid primary key references public.flashcard_students(id),email text);
create table public.schedule_email_templates(admin_id uuid references public.schedule_admin_accounts(id),slot smallint,content text not null default '',enabled boolean not null default false,cadence text not null default '24h',daily_time time,updated_at timestamptz default now(),primary key(admin_id,slot));
create table public.schedule_email_template_recipients(admin_id uuid,slot smallint,student_id uuid references public.flashcard_students(id),enabled boolean not null default true,primary key(admin_id,slot,student_id),foreign key(admin_id,slot) references public.schedule_email_templates(admin_id,slot) on delete cascade);
create table public.schedule_email_logs(id uuid primary key default gen_random_uuid(),admin_id uuid not null references public.schedule_admin_accounts(id),template_slot smallint not null,student_id uuid references public.flashcard_students(id),recipient_email text not null,subject text not null,rendered_content text not null,status text not null check(status in ('queued','accepted','failed','cancelled')),provider_message_id text,created_at timestamptz default now());
create table public.daily_newsletter_posts(id text primary key,published boolean default false,title text);
create table public.music_journal_posts(id text primary key,published boolean default false,payload jsonb,sort_index bigint);
