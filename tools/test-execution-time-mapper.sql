-- Isolated owner sessions and data: this entire test is rolled back.
begin;
do $$
declare
 a uuid:=extensions.gen_random_uuid(); b uuid:=extensions.gen_random_uuid();
 ta uuid:=extensions.gen_random_uuid(); tb uuid:=extensions.gen_random_uuid();
 m uuid:=extensions.gen_random_uuid(); r uuid:=extensions.gen_random_uuid(); bad uuid:=extensions.gen_random_uuid();
 at timestamptz:=now()-interval '1 hour'; shape jsonb; times jsonb; result jsonb;
begin
 perform set_config('request.jwt.claim.sub',extensions.gen_random_uuid()::text,true);
 insert into public.execution_system_admin_accounts(id,name,password_hash) values
 (a,'mapper-qa-'||a,extensions.crypt(a::text,extensions.gen_salt('bf',12))),(b,'mapper-qa-'||b,extensions.crypt(b::text,extensions.gen_salt('bf',12)));
 insert into public.execution_system_admin_sessions(token_hash,admin_id,expires_at) values
 (extensions.digest(ta::text,'sha256'),a,now()+interval '1 hour'),(extensions.digest(tb::text,'sha256'),b,now()+interval '1 hour');
 shape:='[{"id":"s1","title":"Reading","items":[{"id":"i1","title":"Read","expected_ms":2000},{"id":"i2","title":"Answer","expected_ms":1000}]},{"id":"s2","title":"Check","items":[],"expected_ms":1000}]';
 times:=jsonb_build_array(
 jsonb_build_object('elapsed_ms',1234,'started_at',at,'ended_at',at+interval '1234 milliseconds'),
 jsonb_build_object('elapsed_ms',900,'started_at',at+interval '2 minutes','ended_at',at+interval '121 seconds'),
 jsonb_build_object('elapsed_ms',0,'started_at',at+interval '3 minutes','ended_at',at+interval '3 minutes'));
 result:=public.execution_speedrun_mapper_save(m,r,'Mapped',shape,times,null,ta);
 assert result->>'id'=m::text;
 assert (select elapsed_ms=2134 and source='mapper' and status='completed' and jsonb_array_length(splits)=3 from public.execution_speedrun_runs where id=r),'Measured timing was altered';
 assert (select count(*)=4 from public.execution_speedrun_events where run_id=r);
 perform public.execution_speedrun_mapper_save(m,r,'Mapped',shape,times,null,ta);
 assert (select count(*)=1 from public.execution_speedrun_runs where id=r),'Retry created duplicate record';
 result:=public.execution_speedrun_load(m,0,null,ta);
 assert result->'stats'->>'fastest'='2134';
 assert result->'history'->0->>'source'='mapper';
 begin
  perform public.execution_speedrun_mapper_save(m,r,'Mapped',shape,times,null,tb);
  raise exception 'Cross-owner mapping accepted';
 exception when insufficient_privilege then null;end;
 begin
  perform public.execution_speedrun_mapper_save(bad,extensions.gen_random_uuid(),'Invalid',shape,times-2,null,ta);
  raise exception 'Missing split accepted';
 exception when others then if sqlerrm='Missing split accepted' then raise;end if;end;
 assert not exists(select 1 from public.execution_speedrun_meters where id=bad),'Invalid mapping left partial meter';
 begin
  perform public.execution_speedrun_mapper_save(bad,extensions.gen_random_uuid(),'Invalid',shape,jsonb_set(times,'{1,started_at}',to_jsonb(at)),null,ta);
  raise exception 'Overlapping time accepted';
 exception when others then if sqlerrm='Overlapping time accepted' then raise;end if;end;
 assert not exists(select 1 from public.execution_speedrun_meters where id=bad);
 perform public.execution_speedrun_delete(r,'run',3,null,ta);
 begin
  perform public.execution_speedrun_mapper_save(m,r,'Mapped',shape,times,null,ta);
  raise exception 'Deleted mapping replayed';
 exception when serialization_failure then null;end;
 assert not exists(select 1 from public.execution_speedrun_events where run_id=r);
end $$;
rollback;
