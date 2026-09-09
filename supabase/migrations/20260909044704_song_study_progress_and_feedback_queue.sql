-- Durable drafts are separate from immutable completed attempts.
create table public.song_appreciation_drafts (
 student_id uuid not null references public.flashcard_students(id) on delete cascade,
 song_id uuid not null references public.song_appreciation_songs(id) on delete cascade,
 mode_id text not null check(mode_id in ('standard','medium','hard','hell')),
 exercise_version integer not null check(exercise_version between 1 and 100000),
 answers jsonb not null default '{}' check(jsonb_typeof(answers)='object'),
 result jsonb not null default '{}' check(jsonb_typeof(result)='object'),
 duration_ms bigint not null default 0 check(duration_ms between 0 and 14400000),
 started_at timestamptz not null default now(),
 revision bigint not null default 0,
 mutation_id uuid,
 mutation_payload jsonb,
 updated_at timestamptz not null default now(),
 primary key(student_id,song_id,mode_id)
);
alter table public.song_appreciation_drafts enable row level security;
revoke all on public.song_appreciation_drafts from public,anon,authenticated,service_role;
create index song_appreciation_drafts_song_idx on public.song_appreciation_drafts(song_id);

create function public.song_appreciation_draft_list(p_student_token uuid)
returns setof public.song_appreciation_drafts language plpgsql stable security definer set search_path='' as $$
declare student uuid:=public._song_appreciation_student_id(p_student_token);
begin
 if student is null then raise exception 'Unauthorized' using errcode='42501'; end if;
 return query select d.* from public.song_appreciation_drafts d where d.student_id=student
 and public._song_appreciation_student_can_access(student,d.song_id);
end;$$;

create function public.song_appreciation_draft_save(p_student_token uuid,p_song_id uuid,p_mode_id text,p_exercise_version integer,p_answers jsonb,p_duration_ms bigint,p_started_at timestamptz,p_expected_revision bigint,p_mutation_id uuid,p_action text default 'save')
returns setof public.song_appreciation_drafts language plpgsql security definer set search_path='' as $$
declare
 student uuid:=public._song_appreciation_student_id(p_student_token);
 d public.song_appreciation_drafts%rowtype;
 mode jsonb; q jsonb; k text; selected text; results jsonb; payload jsonb;
begin
 if student is null or not public._song_appreciation_student_can_access(student,p_song_id) then raise exception 'Unauthorized' using errcode='42501'; end if;
 if p_mutation_id is null or p_expected_revision is null or p_expected_revision<0 or p_action is null or p_action not in ('save','check','reset')
 or p_answers is null or jsonb_typeof(p_answers)<>'object' or octet_length(p_answers::text)>262144
 or p_duration_ms is null or p_duration_ms not between 0 and 14400000 or p_started_at is null
 or p_started_at < '2020-01-01'::timestamptz or p_started_at > now()+interval '5 minutes' then raise exception 'Invalid draft' using errcode='22023'; end if;
 select m.value into mode from public.song_appreciation_songs s cross join lateral jsonb_array_elements(s.exercises) m(value) where s.id=p_song_id and m.value->>'id'=p_mode_id;
 if mode is null or coalesce((mode->>'version')::int,1) is distinct from p_exercise_version then raise exception 'Exercise version is stale' using errcode='22023'; end if;
 perform pg_advisory_xact_lock(hashtextextended('song-draft:'||student::text||p_song_id::text||p_mode_id,0));
 payload:=jsonb_build_object('answers',p_answers,'duration',p_duration_ms,'started',p_started_at,'version',p_exercise_version,'action',p_action);
 select * into d from public.song_appreciation_drafts x where x.student_id=student and x.song_id=p_song_id and x.mode_id=p_mode_id for update;
 if found and d.mutation_id=p_mutation_id then
  if d.mutation_payload is distinct from payload then raise exception 'Mutation content changed' using errcode='23505'; end if;
  return next d;return;
 end if;
 if coalesce(d.revision,0)<>p_expected_revision then raise exception 'Draft changed on another device' using errcode='40001'; end if;
 if d.exercise_version is not null and d.exercise_version<>p_exercise_version and p_action<>'reset' then raise exception 'Reset the outdated draft before continuing' using errcode='22023'; end if;
 results:=coalesce(d.result,'{}'::jsonb);
 if p_action='reset' then
  if p_answers<>'{}'::jsonb then raise exception 'Reset requires empty answers' using errcode='22023'; end if;
  results:='{}'::jsonb;
 else
  for k,selected in select key,value from jsonb_each_text(p_answers) loop
   select value into q from jsonb_array_elements(mode->'questions') where value->>'number'=k;
   if q is null or jsonb_typeof(p_answers->k)<>'string' or not (q->'options' ? selected) then raise exception 'Invalid answer' using errcode='22023'; end if;
  end loop;
  for k in select jsonb_object_keys(results) loop
   if p_answers->>k is distinct from results->k->>'selected' then raise exception 'Checked answers are locked until reset' using errcode='22023'; end if;
  end loop;
  if p_action='check' then
   if p_answers='{}'::jsonb then raise exception 'Answer at least one question' using errcode='22023'; end if;
   for q in select value from jsonb_array_elements(mode->'questions') loop
    k:=q->>'number';
    if p_answers ? k then results:=results||jsonb_build_object(k,jsonb_build_object('selected',p_answers->>k,'answer',q->>'answer','correct',(p_answers->>k)=(q->>'answer'))); end if;
   end loop;
  end if;
 end if;
 insert into public.song_appreciation_drafts as target(student_id,song_id,mode_id,exercise_version,answers,result,duration_ms,started_at,revision,mutation_id,mutation_payload,updated_at)
 values(student,p_song_id,p_mode_id,p_exercise_version,p_answers,results,p_duration_ms,p_started_at,coalesce(d.revision,0)+1,p_mutation_id,payload,now())
 on conflict(student_id,song_id,mode_id) do update set exercise_version=excluded.exercise_version,answers=excluded.answers,result=excluded.result,duration_ms=excluded.duration_ms,started_at=excluded.started_at,revision=excluded.revision,mutation_id=excluded.mutation_id,mutation_payload=excluded.mutation_payload,updated_at=excluded.updated_at
 returning target.* into d;
 return next d;
end;$$;
revoke all on function public.song_appreciation_draft_list(uuid),public.song_appreciation_draft_save(uuid,uuid,text,integer,jsonb,bigint,timestamptz,bigint,uuid,text) from public,anon,authenticated,service_role;
grant execute on function public.song_appreciation_draft_list(uuid),public.song_appreciation_draft_save(uuid,uuid,text,integer,jsonb,bigint,timestamptz,bigint,uuid,text) to anon,authenticated;

-- Personal admin queue state; does not delete or change a student's article.
create table public.writing_submission_feedback_ignored (
 admin_id uuid not null references public.writing_submission_admin_accounts(id) on delete cascade,
 submission_id uuid not null references public.writing_submissions(id) on delete cascade,
 created_at timestamptz not null default now(),primary key(admin_id,submission_id)
);
alter table public.writing_submission_feedback_ignored enable row level security;
revoke all on public.writing_submission_feedback_ignored from public,anon,authenticated,service_role;
create index writing_submission_feedback_ignored_submission_idx on public.writing_submission_feedback_ignored(submission_id);
create function public.writing_submission_admin_ignored_list(p_admin_token uuid) returns table(submission_id uuid) language plpgsql stable security definer set search_path='' as $$
declare admin uuid:=public._writing_submission_admin_id(p_admin_token);
begin
 if admin is null then raise exception 'Unauthorized' using errcode='42501'; end if;
 return query select i.submission_id from public.writing_submission_feedback_ignored i where i.admin_id=admin;
