-- Student-owned, read-only unified bookmark directory across Edmund systems.
begin;

do $$
begin
  if pg_catalog.to_regclass('public.flashcard_student_state') is null
    or pg_catalog.to_regclass('public.common_expression_bookmarks') is null
    or pg_catalog.to_regclass('public.idiom_system_bookmarks') is null
    or pg_catalog.to_regclass('public.proverb_system_bookmarks') is null
    or pg_catalog.to_regclass('public.phrasal_verb_system_bookmarks') is null
    or pg_catalog.to_regclass('public.sentence_structure_bookmarks') is null
    or pg_catalog.to_regclass('public.song_appreciation_bookmarks') is null
    or pg_catalog.to_regclass('public.video_class_bookmarks') is null
    or pg_catalog.to_regclass('public.writing_submission_feedback_fragment_bookmarks') is null
    or pg_catalog.to_regclass('public.writing_student_accounts') is null
    or pg_catalog.to_regclass('public.writing_student_state') is null
  then
    raise exception 'Apply all bookmark-producing system migrations first';
  end if;
end;
$$;

create or replace function public.student_unified_bookmark_directory(p_student_token uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  v_student_id := public.flashcard_session_student_id(p_student_token);
  if v_student_id is null then
    raise exception 'Invalid or expired student session' using errcode = '42501';
  end if;

  return coalesce((
    with bookmark_rows as (
      select
        'flashcards:' || coalesce(item->>'key', pg_catalog.md5(item::text)) as item_id,
        'flashcards'::text as system_key,
        'Flashcard 學習卡'::text as system_label,
        coalesce(nullif(item->>'front', ''), 'Flashcard 私人書簽') as title,
        coalesce(nullif(item->>'sourceDeckTitle', ''), nullif(item->>'deckId', ''), '') as detail,
        'flashcards.html'::text as href,
        state.updated_at as created_at
      from public.flashcard_student_state state
      cross join lateral jsonb_each(case when jsonb_typeof(state.value) = 'object' then state.value else '{}'::jsonb end) owner_rows(owner_name, bookmarks)
      cross join lateral jsonb_array_elements(case when jsonb_typeof(owner_rows.bookmarks) = 'array' then owner_rows.bookmarks else '[]'::jsonb end) item
      where state.student_id = v_student_id
        and state.key = 'edmundFlashcardBookmarks'

      union all
      select
        'writing-practice:' || exercise.value,
        'writing',
        'Writing Practice 寫作練習',
        exercise.value,
        '寫作練習書簽',
        'writing-practice.html?exercise=' || exercise.value,
        writing_state.updated_at
      from public.writing_student_accounts writing_student
      join public.flashcard_students flashcard_student
        on flashcard_student.id = v_student_id
       and writing_student.name = flashcard_student.name
      join public.writing_student_state writing_state
        on writing_state.student_id = writing_student.id
       and writing_state.key = 'writing-bookmarks-v1'
      cross join lateral pg_catalog.jsonb_array_elements_text(
        case
          when pg_catalog.jsonb_typeof(writing_state.value -> 'exerciseIds') = 'array'
            then writing_state.value -> 'exerciseIds'
          else '[]'::jsonb
        end
      ) exercise(value)

      union all
      select
        'common:' || bookmark.system_key || ':' || bookmark.lesson_id,
        bookmark.system_key,
        case bookmark.system_key
          when 'speaking' then 'Common Expression · Speaking'
          when 'written' then 'Common Expression · Written'
          when 'rhetorical-speaking' then 'Common Expression · Rhetorical Speaking'
          when 'rhetorical-writing' then 'Common Expression · Rhetorical Writing'
          when 'professional-message' then 'Common Expression · Professional Message'
          when 'business-speaking' then 'Common Expression · Business Speaking'
          else 'Common Expression'
        end,
        bookmark.lesson_id,
        '整課書簽',
        case bookmark.system_key
          when 'speaking' then 'common-expression-speaking.html'
          when 'written' then 'common-expression-written.html'
          when 'rhetorical-speaking' then 'common-expression-rhetorical-speaking.html'
          when 'rhetorical-writing' then 'common-expression-rhetorical-writing.html'
          when 'professional-message' then 'common-expression-professional-message.html'
          when 'business-speaking' then 'common-expression-business-speaking.html'
          else 'index.html'
        end,
        bookmark.created_at
      from public.common_expression_bookmarks bookmark
      where bookmark.student_id = v_student_id

      union all
      select 'idiom:' || lesson_id || ':' || question_id, 'idioms', '英文慣用語', lesson_id,
        case when question_id = '__section__' then '整課書簽' else question_id end,
        'idiom-system.html?lesson=' || lesson_id, created_at
      from public.idiom_system_bookmarks where student_id = v_student_id

      union all
      select 'proverb:' || lesson_id || ':' || question_id, 'proverbs', '英文諺語', lesson_id,
        case when question_id = '__section__' then '整課書簽' else question_id end,
        'proverb-system.html?lesson=' || lesson_id, created_at
      from public.proverb_system_bookmarks where student_id = v_student_id

      union all
      select 'phrasal:' || lesson_id || ':' || question_id, 'phrasal-verbs', 'Phrasal Verb 動詞片語', lesson_id,
        case when question_id = '__section__' then '整課書簽' else question_id end,
        'phrasal-verb-system.html?lesson=' || lesson_id, created_at
      from public.phrasal_verb_system_bookmarks where student_id = v_student_id

      union all
      select 'sentence:' || lesson_id || ':' || question_id, 'sentence', '句子結構', lesson_id,
        case when question_id = '__section__' then '整課書簽' else question_id end,
        'sentence-structure.html?lesson=' || lesson_id, created_at
      from public.sentence_structure_bookmarks where student_id = v_student_id

      union all
      select 'song:' || bookmark.id::text, 'song-appreciation', 'Song Appreciation 英文歌', song.title,
        bookmark.bookmark_text,
        'song-appreciation.html?song=' || song.slug, bookmark.created_at
      from public.song_appreciation_bookmarks bookmark
      join public.song_appreciation_songs song on song.id = bookmark.song_id
      where bookmark.student_id = v_student_id

      union all
      select 'video:' || bookmark.lesson_id::text, 'video-class', '錄影班學習平台', lesson.title,
        lesson.course_label,
        'video-class.html?video=' || lesson.slug, bookmark.created_at
      from public.video_class_bookmarks bookmark
      join public.video_class_lessons lesson on lesson.id = bookmark.lesson_id
      where bookmark.student_id = v_student_id

      union all
      select 'writing:' || bookmark.fragment_id::text, 'writing-submission', 'Writing Submission',
        left(coalesce(nullif(fragment.original_fragment, ''), 'Edmund 評語書簽'), 240),
        left(fragment.edmund_comment, 500),
        'writing-submission.html', bookmark.updated_at
      from public.writing_submission_feedback_fragment_bookmarks bookmark
      join public.writing_submission_feedback_fragments fragment on fragment.id = bookmark.fragment_id
      where bookmark.student_id = v_student_id and bookmark.bookmarked
    )
    select jsonb_build_object(
      'total', count(*),
      'items', coalesce(jsonb_agg(jsonb_build_object(
        'id', item_id,
        'systemKey', system_key,
        'systemLabel', system_label,
        'title', title,
        'detail', detail,
        'href', href,
        'createdAt', created_at
      ) order by created_at desc, item_id), '[]'::jsonb)
    )
    from bookmark_rows
  ), jsonb_build_object('total', 0, 'items', '[]'::jsonb));
end;
$$;

revoke all on function public.student_unified_bookmark_directory(uuid) from public, anon, authenticated;
grant execute on function public.student_unified_bookmark_directory(uuid) to authenticated;

commit;
