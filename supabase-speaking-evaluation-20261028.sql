begin;
alter table public.speaking_recording_attempts drop constraint speaking_recordings_performance_checklist_check;
alter table public.speaking_recording_attempts add constraint speaking_recordings_performance_checklist_check check (
 performance_checklist is null or (
 jsonb_typeof(performance_checklist)='object'
 and performance_checklist ?& array['version','content','language']
 and jsonb_typeof(performance_checklist->'content')='array'
 and jsonb_array_length(performance_checklist->'content')<=60
 and jsonb_typeof(performance_checklist->'language')='array'
 and jsonb_array_length(performance_checklist->'language')<=52
 and pg_column_size(performance_checklist)<=16384
 and ((performance_checklist->'version'='1'::jsonb and performance_checklist-'version'-'content'-'language'='{}'::jsonb)
 or (performance_checklist->'version'='2'::jsonb and performance_checklist ? 'mistakes'
 and performance_checklist-'version'-'content'-'language'-'mistakes'='{}'::jsonb
 and jsonb_typeof(performance_checklist->'mistakes')='array'
 and jsonb_array_length(performance_checklist->'mistakes')<=17))
 ));
commit;