end;$$;
create function public.writing_submission_admin_ignore(p_admin_token uuid,p_submission_id uuid,p_ignored boolean) returns boolean language plpgsql security definer set search_path='' as $$
declare admin uuid:=public._writing_submission_admin_id(p_admin_token);
begin
 if admin is null then raise exception 'Unauthorized' using errcode='42501'; end if;
 if p_ignored is null or not exists(select 1 from public.writing_submissions s where s.id=p_submission_id and s.deleted_at is null) then raise exception 'Submission not found' using errcode='22023'; end if;
 if p_ignored then insert into public.writing_submission_feedback_ignored(admin_id,submission_id) values(admin,p_submission_id) on conflict do nothing;
 else delete from public.writing_submission_feedback_ignored i where i.admin_id=admin and i.submission_id=p_submission_id;end if;
 return true;
end;$$;
revoke all on function public.writing_submission_admin_ignored_list(uuid),public.writing_submission_admin_ignore(uuid,uuid,boolean) from public,anon,authenticated,service_role;
grant execute on function public.writing_submission_admin_ignored_list(uuid),public.writing_submission_admin_ignore(uuid,uuid,boolean) to service_role;

DO $$ declare c record; begin for c in select conname from pg_constraint where conrelid='public.song_appreciation_bookmarks'::regclass and contype='c' and pg_get_constraintdef(oid) like '%kind%' loop execute format('alter table public.song_appreciation_bookmarks drop constraint %I',c.conname); end loop; end;$$;
DO $$ declare c record; begin for c in select conname from pg_constraint where conrelid='public.song_appreciation_bookmarks'::regclass and contype='c' and pg_get_constraintdef(oid) like '%char_length(bookmark_text)%' loop execute format('alter table public.song_appreciation_bookmarks drop constraint %I',c.conname); end loop; end;$$;
alter table public.song_appreciation_bookmarks add constraint song_appreciation_bookmarks_text_length_check check(char_length(bookmark_text) between 1 and 20000);
alter table public.song_appreciation_bookmarks add constraint song_appreciation_bookmarks_kind_check check(kind in ('word','phrase','song'));

create or replace function public.song_appreciation_bookmark_add(
  p_student_token uuid,
  p_song_id uuid,
  p_kind text,
  p_bookmark_text text,
  p_source_text text,
  p_source_locator jsonb
)
returns table (
  id uuid,
  song_id uuid,
  kind text,
  bookmark_text text,
  source_text text,
  source_locator jsonb,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid := public._song_appreciation_student_id(p_student_token);
  v_kind text := pg_catalog.lower(pg_catalog.btrim(coalesce(p_kind, '')));
  v_text text := pg_catalog.btrim(coalesce(p_bookmark_text, ''));
  v_source_text text := coalesce(p_source_text, '');
  v_source_locator jsonb := coalesce(p_source_locator, '{}'::jsonb);
  v_id uuid;
begin
  if v_student_id is null
    or not public._song_appreciation_student_can_access(v_student_id, p_song_id)
  then
    raise exception 'Unauthorized' using errcode = '42501';
  end if;

  if v_kind not in ('word', 'phrase', 'song')
    or pg_catalog.char_length(v_text) not between 1 and 20000
    or v_text ~ '[[:cntrl:]]'
    or pg_catalog.char_length(v_source_text) > 1500
    or pg_catalog.jsonb_typeof(v_source_locator) <> 'object'
    or pg_catalog.octet_length(v_source_locator::text) > 8192
  then
    raise exception 'Invalid bookmark' using errcode = '22023';
  end if;

  if v_kind = 'song' then
    select s.title into v_text from public.song_appreciation_songs s where s.id=p_song_id;
    v_source_text := ''; v_source_locator := '{}'::jsonb;
  end if;

  insert into public.song_appreciation_bookmarks (
    student_id,
    song_id,
    kind,
    bookmark_text,
    source_text,
    source_locator
  ) values (
    v_student_id,
    p_song_id,
    v_kind,
    v_text,
    v_source_text,
    v_source_locator
  )
  on conflict do nothing
  returning song_appreciation_bookmarks.id into v_id;

  if v_id is null then
    select bookmark.id
    into v_id
    from public.song_appreciation_bookmarks bookmark
    where bookmark.student_id = v_student_id
      and bookmark.song_id = p_song_id
      and bookmark.kind = v_kind
      and bookmark.bookmark_text = v_text
      and bookmark.source_text = v_source_text;
  end if;

  return query
  select
    bookmark.id,
    bookmark.song_id,
    bookmark.kind,
    bookmark.bookmark_text,
    bookmark.source_text,
    bookmark.source_locator,
    bookmark.created_at
  from public.song_appreciation_bookmarks bookmark
  where bookmark.id = v_id;
end;
$$;


-- Resumed drafts may span multiple days; active duration remains bounded.
create or replace function public.song_appreciation_attempt_save(
  p_student_token uuid,
  p_attempt_id uuid,
  p_song_id uuid,
  p_mode_id text,
  p_exercise_version integer,
  p_answers jsonb,
  p_duration_ms bigint,
  p_started_at timestamptz,
  p_completed_at timestamptz
)
returns table (
  id uuid,
  song_id uuid,
  mode_id text,
  exercise_version integer,
  answers jsonb,
  result jsonb,
  correct_count integer,
  total_count integer,
  duration_ms bigint,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid := public._song_appreciation_student_id(p_student_token);
  v_existing public.song_appreciation_attempts%rowtype;
  v_mode_id text := pg_catalog.lower(pg_catalog.btrim(coalesce(p_mode_id, '')));
  v_exercises jsonb;
  v_mode jsonb;
  v_questions jsonb;
  v_question jsonb;
  v_ordinal bigint;
  v_question_key text;
  v_selected_json jsonb;
  v_selected text;
  v_answer text;
  v_stored_version integer;
  v_answer_count integer;
  v_total_count integer;
  v_correct_count integer := 0;
  v_result jsonb := '{}'::jsonb;
  v_now timestamptz := pg_catalog.clock_timestamp();
begin
  if v_student_id is null then
    raise exception 'Unauthorized' using errcode = '42501';
  end if;

  if p_attempt_id is null
    or v_mode_id not in ('standard', 'medium', 'hard', 'hell')
    or p_exercise_version is null
    or p_exercise_version not between 1 and 100000
    or p_answers is null
    or pg_catalog.jsonb_typeof(p_answers) <> 'object'
    or pg_catalog.octet_length(p_answers::text) > 262144
    or p_duration_ms is null
    or p_duration_ms not between 0 and 14400000
    or p_started_at is null
    or p_completed_at is null
    or p_started_at < timestamptz '2020-01-01 00:00:00+00'
    or p_completed_at < p_started_at
  then
    raise exception 'Invalid completed attempt' using errcode = '22023';
  end if;

  -- Lock the content row for the duration of a new submission. The same query
  -- enforces publication and the missing-row-means-allowed override rule.
  select song.exercises
  into v_exercises
  from public.song_appreciation_songs song
  where song.id = p_song_id
    and song.published
    and not exists (
      select 1
      from public.song_appreciation_access_overrides access_row
      where access_row.student_id = v_student_id
        and access_row.song_id = song.id
        and not access_row.allowed
    )
  for share;

  if not found then
    raise exception 'Unauthorized' using errcode = '42501';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'song-appreciation-attempt:' || p_attempt_id::text,
      0
    )
  );

  select attempt.*
  into v_existing
  from public.song_appreciation_attempts attempt
  where attempt.id = p_attempt_id;

  if found then
    if v_existing.student_id is distinct from v_student_id
      or v_existing.song_id is distinct from p_song_id
      or v_existing.mode_id is distinct from v_mode_id
      or v_existing.exercise_version is distinct from p_exercise_version
      or v_existing.answers is distinct from p_answers
      or v_existing.duration_ms is distinct from p_duration_ms
      or v_existing.started_at is distinct from p_started_at
      or v_existing.completed_at is distinct from p_completed_at
    then
      raise exception 'Attempt UUID already belongs to different content'
        using errcode = '23505';
    end if;
  else
    -- Refresh after any row/advisory-lock wait so the accepted completion
    -- window is measured against validation time, not function-entry time.
    v_now := pg_catalog.clock_timestamp();
    if p_completed_at < v_now - interval '10 minutes'
      or p_completed_at > v_now + interval '5 minutes'
      or p_duration_ms > (
        pg_catalog.date_part('epoch', p_completed_at - p_started_at) * 1000
      )::bigint + 60000
    then
      raise exception 'Attempt timing is outside the accepted submission window'
        using errcode = '22023';
    end if;

    if not public._song_appreciation_exercises_valid(v_exercises) then
      raise exception 'Stored exercise definition is invalid'
        using errcode = '22023';
    end if;

    select mode_row.value
    into v_mode
    from pg_catalog.jsonb_array_elements(v_exercises) mode_row(value)
    where mode_row.value ->> 'id' = v_mode_id
    limit 1;

    if not found then
      raise exception 'Exercise mode not found' using errcode = '22023';
    end if;

    v_stored_version := case
      when v_mode ? 'version' then (v_mode ->> 'version')::integer
      else 1
    end;
    if p_exercise_version <> v_stored_version then
      raise exception 'Exercise version is stale' using errcode = '22023';
    end if;

    v_questions := v_mode -> 'questions';
    v_total_count := pg_catalog.jsonb_array_length(v_questions);
    select pg_catalog.count(*)::integer
    into v_answer_count
    from pg_catalog.jsonb_object_keys(p_answers);
    if v_answer_count <> v_total_count then
      raise exception 'Every exercise question must be answered exactly once'
        using errcode = '22023';
    end if;

    for v_question, v_ordinal in
      select question_row.value, question_row.ordinality
      from pg_catalog.jsonb_array_elements(v_questions)
        with ordinality as question_row(value, ordinality)
    loop
      v_question_key := v_ordinal::text;
      v_selected_json := p_answers -> v_question_key;
      if pg_catalog.jsonb_typeof(v_selected_json) <> 'string' then
        raise exception 'Invalid answer for question %', v_question_key
          using errcode = '22023';
      end if;

      v_selected := v_selected_json #>> '{}';
      if not exists (
        select 1
        from pg_catalog.jsonb_array_elements_text(v_question -> 'options')
          option_row(option_text)
        where option_row.option_text = v_selected
      ) then
        raise exception 'Answer is not an option for question %', v_question_key
          using errcode = '22023';
      end if;

      v_answer := v_question ->> 'answer';
      if v_selected = v_answer then
        v_correct_count := v_correct_count + 1;
      end if;
      v_result := v_result || pg_catalog.jsonb_build_object(
        v_question_key,
        pg_catalog.jsonb_build_object(
          'selected', v_selected,
          'answer', v_answer,
          'correct', v_selected = v_answer
        )
      );
    end loop;

    if pg_catalog.octet_length(v_result::text) > 524288 then
      raise exception 'Computed result is too large' using errcode = '22023';
    end if;

    insert into public.song_appreciation_attempts (
      id,
      student_id,
      song_id,
      mode_id,
      exercise_version,
      answers,
      result,
      correct_count,
      total_count,
      duration_ms,
      started_at,
      completed_at
    ) values (
      p_attempt_id,
      v_student_id,
      p_song_id,
      v_mode_id,
      p_exercise_version,
      p_answers,
      v_result,
      v_correct_count,
      v_total_count,
      p_duration_ms,
      p_started_at,
      p_completed_at
    );
  end if;

  return query
  select
    attempt.id,
    attempt.song_id,
    attempt.mode_id,
    attempt.exercise_version,
    attempt.answers,
    attempt.result,
    attempt.correct_count,
    attempt.total_count,
    attempt.duration_ms,
    attempt.started_at,
    attempt.completed_at,
    attempt.created_at
  from public.song_appreciation_attempts attempt
  where attempt.id = p_attempt_id;
