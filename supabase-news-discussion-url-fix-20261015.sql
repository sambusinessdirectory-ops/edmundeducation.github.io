-- Replace the unsupported {1,1900} POSIX repetition count with a length check.
begin;

alter table public.news_discussion_articles
  drop constraint news_discussion_source_url;

alter table public.news_discussion_articles
  add constraint news_discussion_source_url check (
    source_url is null or (
      char_length(source_url) <= 1900
      and source_url ~ '^https://[^[:space:]]+$'
    )
  );

commit;
