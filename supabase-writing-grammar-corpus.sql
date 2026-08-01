-- Edmund Education teacher-approved grammar corpus.
--
-- Apply after supabase-writing-submission.sql. The browser receives no table
-- privileges. Corpus authoring remains an owner-only, reviewed deployment
-- operation. Runtime matching uses the generated Worker snapshot; the only
-- service-role corpus RPC exposes release status/counts, not corpus rows.

begin;

do $$
begin
  if to_regprocedure('public._writing_submission_admin_id(uuid)') is null then
    raise exception 'Missing dependency: supabase-writing-submission.sql';
  end if;
end;
$$;

create or replace function public._writing_grammar_normalize_sentence(p_value text)
returns text
language sql
immutable
set search_path = ''
as $$
  select lower(
    regexp_replace(
      btrim(replace(coalesce(p_value, ''), chr(160), ' ')),
      E'\\s+',
      ' ',
      'g'
    )
  );
$$;

create table if not exists public.writing_grammar_corpus_releases (
  corpus_version text primary key,
  schema_version integer not null,
  status text not null,
  is_current boolean not null default false,
  title text not null,
  notes text not null default '',
  content_sha256 text not null,
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  check (corpus_version = btrim(corpus_version)),
  check (char_length(corpus_version) between 1 and 80),
  check (schema_version between 1 and 1000),
  check (status in ('draft', 'reviewed', 'approved', 'retired')),
  check (char_length(title) between 1 and 200),
  check (char_length(notes) <= 4000),
  check (content_sha256 ~ '^[0-9a-f]{64}$'),
  check ((status = 'approved' and approved_at is not null) or status <> 'approved'),
  check (not is_current or status = 'approved')
);

create unique index if not exists writing_grammar_one_current_release_idx
  on public.writing_grammar_corpus_releases (is_current)
  where is_current;

create table if not exists public.writing_grammar_corpus_groups (
  corpus_version text not null
    references public.writing_grammar_corpus_releases(corpus_version) on delete cascade,
  group_key text not null,
  partition text not null,
  description text not null default '',
  primary key (corpus_version, group_key),
  check (group_key = btrim(group_key) and char_length(group_key) between 1 and 120),
  check (partition in ('retrieval', 'development', 'holdout', 'regression')),
  check (char_length(description) <= 1000)
);

create table if not exists public.writing_grammar_rules (
  corpus_version text not null
    references public.writing_grammar_corpus_releases(corpus_version) on delete cascade,
  rule_id text not null,
  title_zh_hant text not null,
  grammar_category text not null,
  formula text not null default '',
  structural_signature jsonb not null default '[]'::jsonb,
  incorrect_pattern text not null default '',
  correct_pattern text not null default '',
  explanation_zh_hant text not null,
  correct_examples jsonb not null default '[]'::jsonb,
  incorrect_examples jsonb not null default '[]'::jsonb,
  alternative_corrections jsonb not null default '[]'::jsonb,
  english_variant text not null default 'both',
  status text not null,
  author text not null,
  version integer not null,
  primary key (corpus_version, rule_id),
  check (rule_id = btrim(rule_id) and rule_id ~ '^[A-Z][A-Z0-9_]{1,119}$'),
  check (char_length(title_zh_hant) between 1 and 200),
  check (grammar_category in (
    'subject_verb_agreement', 'article_or_determiner', 'singular_plural',
    'countability', 'verb_form_or_tense', 'modal_or_auxiliary',
    'infinitive_or_gerund', 'preposition', 'pronoun', 'sentence_structure',
    'conjunction', 'parallelism', 'comparison', 'possessive', 'punctuation',
    'spelling_or_spacing', 'word_form', 'word_choice', 'other_grammar'
  )),
  check (jsonb_typeof(structural_signature) = 'array'),
  check (jsonb_typeof(correct_examples) = 'array'),
  check (jsonb_typeof(incorrect_examples) = 'array'),
  check (jsonb_typeof(alternative_corrections) = 'array'),
  check (char_length(explanation_zh_hant) between 1 and 2000),
  check (english_variant in ('British English', 'American English', 'both')),
  check (status in ('draft', 'reviewed', 'approved', 'retired')),
  check (char_length(author) between 1 and 120),
  check (version between 1 and 1000000)
);