end;
$$;


-- Chinese question/option annotations; scoring and versions remain unchanged.
update public.song_appreciation_songs set exercises = $songdata$[{"id": "standard", "label": "標準模式", "title": "標準模式", "version": 1, "questions": [{"answer": "knives", "number": 1, "prompt": "You, with your words like {{blank}}", "options": ["knives", "lives", "nights"], "promptZh": "你啊，說出的每一句話，都像刀鋒一樣傷人", "optionsZh": ["刀子", "生命；生活", "夜晚"]}, {"answer": "weapons", "number": 2, "prompt": "And swords and {{blank}} that you use against me", "options": ["weapons", "shields", "songs"], "promptZh": "像利劍，像武器，一次又一次向我刺來", "optionsZh": ["武器", "盾牌", "歌曲"]}, {"answer": "knocked me off my feet", "number": 3, "prompt": "You have {{blank}} again", "options": ["knocked me off my feet", "walked me off the line", "bullied me over and over"], "promptZh": "你又一次把我擊倒", "optionsZh": ["把我擊倒", "帶我離開那條線", "一次又一次欺凌我"]}, {"answer": "nothing", "number": 4, "prompt": "Got me feeling like I'm {{blank}}", "options": ["famous", "losing", "nothing"], "promptZh": "讓我覺得自己一無是處", "optionsZh": ["有名的", "失去；落敗", "甚麼也沒有"]}, {"answer": "chalkboard", "number": 5, "prompt": "You, with your voice like nails on a {{blank}}", "options": ["chalkboard", "fingers", "notebook"], "promptZh": "你啊，那刺耳的聲音，就像指甲劃過黑板", "optionsZh": ["黑板", "手指", "筆記簿"]}, {"answer": "wounded", "number": 6, "prompt": "Calling me out when I'm {{blank}}", "options": ["tired", "wounded", "upset"], "promptZh": "趁我受傷時，還要揪著我不放", "optionsZh": ["疲倦的", "受傷的", "難過的；心煩的"]}, {"answer": "weaker man", "number": 7, "prompt": "You, picking on the {{blank}}", "options": ["fingernail", "weaker man", "weaker hand"], "promptZh": "你總愛欺負比自己弱小的人", "optionsZh": ["指甲", "較軟弱的人", "較弱的一手；較不利的條件"]}, {"answer": "single blow", "number": 8, "prompt": "With just one {{blank}}", "options": ["sudden fall", "single blow", "little show"], "promptZh": "甚至只消一下，就足以讓我倒下", "optionsZh": ["突然跌倒；突然下降", "一次打擊", "小表演；小把戲"]}, {"answer": "big old city", "number": 9, "prompt": "Someday, I'll be living in a {{blank}}", "options": ["bright new city", "big old city", "small old town"], "promptZh": "總有一天，我會在那座繁華的大城市裡生活", "optionsZh": ["明亮的新城市", "一座大城市", "一座古老的小鎮"]}, {"answer": "mean", "number": 10, "prompt": "And all you're ever gonna be is {{blank}}", "options": ["mean", "mad", "weak"], "promptZh": "而你到頭來，也只會是個刻薄的人", "optionsZh": ["刻薄的", "憤怒的；瘋狂的", "軟弱的"]}, {"answer": "big enough", "number": 11, "prompt": "Someday, I'll be {{blank}} so you can't hit me", "options": ["old enough", "strong enough", "big enough"], "promptZh": "總有一天，我會強大得讓你再也傷不了我", "optionsZh": ["年紀足夠大", "足夠強大", "足夠大；足夠強大"]}, {"answer": "switching sides", "number": 12, "prompt": "You, with your {{blank}}", "options": ["shifting lines", "switching sides", "changing minds"], "promptZh": "你啊，總是反覆無常，說變就變", "optionsZh": ["移動的界線", "轉換立場", "改變想法"]}, {"answer": "wildfire lies", "number": 13, "prompt": "And your {{blank}} and your humiliation", "options": ["dangerous signs", "whispered cries", "wildfire lies"], "promptZh": "你的謊言如野火蔓延，還有那無休止的羞辱", "optionsZh": ["危險的徵兆", "低聲的呼喊", "像野火般蔓延的謊言"]}, {"answer": "humiliation", "number": 14, "prompt": "And your wildfire lies and your {{blank}}", "options": ["humiliation", "hesitation", "imagination"], "promptZh": "你的謊言如野火蔓延，還有那無休止的羞辱", "optionsZh": ["羞辱", "猶豫", "想像力"]}, {"answer": "flaws", "number": 15, "prompt": "You have pointed out my {{blank}} again", "options": ["flaws", "fears", "faults"], "promptZh": "你又一次把我的缺點逐一挑出來", "optionsZh": ["缺點；瑕疵", "恐懼", "缺點；過錯"]}, {"answer": "block you out", "number": 16, "prompt": "I walk with my head down, trying to {{blank}}", "options": ["tune you out", "block you out", "shut you down"], "promptZh": "我低著頭走，只想把你的聲音隔絕在外", "optionsZh": ["不再聽你說話", "把你拒諸門外；不再理會你", "制止你；令你閉嘴"]}, {"answer": "pushed around", "number": 17, "prompt": "I bet you got {{blank}}", "options": ["moved around", "turned around", "pushed around"], "promptZh": "我想，你大概也曾受人欺負", "optionsZh": ["四處移動", "轉身；轉變", "被欺負；被使喚"]}, {"answer": "cycle ends", "number": 18, "prompt": "But the {{blank}} right now", "options": ["fight starts", "cycle ends", "story ends"], "promptZh": "可這個惡性循環，就到我這裡為止", "optionsZh": ["爭鬥開始", "惡性循環結束", "故事結束"]}, {"answer": "nobody's listening", "number": 19, "prompt": "But {{blank}}", "options": ["someone's waiting", "everybody's laughing", "nobody's listening"], "promptZh": "可再也沒有人願意聽你說話", "optionsZh": ["有人正在等待", "每個人都在笑", "沒有人在聽"]}, {"answer": "bitter things", "number": 20, "prompt": "Washed up and ranting about the same old {{blank}}", "options": ["better days", "little things", "bitter things"], "promptZh": "風光不再，卻還在咆哮著那些陳年苦怨", "optionsZh": ["更好的日子", "小事", "令人痛苦的事；尖酸的話"]}], "questionCount": 20}, {"id": "medium", "label": "中等難度模式", "title": "中等難度模式", "version": 1, "questions": [{"answer": "knives", "number": 1, "prompt": "You, with your words like {{blank}}", "options": ["knives", "lives", "nights"], "promptZh": "你啊，說出的每一句話，都像刀鋒一樣傷人", "optionsZh": ["刀子", "生命；生活", "夜晚"]}, {"answer": "weapons", "number": 2, "prompt": "And swords and {{blank}} that you use against me", "options": ["songs", "shields", "weapons"], "promptZh": "像利劍，像武器，一次又一次向我刺來", "optionsZh": ["歌曲", "盾牌", "武器"]}, {"answer": "knocked me off my feet", "number": 3, "prompt": "You have {{blank}} again", "options": ["walked me off the line", "knocked me off my feet", "bullied me over and over"], "promptZh": "你又一次把我擊倒", "optionsZh": ["帶我離開那條線", "把我擊倒", "一次又一次欺凌我"]}, {"answer": "nothing", "number": 4, "prompt": "Got me feeling like I'm {{blank}}", "options": ["famous", "nothing", "losing"], "promptZh": "讓我覺得自己一無是處", "optionsZh": ["有名的", "甚麼也沒有", "失去；落敗"]}, {"answer": "chalkboard", "number": 5, "prompt": "You, with your voice like nails on a {{blank}}", "options": ["chalkboard", "notebook", "fingers"], "promptZh": "你啊，那刺耳的聲音，就像指甲劃過黑板", "optionsZh": ["黑板", "筆記簿", "手指"]}, {"answer": "wounded", "number": 6, "prompt": "Calling me out when I'm {{blank}}", "options": ["tired", "upset", "wounded"], "promptZh": "趁我受傷時，還要揪著我不放", "optionsZh": ["疲倦的", "難過的；心煩的", "受傷的"]}, {"answer": "weaker man", "number": 7, "prompt": "You, picking on the {{blank}}", "options": ["fingernail", "weaker man", "weaker hand"], "promptZh": "你總愛欺負比自己弱小的人", "optionsZh": ["指甲", "較軟弱的人", "較弱的一手；較不利的條件"]}, {"answer": "take me down", "number": 8, "prompt": "Well, you can {{blank}}", "options": ["let me go", "take me down", "turn me round"], "promptZh": "是啊，你或許能把我擊倒", "optionsZh": ["讓我離開", "把我擊倒；打垮我", "使我轉身；改變我"]}, {"answer": "single blow", "number": 9, "prompt": "With just one {{blank}}", "options": ["single blow", "sudden fall", "little show"], "promptZh": "甚至只消一下，就足以讓我倒下", "optionsZh": ["一次打擊", "突然跌倒；突然下降", "小表演；小把戲"]}, {"answer": "don't know what you don't know", "number": 10, "prompt": "But you {{blank}}", "options": ["don't see what you can't show", "don't care what you don't own", "don't know what you don't know"], "promptZh": "可你不知道的事，遠比你以為的更多", "optionsZh": ["看不到你無法展示的東西", "不在乎你沒有的東西", "不知道自己不知道甚麼"]}, {"answer": "big old city", "number": 11, "prompt": "Someday, I'll be living in a {{blank}}", "options": ["big old city", "small old town", "bright new city"], "promptZh": "總有一天，我會在那座繁華的大城市裡生活", "optionsZh": ["一座大城市", "一座古老的小鎮", "明亮的新城市"]}, {"answer": "mean", "number": 12, "prompt": "And all you're ever gonna be is {{blank}}", "options": ["mad", "weak", "mean"], "promptZh": "而你到頭來，也只會是個刻薄的人", "optionsZh": ["憤怒的；瘋狂的", "軟弱的", "刻薄的"]}, {"answer": "big enough", "number": 13, "prompt": "Someday, I'll be {{blank}} so you can't hit me", "options": ["big enough", "old enough", "strong enough"], "promptZh": "總有一天，我會強大得讓你再也傷不了我", "optionsZh": ["足夠大；足夠強大", "年紀足夠大", "足夠強大"]}, {"answer": "switching sides", "number": 14, "prompt": "You, with your {{blank}}", "options": ["changing minds", "shifting lines", "switching sides"], "promptZh": "你啊，總是反覆無常，說變就變", "optionsZh": ["改變想法", "移動的界線", "轉換立場"]}, {"answer": "wildfire lies", "number": 15, "prompt": "And your {{blank}} and your humiliation", "options": ["dangerous signs", "wildfire lies", "whispered cries"], "promptZh": "你的謊言如野火蔓延，還有那無休止的羞辱", "optionsZh": ["危險的徵兆", "像野火般蔓延的謊言", "低聲的呼喊"]}, {"answer": "humiliation", "number": 16, "prompt": "And your wildfire lies and your {{blank}}", "options": ["hesitation", "humiliation", "imagination"], "promptZh": "你的謊言如野火蔓延，還有那無休止的羞辱", "optionsZh": ["猶豫", "羞辱", "想像力"]}, {"answer": "pointed out", "number": 17, "prompt": "You have {{blank}} my flaws again", "options": ["pointed out", "figured out", "called up"], "promptZh": "你又一次把我的缺點逐一挑出來", "optionsZh": ["指出", "弄清楚；明白", "打電話給；召集"]}, {"answer": "flaws", "number": 18, "prompt": "You have pointed out my {{blank}} again", "options": ["fears", "faults", "flaws"], "promptZh": "你又一次把我的缺點逐一挑出來", "optionsZh": ["恐懼", "缺點；過錯", "缺點；瑕疵"]}, {"answer": "head down", "number": 19, "prompt": "I walk with my {{blank}}, trying to block you out", "options": ["head down", "eyes closed", "hands down"], "promptZh": "我低著頭走，只想把你的聲音隔絕在外", "optionsZh": ["低著頭", "閉上眼睛", "毫無疑問地；雙手放下"]}, {"answer": "block you out", "number": 20, "prompt": "I walk with my head down, trying to {{blank}}", "options": ["shut you down", "block you out", "tune you out"], "promptZh": "我低著頭走，只想把你的聲音隔絕在外", "optionsZh": ["制止你；令你閉嘴", "把你拒諸門外；不再理會你", "不再聽你說話"]}, {"answer": "impress you", "number": 21, "prompt": "'Cause I'll never {{blank}}", "options": ["upset you", "impress you", "forgive you"], "promptZh": "因為無論我怎麼做，都不可能令你滿意", "optionsZh": ["令你不快", "令你留下深刻印象", "原諒你"]}, {"answer": "feel okay again", "number": 22, "prompt": "I just wanna {{blank}}", "options": ["feel okay again", "feel alive again", "get away again"], "promptZh": "我只是想，再一次好好地活著，好好地做自己", "optionsZh": ["再次感覺好起來", "再次感到充滿活力", "再次逃離"]}, {"answer": "pushed around", "number": 23, "prompt": "I bet you got {{blank}}", "options": ["moved around", "turned around", "pushed around"], "promptZh": "我想，你大概也曾受人欺負", "optionsZh": ["四處移動", "轉身；轉變", "被欺負；被使喚"]}, {"answer": "Somebody made you cold", "number": 24, "prompt": "{{blank}}", "options": ["Someone made you strong", "Everybody left you alone", "Somebody made you cold"], "promptZh": "曾有人把你的心變得如此冷漠", "optionsZh": ["有人令你變得堅強", "所有人都離開了你", "有人令你變得冷漠"]}, {"answer": "cycle ends", "number": 25, "prompt": "But the {{blank}} right now", "options": ["story ends", "cycle ends", "fight starts"], "promptZh": "可這個惡性循環，就到我這裡為止", "optionsZh": ["故事結束", "惡性循環結束", "爭鬥開始"]}, {"answer": "years from now", "number": 26, "prompt": "And I can see you {{blank}} in a bar", "options": ["years from now", "miles from here", "days from now"], "promptZh": "我甚至看得見，多年後的你坐在酒吧裡", "optionsZh": ["多年之後", "離這裡幾英里遠", "幾天之後"]}, {"answer": "football game", "number": 27, "prompt": "Talking over a {{blank}}", "options": ["basketball match", "baseball field", "football game"], "promptZh": "對著一場足球賽喋喋不休", "optionsZh": ["籃球比賽", "棒球場", "足球比賽"]}, {"answer": "big loud opinion", "number": 28, "prompt": "With that same {{blank}}", "options": ["bold new ambition", "bad old decision", "big loud opinion"], "promptZh": "還是那副自以為是、高聲叫嚷的模樣", "optionsZh": ["大膽的新抱負", "以前糟糕的決定", "大聲又強烈的意見"]}, {"answer": "nobody's listening", "number": 29, "prompt": "But {{blank}}", "options": ["someone's waiting", "nobody's listening", "everybody's laughing"], "promptZh": "可再也沒有人願意聽你說話", "optionsZh": ["有人正在等待", "沒有人在聽", "每個人都在笑"]}, {"answer": "bitter things", "number": 30, "prompt": "Washed up and ranting about the same old {{blank}}", "options": ["bitter things", "little things", "better days"], "promptZh": "風光不再，卻還在咆哮著那些陳年苦怨", "optionsZh": ["令人痛苦的事；尖酸的話", "小事", "更好的日子"]}, {"answer": "grumbling", "number": 31, "prompt": "Drunk and {{blank}} on about how I can't sing", "options": ["whispering", "grumbling", "mumbling"], "promptZh": "醉醺醺地嘟囔著，說我根本不會唱歌", "optionsZh": ["低聲說話", "抱怨；發牢騷", "含糊地低聲說話"]}, {"answer": "can't sing", "number": 32, "prompt": "Drunk and grumbling on about how I {{blank}}", "options": ["can't sing", "can't speak", "won't win"], "promptZh": "醉醺醺地嘟囔著，說我根本不會唱歌", "optionsZh": ["不會唱歌", "不能說話", "不會勝出"]}], "questionCount": 32}, {"id": "hard", "label": "困難模式", "title": "困難模式", "version": 1, "questions": [{"answer": "knives", "number": 1, "prompt": "You, with your words like {{blank}}", "options": ["lives", "nights", "knives"], "promptZh": "你啊，說出的每一句話，都像刀鋒一樣傷人", "optionsZh": ["生命；生活", "夜晚", "刀子"]}, {"answer": "weapons", "number": 2, "prompt": "And swords and {{blank}} that you use against me", "options": ["weapons", "shields", "songs"], "promptZh": "像利劍，像武器，一次又一次向我刺來", "optionsZh": ["武器", "盾牌", "歌曲"]}, {"answer": "use against me", "number": 3, "prompt": "And swords and weapons that you {{blank}}", "options": ["bring beside me", "throw around me", "use against me"], "promptZh": "像利劍，像武器，一次又一次向我刺來", "optionsZh": ["帶到我身旁", "扔到我周圍", "用來對付我"]}, {"answer": "knocked me off my feet", "number": 4, "prompt": "You have {{blank}} again", "options": ["knocked me off my feet", "walked me off the line", "bullied me over and over"], "promptZh": "你又一次把我擊倒", "optionsZh": ["把我擊倒", "帶我離開那條線", "一次又一次欺凌我"]}, {"answer": "nothing", "number": 5, "prompt": "Got me feeling like I'm {{blank}}", "options": ["losing", "famous", "nothing"], "promptZh": "讓我覺得自己一無是處", "optionsZh": ["失去；落敗", "有名的", "甚麼也沒有"]}, {"answer": "chalkboard", "number": 6, "prompt": "You, with your voice like nails on a {{blank}}", "options": ["chalkboard", "notebook", "fingers"], "promptZh": "你啊，那刺耳的聲音，就像指甲劃過黑板", "optionsZh": ["黑板", "筆記簿", "手指"]}, {"answer": "Calling me out", "number": 7, "prompt": "{{blank}} when I'm wounded", "options": ["Calling me back", "Cutting me down", "Calling me out"], "promptZh": "趁我受傷時，還要揪著我不放", "optionsZh": ["叫我回去；給我回電", "貶低我", "公開指責我"]}, {"answer": "wounded", "number": 8, "prompt": "Calling me out when I'm {{blank}}", "options": ["upset", "wounded", "tired"], "promptZh": "趁我受傷時，還要揪著我不放", "optionsZh": ["難過的；心煩的", "受傷的", "疲倦的"]}, {"answer": "picking on", "number": 9, "prompt": "You, {{blank}} the weaker man", "options": ["looking at", "picking on", "talking to"], "promptZh": "你總愛欺負比自己弱小的人", "optionsZh": ["看著", "挑剔；欺負", "對……說話"]}, {"answer": "weaker man", "number": 10, "prompt": "You, picking on the {{blank}}", "options": ["weaker man", "fingernail", "weaker hand"], "promptZh": "你總愛欺負比自己弱小的人", "optionsZh": ["較軟弱的人", "指甲", "較弱的一手；較不利的條件"]}, {"answer": "take me down", "number": 11, "prompt": "Well, you can {{blank}}", "options": ["take me down", "let me go", "turn me round"], "promptZh": "是啊，你或許能把我擊倒", "optionsZh": ["把我擊倒；打垮我", "讓我離開", "使我轉身；改變我"]}, {"answer": "single blow", "number": 12, "prompt": "With just one {{blank}}", "options": ["single blow", "sudden fall", "little show"], "promptZh": "甚至只消一下，就足以讓我倒下", "optionsZh": ["一次打擊", "突然跌倒；突然下降", "小表演；小把戲"]}, {"answer": "don't know what you don't know", "number": 13, "prompt": "But you {{blank}}", "options": ["don't know what you don't know", "don't see what you can't show", "don't care what you don't own"], "promptZh": "可你不知道的事，遠比你以為的更多", "optionsZh": ["不知道自己不知道甚麼", "看不到你無法展示的東西", "不在乎你沒有的東西"]}, {"answer": "big old city", "number": 14, "prompt": "Someday, I'll be living in a {{blank}}", "options": ["bright new city", "small old town", "big old city"], "promptZh": "總有一天，我會在那座繁華的大城市裡生活", "optionsZh": ["明亮的新城市", "一座古老的小鎮", "一座大城市"]}, {"answer": "mean", "number": 15, "prompt": "And all you're ever gonna be is {{blank}}", "options": ["mean", "weak", "mad"], "promptZh": "而你到頭來，也只會是個刻薄的人", "optionsZh": ["刻薄的", "軟弱的", "憤怒的；瘋狂的"]}, {"answer": "big enough", "number": 16, "prompt": "Someday, I'll be {{blank}} so you can't hit me", "options": ["strong enough", "big enough", "old enough"], "promptZh": "總有一天，我會強大得讓你再也傷不了我", "optionsZh": ["足夠強大", "足夠大；足夠強大", "年紀足夠大"]}, {"answer": "switching sides", "number": 17, "prompt": "You, with your {{blank}}", "options": ["changing minds", "shifting lines", "switching sides"], "promptZh": "你啊，總是反覆無常，說變就變", "optionsZh": ["改變想法", "移動的界線", "轉換立場"]}, {"answer": "wildfire lies", "number": 18, "prompt": "And your {{blank}} and your humiliation", "options": ["whispered cries", "dangerous signs", "wildfire lies"], "promptZh": "你的謊言如野火蔓延，還有那無休止的羞辱", "optionsZh": ["低聲的呼喊", "危險的徵兆", "像野火般蔓延的謊言"]}, {"answer": "humiliation", "number": 19, "prompt": "And your wildfire lies and your {{blank}}", "options": ["humiliation", "hesitation", "imagination"], "promptZh": "你的謊言如野火蔓延，還有那無休止的羞辱", "optionsZh": ["羞辱", "猶豫", "想像力"]}, {"answer": "pointed out", "number": 20, "prompt": "You have {{blank}} my flaws again", "options": ["called up", "figured out", "pointed out"], "promptZh": "你又一次把我的缺點逐一挑出來", "optionsZh": ["打電話給；召集", "弄清楚；明白", "指出"]}, {"answer": "flaws", "number": 21, "prompt": "You have pointed out my {{blank}} again", "options": ["fears", "flaws", "faults"], "promptZh": "你又一次把我的缺點逐一挑出來", "optionsZh": ["恐懼", "缺點；瑕疵", "缺點；過錯"]}, {"answer": "As if I don't already", "number": 22, "prompt": "{{blank}} see them", "options": ["As though I never really", "As if I don't already", "Even if I could already"], "promptZh": "彷彿我自己從來沒有看見", "optionsZh": ["彷彿我從未真正……", "好像我還未……似的", "即使我已經能夠……"]}, {"answer": "head down", "number": 23, "prompt": "I walk with my {{blank}}, trying to block you out", "options": ["hands down", "head down", "eyes closed"], "promptZh": "我低著頭走，只想把你的聲音隔絕在外", "optionsZh": ["毫無疑問地；雙手放下", "低著頭", "閉上眼睛"]}, {"answer": "trying to", "number": 24, "prompt": "I walk with my head down, {{blank}} block you out", "options": ["wanting to", "trying to", "starting to"], "promptZh": "我低著頭走，只想把你的聲音隔絕在外", "optionsZh": ["想要……", "嘗試；努力……", "開始……"]}, {"answer": "block you out", "number": 25, "prompt": "I walk with my head down, trying to {{blank}}", "options": ["shut you down", "block you out", "tune you out"], "promptZh": "我低著頭走，只想把你的聲音隔絕在外", "optionsZh": ["制止你；令你閉嘴", "把你拒諸門外；不再理會你", "不再聽你說話"]}, {"answer": "impress you", "number": 26, "prompt": "'Cause I'll never {{blank}}", "options": ["impress you", "upset you", "forgive you"], "promptZh": "因為無論我怎麼做，都不可能令你滿意", "optionsZh": ["令你留下深刻印象", "令你不快", "原諒你"]}, {"answer": "feel okay again", "number": 27, "prompt": "I just wanna {{blank}}", "options": ["feel alive again", "feel okay again", "get away again"], "promptZh": "我只是想，再一次好好地活著，好好地做自己", "optionsZh": ["再次感到充滿活力", "再次感覺好起來", "再次逃離"]}, {"answer": "pushed around", "number": 28, "prompt": "I bet you got {{blank}}", "options": ["moved around", "turned around", "pushed around"], "promptZh": "我想，你大概也曾受人欺負", "optionsZh": ["四處移動", "轉身；轉變", "被欺負；被使喚"]}, {"answer": "Somebody made you cold", "number": 29, "prompt": "{{blank}}", "options": ["Someone made you strong", "Everybody left you alone", "Somebody made you cold"], "promptZh": "曾有人把你的心變得如此冷漠", "optionsZh": ["有人令你變得堅強", "所有人都離開了你", "有人令你變得冷漠"]}, {"answer": "cycle ends", "number": 30, "prompt": "But the {{blank}} right now", "options": ["cycle ends", "fight starts", "story ends"], "promptZh": "可這個惡性循環，就到我這裡為止", "optionsZh": ["惡性循環結束", "爭鬥開始", "故事結束"]}, {"answer": "lead me down that road", "number": 31, "prompt": "'Cause you can't {{blank}}", "options": ["lead me down that road", "take me back to home", "drag me into that room"], "promptZh": "因為我不會讓你把我拖上同一條路", "optionsZh": ["帶我走上那條路", "帶我回家", "把我拖進那個房間"]}, {"answer": "years from now", "number": 32, "prompt": "And I can see you {{blank}} in a bar", "options": ["miles from here", "years from now", "days from now"], "promptZh": "我甚至看得見，多年後的你坐在酒吧裡", "optionsZh": ["離這裡幾英里遠", "多年之後", "幾天之後"]}, {"answer": "football game", "number": 33, "prompt": "Talking over a {{blank}}", "options": ["football game", "basketball match", "baseball field"], "promptZh": "對著一場足球賽喋喋不休", "optionsZh": ["足球比賽", "籃球比賽", "棒球場"]}, {"answer": "big loud opinion", "number": 34, "prompt": "With that same {{blank}}", "options": ["bold new ambition", "bad old decision", "big loud opinion"], "promptZh": "還是那副自以為是、高聲叫嚷的模樣", "optionsZh": ["大膽的新抱負", "以前糟糕的決定", "大聲又強烈的意見"]}, {"answer": "nobody's listening", "number": 35, "prompt": "But {{blank}}", "options": ["someone's waiting", "nobody's listening", "everybody's laughing"], "promptZh": "可再也沒有人願意聽你說話", "optionsZh": ["有人正在等待", "沒有人在聽", "每個人都在笑"]}, {"answer": "Washed up", "number": 36, "prompt": "{{blank}} and ranting about the same old bitter things", "options": ["Worn out", "Fed up", "Washed up"], "promptZh": "風光不再，卻還在咆哮著那些陳年苦怨", "optionsZh": ["筋疲力盡的", "厭倦的；受夠了", "過氣的；江郎才盡的"]}, {"answer": "bitter things", "number": 37, "prompt": "Washed up and ranting about the same old {{blank}}", "options": ["little things", "bitter things", "better days"], "promptZh": "風光不再，卻還在咆哮著那些陳年苦怨", "optionsZh": ["小事", "令人痛苦的事；尖酸的話", "更好的日子"]}, {"answer": "grumbling", "number": 38, "prompt": "Drunk and {{blank}} on about how I can't sing", "options": ["whispering", "mumbling", "grumbling"], "promptZh": "醉醺醺地嘟囔著，說我根本不會唱歌", "optionsZh": ["低聲說話", "含糊地低聲說話", "抱怨；發牢騷"]}, {"answer": "can't sing", "number": 39, "prompt": "Drunk and grumbling on about how I {{blank}}", "options": ["won't win", "can't sing", "can't speak"], "promptZh": "醉醺醺地嘟囔著，說我根本不會唱歌", "optionsZh": ["不會勝出", "不會唱歌", "不能說話"]}, {"answer": "alone in life", "number": 40, "prompt": "And a liar, and pathetic, and {{blank}}", "options": ["alone in life", "out of time", "lost in love"], "promptZh": "還是個說謊的人，可悲的人，一生孤獨的人", "optionsZh": ["在人生中孤單一人", "沒有時間了", "迷失在愛情中"]}], "questionCount": 40}, {"id": "hell", "label": "地獄模式", "title": "地獄模式", "version": 1, "questions": [{"answer": "knives", "number": 1, "prompt": "You, with your words like {{blank}}", "options": ["nights", "lives", "knives"], "promptZh": "你啊，說出的每一句話，都像刀鋒一樣傷人", "optionsZh": ["夜晚", "生命；生活", "刀子"]}, {"answer": "swords", "number": 2, "prompt": "And {{blank}} and weapons that you use against me", "options": ["songs", "swords", "storms"], "promptZh": "像利劍，像武器，一次又一次向我刺來", "optionsZh": ["歌曲", "劍", "暴風雨"]}, {"answer": "weapons", "number": 3, "prompt": "And swords and {{blank}} that you use against me", "options": ["songs", "shields", "weapons"], "promptZh": "像利劍，像武器，一次又一次向我刺來", "optionsZh": ["歌曲", "盾牌", "武器"]}, {"answer": "use against me", "number": 4, "prompt": "And swords and weapons that you {{blank}}", "options": ["use against me", "throw around me", "bring beside me"], "promptZh": "像利劍，像武器，一次又一次向我刺來", "optionsZh": ["用來對付我", "扔到我周圍", "帶到我身旁"]}, {"answer": "knocked me off my feet", "number": 5, "prompt": "You have {{blank}} again", "options": ["bullied me over and over", "walked me off the line", "knocked me off my feet"], "promptZh": "你又一次把我擊倒", "optionsZh": ["一次又一次欺凌我", "帶我離開那條線", "把我擊倒"]}, {"answer": "feeling like", "number": 6, "prompt": "Got me {{blank}} I'm nothing", "options": ["looking like", "feeling like", "acting like"], "promptZh": "讓我覺得自己一無是處", "optionsZh": ["看起來像", "感覺像；想要", "表現得像"]}, {"answer": "nothing", "number": 7, "prompt": "Got me feeling like I'm {{blank}}", "options": ["losing", "famous", "nothing"], "promptZh": "讓我覺得自己一無是處", "optionsZh": ["失去；落敗", "有名的", "甚麼也沒有"]}, {"answer": "chalkboard", "number": 8, "prompt": "You, with your voice like nails on a {{blank}}", "options": ["chalkboard", "fingers", "notebook"], "promptZh": "你啊，那刺耳的聲音，就像指甲劃過黑板", "optionsZh": ["黑板", "手指", "筆記簿"]}, {"answer": "Calling me out", "number": 9, "prompt": "{{blank}} when I'm wounded", "options": ["Calling me back", "Cutting me down", "Calling me out"], "promptZh": "趁我受傷時，還要揪著我不放", "optionsZh": ["叫我回去；給我回電", "貶低我", "公開指責我"]}, {"answer": "wounded", "number": 10, "prompt": "Calling me out when I'm {{blank}}", "options": ["wounded", "tired", "upset"], "promptZh": "趁我受傷時，還要揪著我不放", "optionsZh": ["受傷的", "疲倦的", "難過的；心煩的"]}, {"answer": "picking on", "number": 11, "prompt": "You, {{blank}} the weaker man", "options": ["talking to", "picking on", "looking at"], "promptZh": "你總愛欺負比自己弱小的人", "optionsZh": ["對……說話", "挑剔；欺負", "看著"]}, {"answer": "weaker man", "number": 12, "prompt": "You, picking on the {{blank}}", "options": ["weaker man", "weaker hand", "fingernail"], "promptZh": "你總愛欺負比自己弱小的人", "optionsZh": ["較軟弱的人", "較弱的一手；較不利的條件", "指甲"]}, {"answer": "take me down", "number": 13, "prompt": "Well, you can {{blank}}", "options": ["turn me round", "take me down", "let me go"], "promptZh": "是啊，你或許能把我擊倒", "optionsZh": ["使我轉身；改變我", "把我擊倒；打垮我", "讓我離開"]}, {"answer": "single blow", "number": 14, "prompt": "With just one {{blank}}", "options": ["single blow", "little show", "sudden fall"], "promptZh": "甚至只消一下，就足以讓我倒下", "optionsZh": ["一次打擊", "小表演；小把戲", "突然跌倒；突然下降"]}, {"answer": "don't know what you don't know", "number": 15, "prompt": "But you {{blank}}", "options": ["don't see what you can't show", "don't know what you don't know", "don't care what you don't own"], "promptZh": "可你不知道的事，遠比你以為的更多", "optionsZh": ["看不到你無法展示的東西", "不知道自己不知道甚麼", "不在乎你沒有的東西"]}, {"answer": "Someday", "number": 16, "prompt": "{{blank}}, I'll be living in a big old city", "options": ["Somehow", "Someday", "Sometimes"], "promptZh": "總有一天，我會在那座繁華的大城市裡生活", "optionsZh": ["不知怎的；以某種方式", "總有一天", "有時候"]}, {"answer": "big old city", "number": 17, "prompt": "Someday, I'll be living in a {{blank}}", "options": ["big old city", "bright new city", "small old town"], "promptZh": "總有一天，我會在那座繁華的大城市裡生活", "optionsZh": ["一座大城市", "明亮的新城市", "一座古老的小鎮"]}, {"answer": "mean", "number": 18, "prompt": "And all you're ever gonna be is {{blank}}", "options": ["mean", "mad", "weak"], "promptZh": "而你到頭來，也只會是個刻薄的人", "optionsZh": ["刻薄的", "憤怒的；瘋狂的", "軟弱的"]}, {"answer": "big enough", "number": 19, "prompt": "Someday, I'll be {{blank}} so you can't hit me", "options": ["old enough", "big enough", "strong enough"], "promptZh": "總有一天，我會強大得讓你再也傷不了我", "optionsZh": ["年紀足夠大", "足夠大；足夠強大", "足夠強大"]}, {"answer": "switching sides", "number": 20, "prompt": "You, with your {{blank}}", "options": ["switching sides", "changing minds", "shifting lines"], "promptZh": "你啊，總是反覆無常，說變就變", "optionsZh": ["轉換立場", "改變想法", "移動的界線"]}, {"answer": "wildfire lies", "number": 21, "prompt": "And your {{blank}} and your humiliation", "options": ["whispered cries", "wildfire lies", "dangerous signs"], "promptZh": "你的謊言如野火蔓延，還有那無休止的羞辱", "optionsZh": ["低聲的呼喊", "像野火般蔓延的謊言", "危險的徵兆"]}, {"answer": "humiliation", "number": 22, "prompt": "And your wildfire lies and your {{blank}}", "options": ["imagination", "hesitation", "humiliation"], "promptZh": "你的謊言如野火蔓延，還有那無休止的羞辱", "optionsZh": ["想像力", "猶豫", "羞辱"]}, {"answer": "pointed out", "number": 23, "prompt": "You have {{blank}} my flaws again", "options": ["called up", "figured out", "pointed out"], "promptZh": "你又一次把我的缺點逐一挑出來", "optionsZh": ["打電話給；召集", "弄清楚；明白", "指出"]}, {"answer": "flaws", "number": 24, "prompt": "You have pointed out my {{blank}} again", "options": ["faults", "fears", "flaws"], "promptZh": "你又一次把我的缺點逐一挑出來", "optionsZh": ["缺點；過錯", "恐懼", "缺點；瑕疵"]}, {"answer": "As if I don't already", "number": 25, "prompt": "{{blank}} see them", "options": ["As if I don't already", "Even if I could already", "As though I never really"], "promptZh": "彷彿我自己從來沒有看見", "optionsZh": ["好像我還未……似的", "即使我已經能夠……", "彷彿我從未真正……"]}, {"answer": "head down", "number": 26, "prompt": "I walk with my {{blank}}, trying to block you out", "options": ["eyes closed", "hands down", "head down"], "promptZh": "我低著頭走，只想把你的聲音隔絕在外", "optionsZh": ["閉上眼睛", "毫無疑問地；雙手放下", "低著頭"]}, {"answer": "trying to", "number": 27, "prompt": "I walk with my head down, {{blank}} block you out", "options": ["trying to", "starting to", "wanting to"], "promptZh": "我低著頭走，只想把你的聲音隔絕在外", "optionsZh": ["嘗試；努力……", "開始……", "想要……"]}, {"answer": "block you out", "number": 28, "prompt": "I walk with my head down, trying to {{blank}}", "options": ["block you out", "shut you down", "tune you out"], "promptZh": "我低著頭走，只想把你的聲音隔絕在外", "optionsZh": ["把你拒諸門外；不再理會你", "制止你；令你閉嘴", "不再聽你說話"]}, {"answer": "impress you", "number": 29, "prompt": "'Cause I'll never {{blank}}", "options": ["upset you", "forgive you", "impress you"], "promptZh": "因為無論我怎麼做，都不可能令你滿意", "optionsZh": ["令你不快", "原諒你", "令你留下深刻印象"]}, {"answer": "feel okay again", "number": 30, "prompt": "I just wanna {{blank}}", "options": ["get away again", "feel alive again", "feel okay again"], "promptZh": "我只是想，再一次好好地活著，好好地做自己", "optionsZh": ["再次逃離", "再次感到充滿活力", "再次感覺好起來"]}, {"answer": "pushed around", "number": 31, "prompt": "I bet you got {{blank}}", "options": ["turned around", "moved around", "pushed around"], "promptZh": "我想，你大概也曾受人欺負", "optionsZh": ["轉身；轉變", "四處移動", "被欺負；被使喚"]}, {"answer": "Somebody made you cold", "number": 32, "prompt": "{{blank}}", "options": ["Someone made you strong", "Somebody made you cold", "Everybody left you alone"], "promptZh": "曾有人把你的心變得如此冷漠", "optionsZh": ["有人令你變得堅強", "有人令你變得冷漠", "所有人都離開了你"]}, {"answer": "cycle ends", "number": 33, "prompt": "But the {{blank}} right now", "options": ["fight starts", "story ends", "cycle ends"], "promptZh": "可這個惡性循環，就到我這裡為止", "optionsZh": ["爭鬥開始", "故事結束", "惡性循環結束"]}, {"answer": "right now", "number": 34, "prompt": "But the cycle ends {{blank}}", "options": ["tonight", "right now", "somehow"], "promptZh": "可這個惡性循環，就到我這裡為止", "optionsZh": ["今晚", "現在；此刻", "不知怎的；以某種方式"]}, {"answer": "lead me down that road", "number": 35, "prompt": "'Cause you can't {{blank}}", "options": ["drag me into that room", "lead me down that road", "take me back to home"], "promptZh": "因為我不會讓你把我拖上同一條路", "optionsZh": ["把我拖進那個房間", "帶我走上那條路", "帶我回家"]}, {"answer": "years from now", "number": 36, "prompt": "And I can see you {{blank}} in a bar", "options": ["miles from here", "days from now", "years from now"], "promptZh": "我甚至看得見，多年後的你坐在酒吧裡", "optionsZh": ["離這裡幾英里遠", "幾天之後", "多年之後"]}, {"answer": "Talking over", "number": 37, "prompt": "{{blank}} a football game", "options": ["Talking over", "Shouting during", "Laughing through"], "promptZh": "對著一場足球賽喋喋不休", "optionsZh": ["蓋過別人的聲音說話", "在……期間大叫", "在……期間笑著"]}, {"answer": "football game", "number": 38, "prompt": "Talking over a {{blank}}", "options": ["basketball match", "baseball field", "football game"], "promptZh": "對著一場足球賽喋喋不休", "optionsZh": ["籃球比賽", "棒球場", "足球比賽"]}, {"answer": "big loud opinion", "number": 39, "prompt": "With that same {{blank}}", "options": ["bold new ambition", "bad old decision", "big loud opinion"], "promptZh": "還是那副自以為是、高聲叫嚷的模樣", "optionsZh": ["大膽的新抱負", "以前糟糕的決定", "大聲又強烈的意見"]}, {"answer": "nobody's listening", "number": 40, "prompt": "But {{blank}}", "options": ["nobody's listening", "someone's waiting", "everybody's laughing"], "promptZh": "可再也沒有人願意聽你說話", "optionsZh": ["沒有人在聽", "有人正在等待", "每個人都在笑"]}, {"answer": "Washed up", "number": 41, "prompt": "{{blank}} and ranting about the same old bitter things", "options": ["Worn out", "Washed up", "Fed up"], "promptZh": "風光不再，卻還在咆哮著那些陳年苦怨", "optionsZh": ["筋疲力盡的", "過氣的；江郎才盡的", "厭倦的；受夠了"]}, {"answer": "ranting about", "number": 42, "prompt": "Washed up and {{blank}} the same old bitter things", "options": ["ranting about", "talking about", "arguing over"], "promptZh": "風光不再，卻還在咆哮著那些陳年苦怨", "optionsZh": ["激動地抱怨……", "談論", "為……爭論"]}, {"answer": "bitter things", "number": 43, "prompt": "Washed up and ranting about the same old {{blank}}", "options": ["better days", "bitter things", "little things"], "promptZh": "風光不再，卻還在咆哮著那些陳年苦怨", "optionsZh": ["更好的日子", "令人痛苦的事；尖酸的話", "小事"]}, {"answer": "Drunk", "number": 44, "prompt": "{{blank}} and grumbling on about how I can't sing", "options": ["Tired", "Drunk", "Angry"], "promptZh": "醉醺醺地嘟囔著，說我根本不會唱歌", "optionsZh": ["疲倦的", "喝醉的", "憤怒的"]}, {"answer": "grumbling", "number": 45, "prompt": "Drunk and {{blank}} on about how I can't sing", "options": ["grumbling", "whispering", "mumbling"], "promptZh": "醉醺醺地嘟囔著，說我根本不會唱歌", "optionsZh": ["抱怨；發牢騷", "低聲說話", "含糊地低聲說話"]}, {"answer": "can't sing", "number": 46, "prompt": "Drunk and grumbling on about how I {{blank}}", "options": ["can't sing", "won't win", "can't speak"], "promptZh": "醉醺醺地嘟囔著，說我根本不會唱歌", "optionsZh": ["不會唱歌", "不會勝出", "不能說話"]}, {"answer": "all you are is mean", "number": 47, "prompt": "But {{blank}}", "options": ["all you want is fame", "all you are is mean", "all I know is pain"], "promptZh": "可說到底，你也不過是刻薄", "optionsZh": ["你想要的只有名氣", "你只是刻薄而已", "我所知道的只有痛苦"]}, {"answer": "alone in life", "number": 48, "prompt": "And a liar, and pathetic, and {{blank}}", "options": ["alone in life", "lost in love", "out of time"], "promptZh": "還是個說謊的人，可悲的人，一生孤獨的人", "optionsZh": ["在人生中孤單一人", "迷失在愛情中", "沒有時間了"]}, {"answer": "all you're ever gonna be", "number": 49, "prompt": "And {{blank}} is mean, yeah", "options": ["all you really want to see", "all you're ever gonna be", "everything you wanna be"], "promptZh": "而你到頭來，也只會是個刻薄的人，沒錯", "optionsZh": ["你真正想看到的一切", "你將來永遠只會成為的樣子", "你想成為的一切"]}, {"answer": "Why you gotta be so mean", "number": 50, "prompt": "{{blank}}?", "options": ["Why you always look at me", "Why you gotta be so mean", "Why you wanna make me leave"], "promptZh": "你為什麼非得這麼刻薄？", "optionsZh": ["為甚麼你總是看著我", "為甚麼你一定要這麼刻薄", "為甚麼你想令我離開"]}], "questionCount": 50}]$songdata$::jsonb where id='9bb4b1e0-3d4a-4e83-b572-074c10316a7f'::uuid;
