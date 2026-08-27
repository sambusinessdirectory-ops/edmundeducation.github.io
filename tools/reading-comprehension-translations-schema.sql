-- Additive translation storage. Does not alter English text, keys or student data.
create table public.reading_comprehension_translations (
  article_id text primary key references public.reading_comprehension_catalogue(id),
  locale text not null default 'zh-Hant' check (locale = 'zh-Hant'),
  source_sha256 text not null check (source_sha256 ~ '^[0-9a-f]{64}$'),
  content jsonb not null check (
    jsonb_typeof(content) = 'object'
    and jsonb_typeof(content->'paragraphs') = 'array'
    and jsonb_array_length(content->'paragraphs') > 0
  ),
  published boolean not null default false,
  translated_at timestamptz not null default now()
);
alter table public.reading_comprehension_translations enable row level security;
revoke all on public.reading_comprehension_translations from public, anon, authenticated;
comment on table public.reading_comprehension_translations is
  'Complete, paragraph-aligned Traditional Chinese passage translations. Student clients have read-only access through the session-checked RPC; no marking keys or student records are stored here.';

-- Keep the privileged implementation outside exposed schemas. The public
-- wrapper is invoker-only; both functions deliberately grant EXECUTE narrowly.
create schema if not exists reading_content_private;
revoke all on schema reading_content_private from public, anon;
grant usage on schema reading_content_private to authenticated;
create function reading_content_private.article_translation(p_token uuid, p_article_id text)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare v_content jsonb;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if public.flashcard_session_student_id(p_token) is null then
    raise exception 'Invalid or expired student session' using errcode = '42501';
  end if;
  select t.content into v_content
    from public.reading_comprehension_translations t
    join public.reading_comprehension_catalogue c on c.id = t.article_id and c.enabled
    where t.article_id = p_article_id and t.published and t.locale = 'zh-Hant';
  return v_content;
end;
$$;
revoke all on function reading_content_private.article_translation(uuid,text) from public, anon, authenticated;
grant execute on function reading_content_private.article_translation(uuid,text) to authenticated;
create function public.reading_comprehension_article_translation(p_token uuid, p_article_id text)
returns jsonb language sql stable security invoker set search_path = '' as $$
  select reading_content_private.article_translation(p_token, p_article_id);
$$;
revoke all on function public.reading_comprehension_article_translation(uuid,text) from public, anon, authenticated;
grant execute on function public.reading_comprehension_article_translation(uuid,text) to authenticated;
