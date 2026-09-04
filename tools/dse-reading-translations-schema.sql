-- DSE translations are separate from IELTS content and contain no marking keys.
create table public.dse_reading_translations (
  article_id text primary key check (article_id ~ '^dse-(201[2-9]|202[0-3]|202[56])-(a|b1|b2)$'),
  locale text not null default 'zh-Hant' check (locale = 'zh-Hant'),
  source_sha256 text not null check (source_sha256 ~ '^[0-9a-f]{64}$'),
  content jsonb not null check (
    jsonb_typeof(content) = 'object'
    and content->>'articleId' = article_id
    and content->>'locale' = 'zh-Hant'
    and content->>'schemaVersion' = '1'
    and jsonb_typeof(content->'entries') = 'array'
    and jsonb_array_length(content->'entries') > 0
  ),
  published boolean not null default false,
  translated_at timestamptz not null default now()
);
alter table public.dse_reading_translations enable row level security;
revoke all on public.dse_reading_translations from public, anon, authenticated;
comment on table public.dse_reading_translations is
  'Source-aligned Traditional Chinese DSE passages and questions; read-only through the existing authenticated student session boundary.';

create function reading_content_private.dse_article_translation(p_token uuid, p_article_id text)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare v_content jsonb;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if public.flashcard_session_student_id(p_token) is null then
    raise exception 'Invalid or expired student session' using errcode = '42501';
  end if;
  select t.content into v_content from public.dse_reading_translations t
    where t.article_id = p_article_id and t.published and t.locale = 'zh-Hant';
  return v_content;
end;
$$;
revoke all on function reading_content_private.dse_article_translation(uuid,text) from public, anon, authenticated;
grant execute on function reading_content_private.dse_article_translation(uuid,text) to authenticated;

create function public.dse_reading_article_translation(p_token uuid, p_article_id text)
returns jsonb language sql stable security invoker set search_path = '' as $$
  select reading_content_private.dse_article_translation(p_token, p_article_id);
$$;
revoke all on function public.dse_reading_article_translation(uuid,text) from public, anon, authenticated;
grant execute on function public.dse_reading_article_translation(uuid,text) to authenticated;
