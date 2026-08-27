-- Run only with the project-owner SQL runner. ALL fixture changes roll back.
-- No real account/password is used. A random synthetic browser UID tests session binding.
begin;
do $$
declare
  account uuid; browser_uid uuid:=gen_random_uuid(); login jsonb; loaded jsonb; result jsonb;
  plan_list jsonb; settings jsonb; snapshot jsonb; token text; rev integer; denied boolean; row record;
begin
  for row in select c.oid,c.relname,c.relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='membership_private' and c.relkind='r' loop
    assert row.relrowsecurity, 'Private table missing RLS';
    assert not has_table_privilege('anon',row.oid,'SELECT,INSERT,UPDATE,DELETE'), 'Anon private table grant';
    assert not has_table_privilege('authenticated',row.oid,'SELECT,INSERT,UPDATE,DELETE'), 'Authenticated private table grant';
  end loop;
  assert has_table_privilege('anon','public.membership_catalog','SELECT');
  assert not has_table_privilege('anon','public.membership_catalog','INSERT,UPDATE,DELETE');
  assert not has_function_privilege('anon','public.membership_admin_login(text,text)','EXECUTE');
  assert not has_function_privilege('authenticated','membership_private.require_admin(text)','EXECUTE');

  select payload into snapshot from public.membership_catalog where id=1;
  insert into membership_private.admin_accounts(username,password_hash)
    values ('__membership_test_'||browser_uid, extensions.crypt('fixture-password-not-an-account',extensions.gen_salt('bf',12))) returning id into account;
  update membership_private.login_throttle set attempts=0,window_started_at=now() where id=1;
  perform set_config('request.jwt.claim.sub',browser_uid::text,true);
  execute 'set local role authenticated';
  login:=public.membership_admin_login('__membership_test_'||browser_uid,'fixture-password-not-an-account');
  assert (login->>'ok')::boolean, 'Normal login failed';
  token:=login->>'token';
  assert length(token)=64;
  loaded:=public.membership_admin_load(token);
  assert not (loaded->>'sales_enabled')::boolean;
  rev:=(loaded->>'revision')::integer;
  plan_list:=loaded->'plans'; settings:=loaded->'settings';

  -- A copied token cannot be used from another browser auth identity.
  perform set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
  denied:=false;
  begin perform public.membership_admin_load(token); exception when insufficient_privilege then denied:=true; end;
  assert denied, 'Cross-identity token accepted';
  perform set_config('request.jwt.claim.sub',browser_uid::text,true);
  denied:=false;
  begin perform public.membership_admin_load(repeat('0',64)); exception when insufficient_privilege then denied:=true; end;
  assert denied, 'Unknown token accepted';

  -- Direct reads/writes fail even after the additional admin password check.
  denied:=false;
  begin perform count(*) from membership_private.admin_accounts; exception when insufficient_privilege then denied:=true; end;
  assert denied, 'Browser can read password table';
  denied:=false;
  begin update public.membership_catalog set payload='{}' where id=1; exception when insufficient_privilege then denied:=true; end;
  assert denied, 'Browser can update public snapshot directly';

  plan_list:=jsonb_set(plan_list,'{0,title}','"Private fixture draft"');
  result:=public.membership_admin_save(token,settings,plan_list,rev,false);
  assert (result->>'revision')::integer=rev+1;
  assert (select payload=snapshot from public.membership_catalog where id=1), 'Draft leaked to public';
  denied:=false;
  begin perform public.membership_admin_save(token,settings,plan_list,rev,false); exception when serialization_failure then denied:=true; end;
  assert denied, 'Stale revision overwrote configuration';
  rev:=rev+1;

  -- Only published public fields become visible. Stripe IDs remain private.
  plan_list:=jsonb_set(plan_list,'{0,amount_minor}','100');
  plan_list:=jsonb_set(plan_list,'{0,visible}','true');
  plan_list:=jsonb_set(plan_list,'{0,benefits}','["Fixture benefit"]');
  plan_list:=jsonb_set(plan_list,'{0,system_ids}','["grammar"]');
  plan_list:=jsonb_set(plan_list,'{0,stripe_live_price_id}','"price_privateFixture"');
  result:=public.membership_admin_save(token,settings,plan_list,rev,true);
  select payload into snapshot from public.membership_catalog where id=1;
  assert snapshot->'plans'->0->>'title'='Private fixture draft';
  assert not (snapshot->>'sales_enabled')::boolean, 'Publishing enabled payment';
  assert snapshot::text not like '%price_privateFixture%', 'Stripe configuration leaked';
  rev:=rev+1;
  denied:=false;
  begin perform public.membership_admin_save(token,settings,'[]',rev,false); exception when raise_exception then denied:=true; end;
  assert denied, 'Empty plans accepted';
  denied:=false;
  begin perform public.membership_admin_save(token,jsonb_set(settings,'{company_name}','"sk_test_fixture"'),plan_list,rev,false);
    exception when raise_exception then denied:=true; end;
  assert denied, 'Secret-looking configuration accepted';
  perform public.membership_admin_logout(token);
  denied:=false;
  begin perform public.membership_admin_load(token); exception when insufficient_privilege then denied:=true; end;
  assert denied, 'Logout failed to revoke token';

  -- Test expiry and credential revocation without keeping a real session.
  login:=public.membership_admin_login('__membership_test_'||browser_uid,'fixture-password-not-an-account'); token:=login->>'token';
  execute 'reset role';
  update membership_private.admin_sessions set expires_at=now()-interval '1 minute' where admin_id=account;
  execute 'set local role authenticated';
  denied:=false;
  begin perform public.membership_admin_load(token); exception when insufficient_privilege then denied:=true; end;
  assert denied, 'Expired token accepted';
  login:=public.membership_admin_login('__membership_test_'||browser_uid,'fixture-password-not-an-account'); token:=login->>'token';
  execute 'reset role';
  update membership_private.admin_accounts set active=false where id=account;
  assert not exists(select 1 from membership_private.admin_sessions where admin_id=account), 'Credential changes retained sessions';
  update membership_private.admin_accounts set active=true where id=account;
  execute 'set local role authenticated';
  for i in 1..5 loop
    result:=public.membership_admin_login('__membership_test_'||browser_uid,'incorrect-fixture');
    assert result->>'reason'='invalid_credentials';
  end loop;
  result:=public.membership_admin_login('__membership_test_'||browser_uid,'fixture-password-not-an-account');
  assert result->>'reason'='rate_limited', 'Throttle did not apply';
  execute 'reset role';
end $$;
rollback;
select 'Membership security regression passed; all fixture data rolled back.' as result;