create table if not exists public.writing_grammar_paragraphs (
  corpus_version text not null
    references public.writing_grammar_corpus_releases(corpus_version) on delete cascade,
  paragraph_id text not null,
  group_key text not null,
  title text not null,
  topic_category text not null,
  student_level text not null,
  incorrect_paragraph text not null,
  corrected_paragraph text not null,
  original_word_count integer not null,
  corrected_word_count integer not null,
  sentence_count integer not null,
  issue_count integer not null,
  english_variant text not null,
  author text not null,
  status text not null,
  version integer not null,
  retrieval_eligible boolean not null,
  evaluation_holdout boolean not null,
  notes text not null default '',
  primary key (corpus_version, paragraph_id),
  foreign key (corpus_version, group_key)
    references public.writing_grammar_corpus_groups(corpus_version, group_key)
    on delete no action deferrable initially deferred,
  check (paragraph_id ~ '^PARA-[0-9]{4,}$'),
  check (char_length(title) between 1 and 200),
  check (char_length(topic_category) between 1 and 200),
  check (char_length(student_level) between 1 and 80),
  check (char_length(incorrect_paragraph) between 1 and 20000),
  check (char_length(corrected_paragraph) between 1 and 20000),
  check (original_word_count between 1 and 5000),
  check (corrected_word_count between 1 and 5000),
  check (sentence_count between 1 and 500),
  check (issue_count between 0 and 5000),
  check (english_variant in ('British English', 'American English', 'both')),
  check (char_length(author) between 1 and 120),
  check (status in ('draft', 'reviewed', 'approved', 'retired')),
  check (version between 1 and 1000000),
  check (not evaluation_holdout or not retrieval_eligible),
  check (char_length(notes) <= 4000)
);

create table if not exists public.writing_grammar_sentences (
  corpus_version text not null,
  sentence_id text not null,
  paragraph_id text not null,
  sentence_order integer not null,
  incorrect_sentence text not null,
  corrected_sentence text not null,
  review_policy text not null default 'exact',
  status text not null,
  primary key (corpus_version, sentence_id),
  foreign key (corpus_version, paragraph_id)
    references public.writing_grammar_paragraphs(corpus_version, paragraph_id)
    on delete cascade,
  check (sentence_id ~ '^PARA-[0-9]{4,}-S[0-9]{2,}$'),
  check (sentence_order between 1 and 500),
  check (char_length(incorrect_sentence) between 1 and 10000),
  check (char_length(corrected_sentence) between 1 and 10000),
  check (review_policy in ('exact', 'guidance', 'abstain')),
  check (status in ('draft', 'reviewed', 'approved', 'retired')),
  unique (corpus_version, paragraph_id, sentence_order)
);

create unique index if not exists writing_grammar_sentence_exact_lookup_idx
  on public.writing_grammar_sentences (
    corpus_version,
    public._writing_grammar_normalize_sentence(incorrect_sentence)
  )
  where status = 'approved' and review_policy = 'exact';

create table if not exists public.writing_grammar_issues (
  corpus_version text not null,
  issue_id text not null,
  source_issue_id text not null,
  sentence_id text not null,
  issue_order integer not null,
  wrong_text text not null,
  replacement_text text not null,
  occurrence_index integer not null default 1,
  rule_id text not null,
  explanation_zh_hant text not null,
  acceptable_alternatives jsonb not null default '[]'::jsonb,
  confidence numeric(4,3) not null default 1,
  status text not null,
  primary key (corpus_version, issue_id),
  foreign key (corpus_version, sentence_id)
    references public.writing_grammar_sentences(corpus_version, sentence_id)
    on delete cascade,
  foreign key (corpus_version, rule_id)
    references public.writing_grammar_rules(corpus_version, rule_id)
    on delete no action deferrable initially deferred,
  check (issue_id ~ '^PARA-[0-9]{4,}-I[0-9]{3,}$'),
  check (source_issue_id ~ '^I[0-9]{3,}$'),
  check (issue_order between 1 and 500),
  check (char_length(wrong_text) between 1 and 2000),
  check (char_length(replacement_text) between 1 and 2000),
  check (wrong_text <> replacement_text),
  check (occurrence_index between 1 and 100),
  check (char_length(explanation_zh_hant) between 1 and 2000),
  check (jsonb_typeof(acceptable_alternatives) = 'array'),
  check (confidence between 0.5 and 1),
  check (status in ('draft', 'reviewed', 'approved', 'retired')),
  unique (corpus_version, sentence_id, issue_order)
);

