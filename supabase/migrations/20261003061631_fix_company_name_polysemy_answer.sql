-- The original company manual has a company-name section, but its final MCQ
-- comparison table omitted that row. Keep the legacy answer catalogue intact
-- and add the missing MCQ meaning for the two affected practice sentences.
do $$
declare
  current_mcq jsonb;
begin
  select mcq into current_mcq
  from polysemy_private.catalogue
  where module = 'company'
  for update;

  if current_mcq is null then
    raise exception 'Company MCQ catalogue is missing';
  end if;

  if current_mcq->'senses' ? 'company-mcq-28' then
    if current_mcq->'answers'->>'company-28-0' = '27'
      and current_mcq->'answers'->>'company-28-1' = '27'
      and current_mcq->'options'->'27' = '[27,24,26,23,25,21]'::jsonb then
      return;
    end if;
    raise exception 'Company-name MCQ catalogue has an unexpected existing definition';
  end if;

  if jsonb_array_length(current_mcq->'senses') <> 27
    or current_mcq->'senses'->>25 <> 'company-mcq-26'
    or current_mcq->'answers'->>'company-28-0' <> '25'
    or current_mcq->'answers'->>'company-28-1' <> '25' then
    raise exception 'Company MCQ catalogue differs from the reviewed source';
  end if;

  update polysemy_private.catalogue
  set mcq = jsonb_set(
    jsonb_set(
      jsonb_set(current_mcq, '{senses}', current_mcq->'senses' || '["company-mcq-28"]'::jsonb),
      '{answers}', current_mcq->'answers' || '{"company-28-0":27,"company-28-1":27}'::jsonb
    ),
    '{options,27}', '[27,24,26,23,25,21]'::jsonb,
    true
  )
  where module = 'company';
end $$;
