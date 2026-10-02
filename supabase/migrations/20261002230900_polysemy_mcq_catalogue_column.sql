-- Keep the original meaning and answer catalogue for students with older tabs open.
-- Revised MCQ data is stored alongside it and validated by the sync function.
alter table polysemy_private.catalogue add column if not exists mcq jsonb;