create table if not exists public.writing_grammar_rule_exceptions (
  corpus_version text not null,
  exception_id text not null,
  rule_id text not null,
  exception_order integer not null,
  condition_en text not null,
  example_text text not null,
  explanation_zh_hant text not null,
  english_variant text not null default 'both',
  status text not null,
  primary key (corpus_version, exception_id),
  foreign key (corpus_version, rule_id)
    references public.writing_grammar_rules(corpus_version, rule_id)
    on delete cascade,
  check (exception_id ~ '^EX-[A-Z0-9_]+-[0-9]{2,}$'),
  check (exception_order between 1 and 500),
  check (char_length(condition_en) between 1 and 1000),
  check (char_length(example_text) between 1 and 2000),
  check (char_length(explanation_zh_hant) between 1 and 2000),
  check (english_variant in ('British English', 'American English', 'both')),
  check (status in ('draft', 'reviewed', 'approved', 'retired')),
  unique (corpus_version, rule_id, exception_order)
);

-- Published corpus content is append-only. A release is populated while it is
-- `reviewed`, then the generated seed atomically promotes it to `approved`.
-- Once approved (or retired), only the `is_current` lifecycle flag may change;
-- an approved release may additionally move one way to `retired` after it has
-- been made non-current. Publishing corrected content always requires a new
-- corpus_version.
create or replace function public._writing_grammar_guard_release_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if new.status in ('approved', 'retired')
      or new.is_current
      or new.approved_at is not null
    then
      raise exception 'Grammar corpus releases must be populated and verified before approval'
        using errcode = '55000';
    end if;
    return new;
  end if;

  if old.status not in ('approved', 'retired') then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  if tg_op = 'DELETE' then
    raise exception 'Published grammar corpus releases are immutable'
      using errcode = '55000';
  end if;

  if new.corpus_version is distinct from old.corpus_version
    or new.schema_version is distinct from old.schema_version
    or new.title is distinct from old.title
    or new.notes is distinct from old.notes
    or new.content_sha256 is distinct from old.content_sha256
    or new.created_at is distinct from old.created_at
    or new.approved_at is distinct from old.approved_at
    or (
      new.status is distinct from old.status
      and not (
        old.status = 'approved'
        and new.status = 'retired'
        and not new.is_current
      )
    )
  then
    raise exception 'Published grammar corpus releases are immutable; publish a new version'
      using errcode = '55000';
  end if;

  return new;
end;
$$;

create or replace function public._writing_grammar_guard_published_row()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_old_corpus_version text;
  v_new_corpus_version text;
begin
  if tg_op <> 'INSERT' then
    v_old_corpus_version := old.corpus_version;
  end if;
  if tg_op <> 'DELETE' then
    v_new_corpus_version := new.corpus_version;
  end if;

  if exists (
    select 1
    from public.writing_grammar_corpus_releases release_row
    where release_row.corpus_version in (
      v_old_corpus_version,
      v_new_corpus_version
    )
      and release_row.status in ('approved', 'retired')
  ) then
    raise exception 'Published grammar corpus rows are immutable; publish a new version'
      using errcode = '55000';
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists writing_grammar_release_immutable
  on public.writing_grammar_corpus_releases;
create trigger writing_grammar_release_immutable
before insert or update or delete on public.writing_grammar_corpus_releases
for each row execute function public._writing_grammar_guard_release_mutation();

drop trigger if exists writing_grammar_groups_immutable
  on public.writing_grammar_corpus_groups;
