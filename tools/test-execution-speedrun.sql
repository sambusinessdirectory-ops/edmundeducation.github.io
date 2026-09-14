-- Run against the migrated database. All fixtures and changes are rolled back.
begin;
do $$
declare
  a uuid := extensions.gen_random_uuid(); b uuid := extensions.gen_random_uuid();
  ta uuid := extensions.gen_random_uuid(); tb uuid := extensions.gen_random_uuid();
  m uuid := extensions.gen_random_uuid(); r uuid := extensions.gen_random_uuid();
  r2 uuid := extensions.gen_random_uuid(); r3 uuid := extensions.gen_random_uuid(); e uuid := extensions.gen_random_uuid();
  at timestamptz := now() - interval '1 hour'; result jsonb; shape jsonb;
begin
  perform set_config('request.jwt.claim.sub',extensions.gen_random_uuid()::text,true);
  insert into public.execution_system_admin_accounts(id,name,password_hash) values
    (a,'speedrun-qa-'||a::text,extensions.crypt(extensions.gen_random_uuid()::text,extensions.gen_salt('bf',12))),(b,'speedrun-qa-'||b::text,extensions.crypt(extensions.gen_random_uuid()::text,extensions.gen_salt('bf',12)));
  insert into public.execution_system_admin_sessions(token_hash,admin_id,expires_at) values
    (extensions.digest(ta::text,'sha256'),a,now()+interval '1 hour'),(extensions.digest(tb::text,'sha256'),b,now()+interval '1 hour');
  shape := '[{"id":"s1","title":"Reading","items":[{"id":"i1","title":"Read","expected_ms":1000},{"id":"i2","title":"Answer","expected_ms":2000}]},{"id":"s2","title":"Review","items":[{"id":"i3","title":"Check","expected_ms":1000}]}]'::jsonb;
  result := public.execution_speedrun_meter_save(m,'QA meter',shape,0,null,ta);
  assert result->>'version' = '1';
  result := public.execution_speedrun_start(r,m,1,at,null,ta);
  assert result->>'status' = 'running';
  begin
    perform public.execution_speedrun_start(r2,m,1,at,null,ta);
    raise exception 'Duplicate active run accepted';
  exception when serialization_failure then null; end;
  result := public.execution_speedrun_event(e,r,'split',0,800,at+interval '1 sec',null,ta);
  result := public.execution_speedrun_event(e,r,'split',0,800,at+interval '1 sec',null,ta);
  assert jsonb_array_length(result->'splits') = 1, 'Duplicate retry appended another split';
  begin
    perform public.execution_speedrun_event(extensions.gen_random_uuid(),r,'split',0,900,at+interval '2 sec',null,ta);
    raise exception 'Stale revision accepted';
  exception when serialization_failure then null; end;
  perform public.execution_speedrun_event(extensions.gen_random_uuid(),r,'pause',1,1800,at+interval '2 sec',null,ta);
  perform public.execution_speedrun_event(extensions.gen_random_uuid(),r,'resume',2,1800,at+interval '2 minutes',null,ta);
  perform public.execution_speedrun_event(extensions.gen_random_uuid(),r,'split',3,2500,at+interval '121 sec',null,ta);
  result := public.execution_speedrun_event(extensions.gen_random_uuid(),r,'split',4,3000,at+interval '122 sec',null,ta);
  assert result->>'status' = 'completed';
  assert result->'splits'->1->>'elapsed_ms' = '1700';
  assert result->>'elapsed_ms' = '3000', 'Paused time was included';
  perform public.execution_speedrun_start(r2,m,1,at+interval '3 minutes',null,ta);
  perform public.execution_speedrun_event(extensions.gen_random_uuid(),r2,'split',0,2000,at+interval '181 sec',null,ta);
  perform public.execution_speedrun_event(extensions.gen_random_uuid(),r2,'split',1,4000,at+interval '183 sec',null,ta);
  perform public.execution_speedrun_event(extensions.gen_random_uuid(),r2,'split',2,6000,at+interval '185 sec',null,ta);
  perform public.execution_speedrun_start(r3,m,1,at+interval '4 minutes',null,ta);
  perform public.execution_speedrun_event(extensions.gen_random_uuid(),r3,'split',0,400,at+interval '241 sec',null,ta);
  result := public.execution_speedrun_event(extensions.gen_random_uuid(),r3,'end',1,700,at+interval '242 sec',null,ta);
  assert result->>'elapsed_ms' = '700' and jsonb_array_length(result->'splits') = 1;
  result := public.execution_speedrun_load(m,0,null,ta);
  assert result->'stats'->>'fastest' = '3000';
  assert result->'stats'->>'slowest' = '6000';
  assert result->'stats'->>'average' = '4500';
  assert result->'stats'->>'completed' = '2';
  assert result->'stats'->'best_segments' = '[400,1700,500]'::jsonb;
  assert result->>'history_count' = '3';
  result := public.execution_speedrun_load(m,0,null,tb);
  assert result->'meters' = '[]'::jsonb and result->'history' = '[]'::jsonb, 'Cross-account read';
  begin
    perform public.execution_speedrun_meter_save(m,'intrusion',shape,1,null,tb);
    raise exception 'Cross-account write accepted';
  exception when insufficient_privilege then null; end;
  shape := jsonb_set(shape,'{0,items,0,expected_ms}','5000'::jsonb);
  result := public.execution_speedrun_meter_save(m,'Changed plan',shape,1,null,ta);
  assert result->>'version' = '2';
  result := public.execution_speedrun_load(m,0,null,ta);
  assert result->'stats'->>'completed' = '0' and result->>'history_count' = '3', 'Versions mixed or history lost';
  assert not has_table_privilege('authenticated','public.execution_speedrun_runs','SELECT');
  assert not has_function_privilege('anon','public.execution_speedrun_load(uuid,integer,uuid,uuid)','EXECUTE');
  perform set_config('request.jwt.claim.sub','',true);
  begin
    perform public.execution_speedrun_load(m,0,null,ta);
    raise exception 'Unauthenticated access accepted';
  exception when insufficient_privilege then null; end;
end $$;
rollback;
