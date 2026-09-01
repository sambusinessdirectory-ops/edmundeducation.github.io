create or replace function public._writing_submission_synonym_parts_valid(
  p_parts jsonb
)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_item jsonb;
  v_width jsonb;
  v_width_value numeric;
  v_width_total numeric;
  v_index integer := 0;
begin
  if p_parts is null or jsonb_typeof(p_parts) <> 'array' then
    return false;
  end if;
  if jsonb_array_length(p_parts) > 100
    or octet_length(p_parts::text) > 1048576
  then
    return false;
  end if;

  for v_item in select value from jsonb_array_elements(p_parts)
  loop
    v_index := v_index + 1;
    if jsonb_typeof(v_item) <> 'object' then
      return false;
    end if;
    if (select count(*) from jsonb_object_keys(v_item)) not in (3, 4)
      or exists (
        select 1
        from jsonb_object_keys(v_item) key_row(key_name)
        where key_name not in ('originalSentence', 'enhancement', 'benefit', 'columnWidths')
      )
      or not public._writing_submission_feedback_rich_text_value_valid(
        v_item -> 'originalSentence'
      )
      or not public._writing_submission_feedback_rich_text_value_valid(
        v_item -> 'enhancement'
      )
      or not public._writing_submission_feedback_rich_text_value_valid(
        v_item -> 'benefit'
      )
      or (
        char_length(btrim(coalesce(v_item #>> '{originalSentence,text}', ''))) = 0
        and char_length(btrim(coalesce(v_item #>> '{enhancement,text}', ''))) = 0
        and char_length(btrim(coalesce(v_item #>> '{benefit,text}', ''))) = 0
      )
    then
      return false;
    end if;

    if v_item ? 'columnWidths' then
      if v_index <> 1
        or jsonb_typeof(v_item -> 'columnWidths') <> 'array'
        or jsonb_array_length(v_item -> 'columnWidths') <> 3
      then
        return false;
      end if;
      v_width_total := 0;
      for v_width in select value from jsonb_array_elements(v_item -> 'columnWidths')
      loop
        if jsonb_typeof(v_width) <> 'number' then
          return false;
        end if;
        v_width_value := (v_width #>> '{}')::numeric;
        if v_width_value < 15 or v_width_value > 70 then
          return false;
        end if;
        v_width_total := v_width_total + v_width_value;
      end loop;
      if abs(v_width_total - 100) > 0.05 then
        return false;
      end if;
    end if;
  end loop;

  return true;
end;
$$;

alter table public.writing_submission_feedback
  drop constraint if exists writing_submission_feedback_synonym_parts_valid;
alter table public.writing_submission_feedback
  add constraint writing_submission_feedback_synonym_parts_valid check (
    public._writing_submission_synonym_parts_valid(synonym_improvement_parts)
  );
