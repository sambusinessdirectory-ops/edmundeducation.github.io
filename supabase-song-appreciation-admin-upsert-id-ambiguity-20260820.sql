-- Repair the Song Appreciation admin save RPC's ambiguous conflict target.
-- The RETURNS TABLE output column `id` is also a PL/pgSQL variable, so
-- `ON CONFLICT (id)` fails at runtime. Naming the primary-key constraint
-- leaves no identifier for PL/pgSQL to resolve.

begin;

create or replace function public.song_appreciation_admin_upsert_song(
  p_admin_token uuid,
  p_id uuid,
  p_slug text,
  p_title text,
  p_singer text,
  p_exercise_name text,
  p_description text,
  p_youtube_url text,
  p_tags text[],
  p_translations jsonb,
  p_exercises jsonb,
  p_published boolean,
  p_sort_order integer
)
returns table (
  id uuid,
  slug text,
  title text,
  singer text,
  exercise_name text,
  description text,
  youtube_url text,
  tags text[],
  translations jsonb,
  exercises jsonb,
  published boolean,
  sort_order integer,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid := public._song_appreciation_admin_id(p_admin_token);
  v_id uuid := p_id;
  v_slug text := pg_catalog.lower(pg_catalog.btrim(coalesce(p_slug, '')));
  v_title text := pg_catalog.btrim(coalesce(p_title, ''));
  v_singer text := pg_catalog.btrim(coalesce(p_singer, ''));
  v_exercise_name text := pg_catalog.btrim(coalesce(p_exercise_name, ''));
  v_description text := coalesce(p_description, '');
  v_youtube_url text := nullif(pg_catalog.btrim(coalesce(p_youtube_url, '')), '');
  v_tags text[];
  v_translations jsonb := coalesce(p_translations, '[]'::jsonb);
  v_exercises jsonb := coalesce(p_exercises, '[]'::jsonb);
begin
  if v_admin_id is null then
    raise exception 'Unauthorized' using errcode = '42501';
  end if;

  select coalesce(
    pg_catalog.array_agg(normalized.tag order by normalized.tag),
    '{}'::text[]
  )
  into v_tags
  from (
    select distinct pg_catalog.lower(pg_catalog.btrim(input_tag.tag)) as tag
    from pg_catalog.unnest(coalesce(p_tags, '{}'::text[])) as input_tag(tag)
  ) normalized
  where normalized.tag <> '';

  if pg_catalog.char_length(v_slug) not between 1 and 160
    or v_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    or pg_catalog.char_length(v_title) not between 1 and 240
    or v_title ~ '[[:cntrl:]]'
    or pg_catalog.char_length(v_singer) not between 1 and 160
    or v_singer ~ '[[:cntrl:]]'
    or pg_catalog.char_length(v_exercise_name) not between 1 and 240
    or v_exercise_name ~ '[[:cntrl:]]'
    or pg_catalog.char_length(v_description) not between 1 and 12000
    or not public._song_appreciation_youtube_url_valid(v_youtube_url)
    or not public._song_appreciation_tags_valid(v_tags)
    or pg_catalog.jsonb_typeof(v_translations) <> 'array'
    or pg_catalog.octet_length(v_translations::text) > 2097152
    or not public._song_appreciation_translations_valid(v_translations)
    or pg_catalog.jsonb_typeof(v_exercises) <> 'array'
    or pg_catalog.octet_length(v_exercises::text) > 2097152
    or (
      v_exercises <> '[]'::jsonb
      and not public._song_appreciation_exercises_valid(v_exercises)
    )
    or p_published is null
    or (p_published and not public._song_appreciation_exercises_valid(v_exercises))
    or p_sort_order is null
    or p_sort_order not between -1000000 and 1000000
  then
    raise exception 'Invalid song payload' using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('song-appreciation-song:' || v_slug, 0)
  );

  if v_id is null then
    select song.id
    into v_id
    from public.song_appreciation_songs song
    where song.slug = v_slug
    limit 1
    for update;
    v_id := coalesce(v_id, pg_catalog.gen_random_uuid());
  end if;

  insert into public.song_appreciation_songs as song (
    id,
    slug,
    title,
    singer,
    exercise_name,
    description,
    youtube_url,
    tags,
    translations,
    exercises,
    published,
    sort_order
  ) values (
    v_id,
    v_slug,
    v_title,
    v_singer,
    v_exercise_name,
    v_description,
    v_youtube_url,
    v_tags,
    v_translations,
    v_exercises,
    p_published,
    p_sort_order
  )
  on conflict on constraint song_appreciation_songs_pkey do update
  set slug = excluded.slug,
      title = excluded.title,
      singer = excluded.singer,
      exercise_name = excluded.exercise_name,
      description = excluded.description,
      youtube_url = excluded.youtube_url,
      tags = excluded.tags,
      translations = excluded.translations,
      exercises = excluded.exercises,
      published = excluded.published,
      sort_order = excluded.sort_order;

  return query
  select
    song.id,
    song.slug,
    song.title,
    song.singer,
    song.exercise_name,
    song.description,
    song.youtube_url,
    song.tags,
    song.translations,
    song.exercises,
    song.published,
    song.sort_order,
    song.created_at,
    song.updated_at
  from public.song_appreciation_songs song
  where song.id = v_id;
end;
$$;

notify pgrst, 'reload schema';

commit;

