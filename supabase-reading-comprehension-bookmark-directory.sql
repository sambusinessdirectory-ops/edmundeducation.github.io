-- Give Reading Comprehension analysis bookmarks their own label in the
-- student-wide bookmark directory. Apply after
-- supabase-unified-bookmark-directory-20260821.sql and
-- supabase-reading-comprehension.sql.
begin;

do $$
begin
  if pg_catalog.to_regprocedure('public._student_unified_bookmark_directory_base_20260825(uuid)') is null then
    if pg_catalog.to_regprocedure('public.student_unified_bookmark_directory(uuid)') is null then
      raise exception 'Apply supabase-unified-bookmark-directory-20260821.sql first';
    end if;
    alter function public.student_unified_bookmark_directory(uuid)
      rename to _student_unified_bookmark_directory_base_20260825;
  end if;
end;
$$;

create or replace function public.student_unified_bookmark_directory(p_student_token uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with base as (
    select public._student_unified_bookmark_directory_base_20260825(p_student_token) as payload
  ), relabelled as (
    select coalesce(pg_catalog.jsonb_agg(
      case when item ->> 'systemKey' = 'reading-comprehension'
        then pg_catalog.jsonb_set(item, '{systemLabel}', pg_catalog.to_jsonb('閱讀理解 Reading Comprehension'::text), true)
        else item
      end
      order by ordinal
    ), '[]'::jsonb) as items
    from base
    cross join lateral pg_catalog.jsonb_array_elements(base.payload -> 'items') with ordinality entry(item, ordinal)
  )
  select pg_catalog.jsonb_set(base.payload, '{items}', relabelled.items, true)
  from base cross join relabelled;
$$;

revoke all on function public._student_unified_bookmark_directory_base_20260825(uuid)
  from public, anon, authenticated;
revoke all on function public.student_unified_bookmark_directory(uuid)
  from public, anon, authenticated;
grant execute on function public.student_unified_bookmark_directory(uuid)
  to authenticated;

notify pgrst, 'reload schema';
commit;
