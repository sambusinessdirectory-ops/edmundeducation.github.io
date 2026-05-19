create table if not exists public.daily_newsletter_posts (
  id text primary key,
  created_at timestamptz not null default now(),
  title text not null,
  subheading text not null,
  tag text,
  image text not null,
  image_english text not null,
  extension text not null,
  sentences text not null,
  summary text not null,
  published boolean not null default true
);

create index if not exists daily_newsletter_posts_published_created_idx
on public.daily_newsletter_posts(published, created_at desc);

alter table public.daily_newsletter_posts enable row level security;

drop policy if exists "Daily newsletter posts are public" on public.daily_newsletter_posts;
drop policy if exists "Daily newsletter posts can be created from site" on public.daily_newsletter_posts;
drop policy if exists "Daily newsletter posts can be updated from site" on public.daily_newsletter_posts;
drop policy if exists "Daily newsletter posts can be deleted from site" on public.daily_newsletter_posts;

create policy "Daily newsletter posts are public"
on public.daily_newsletter_posts
for select
to anon
using (published = true);

create policy "Daily newsletter posts can be created from site"
on public.daily_newsletter_posts
for insert
to anon
with check (true);

create policy "Daily newsletter posts can be updated from site"
on public.daily_newsletter_posts
for update
to anon
using (true)
with check (true);

create policy "Daily newsletter posts can be deleted from site"
on public.daily_newsletter_posts
for delete
to anon
using (true);