create trigger writing_grammar_groups_immutable
before insert or update or delete on public.writing_grammar_corpus_groups
for each row execute function public._writing_grammar_guard_published_row();

drop trigger if exists writing_grammar_rules_immutable
  on public.writing_grammar_rules;
create trigger writing_grammar_rules_immutable
before insert or update or delete on public.writing_grammar_rules
for each row execute function public._writing_grammar_guard_published_row();

drop trigger if exists writing_grammar_paragraphs_immutable
  on public.writing_grammar_paragraphs;
create trigger writing_grammar_paragraphs_immutable
before insert or update or delete on public.writing_grammar_paragraphs
for each row execute function public._writing_grammar_guard_published_row();

drop trigger if exists writing_grammar_sentences_immutable
  on public.writing_grammar_sentences;
create trigger writing_grammar_sentences_immutable
before insert or update or delete on public.writing_grammar_sentences
for each row execute function public._writing_grammar_guard_published_row();

drop trigger if exists writing_grammar_issues_immutable
  on public.writing_grammar_issues;
create trigger writing_grammar_issues_immutable
before insert or update or delete on public.writing_grammar_issues
for each row execute function public._writing_grammar_guard_published_row();

drop trigger if exists writing_grammar_exceptions_immutable
  on public.writing_grammar_rule_exceptions;
create trigger writing_grammar_exceptions_immutable
before insert or update or delete on public.writing_grammar_rule_exceptions
for each row execute function public._writing_grammar_guard_published_row();

alter table public.writing_grammar_corpus_releases enable row level security;
alter table public.writing_grammar_corpus_groups enable row level security;
alter table public.writing_grammar_rules enable row level security;
alter table public.writing_grammar_paragraphs enable row level security;
alter table public.writing_grammar_sentences enable row level security;
alter table public.writing_grammar_issues enable row level security;
alter table public.writing_grammar_rule_exceptions enable row level security;

revoke all on table public.writing_grammar_corpus_releases from public, anon, authenticated, service_role;
revoke all on table public.writing_grammar_corpus_groups from public, anon, authenticated, service_role;
revoke all on table public.writing_grammar_rules from public, anon, authenticated, service_role;
revoke all on table public.writing_grammar_paragraphs from public, anon, authenticated, service_role;
revoke all on table public.writing_grammar_sentences from public, anon, authenticated, service_role;
revoke all on table public.writing_grammar_issues from public, anon, authenticated, service_role;
revoke all on table public.writing_grammar_rule_exceptions from public, anon, authenticated, service_role;

create or replace function public.writing_grammar_corpus_status()
returns table (
  corpus_version text,
  paragraph_count bigint,
  sentence_count bigint,
  issue_count bigint,
  rule_count bigint,
  exception_count bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  select release_row.corpus_version,
         (select count(*) from public.writing_grammar_paragraphs value
          where value.corpus_version = release_row.corpus_version and value.status = 'approved'),
         (select count(*) from public.writing_grammar_sentences value
          where value.corpus_version = release_row.corpus_version and value.status = 'approved'),
         (select count(*) from public.writing_grammar_issues value
          where value.corpus_version = release_row.corpus_version and value.status = 'approved'),
         (select count(*) from public.writing_grammar_rules value
          where value.corpus_version = release_row.corpus_version and value.status = 'approved'),
         (select count(*) from public.writing_grammar_rule_exceptions value
          where value.corpus_version = release_row.corpus_version and value.status = 'approved')
  from public.writing_grammar_corpus_releases release_row
  where release_row.is_current and release_row.status = 'approved'
  limit 1;
$$;

revoke all on function public._writing_grammar_normalize_sentence(text)
  from public, anon, authenticated, service_role;
revoke all on function public._writing_grammar_guard_release_mutation()
  from public, anon, authenticated, service_role;
revoke all on function public._writing_grammar_guard_published_row()
  from public, anon, authenticated, service_role;
revoke all on function public.writing_grammar_corpus_status()
  from public, anon, authenticated, service_role;

grant execute on function public.writing_grammar_corpus_status() to service_role;

notify pgrst, 'reload schema';

commit;
