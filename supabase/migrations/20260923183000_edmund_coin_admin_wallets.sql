begin;
set local lock_timeout='5s';

create table eddie_farm.wallet_adjustment_audit (id bigint generated always as identity primary key,student_id uuid not null references public.flashcard_students(id) on delete cascade,admin_id uuid not null references eddie_farm.admin_accounts(id),previous_balance bigint not null,new_balance bigint not null,created_at timestamptz not null default now());
revoke all on eddie_farm.wallet_adjustment_audit from public,anon,authenticated,service_role;

create function eddie_farm.admin_search_wallets(p_token uuid,p_query text) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare v_admin uuid:=eddie_farm.admin_id(p_token); v_query text:=btrim(coalesce(p_query,''));
begin
  if length(v_query) not between 2 and 80 then raise exception 'Enter at least two characters.' using errcode='22023'; end if;
  return jsonb_build_object('students',coalesce((
    select jsonb_agg(jsonb_build_object('id',s.id,'name',s.name,'balance',coalesce(w.balance,0)) order by lower(s.name))
    from (select id,name from public.flashcard_students where deleted_at is null and name ilike '%'||replace(replace(replace(v_query,'\\','\\\\'),'%','\\%'),'_','\\_')||'%' order by lower(name),id limit 30) s
    left join eddie_farm.wallets w on w.student_id=s.id
  ),'[]'::jsonb));
end $$;

create function eddie_farm.admin_set_wallet(p_token uuid,p_student uuid,p_balance bigint) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_admin uuid:=eddie_farm.admin_id(p_token); v_student public.flashcard_students%rowtype; v_before bigint; v_after bigint;
begin
  if p_balance is null or p_balance<0 or p_balance>1000000000 then raise exception 'Enter a coin balance from 0 to 1,000,000,000.' using errcode='22023'; end if;
  select * into v_student from public.flashcard_students where id=p_student and deleted_at is null for update;
  if not found then raise exception 'Student account not found.' using errcode='22023'; end if;
  select balance into v_before from eddie_farm.wallets where student_id=p_student for update;
  v_before:=coalesce(v_before,0); v_after:=p_balance;
  insert into eddie_farm.wallets(student_id,balance) values(p_student,v_after)
    on conflict(student_id) do update set balance=excluded.balance;
  if v_after<>v_before then
    insert into eddie_farm.wallet_adjustment_audit(student_id,admin_id,previous_balance,new_balance) values(p_student,v_admin,v_before,v_after);
    insert into eddie_farm.ledger(student_id,kind,system_key,points) values(p_student,'admin_adjustment',null,v_after-v_before);
  end if;
  return jsonb_build_object('id',v_student.id,'name',v_student.name,'balance',v_after,'previous_balance',v_before,'changed_by',v_admin);
end $$;

create function public.eddie_farm_admin_search_wallets(p_token uuid,p_query text) returns jsonb language sql security invoker set search_path='' as $$ select eddie_farm.admin_search_wallets(p_token,p_query) $$;
create function public.eddie_farm_admin_set_wallet(p_token uuid,p_student uuid,p_balance bigint) returns jsonb language sql security invoker set search_path='' as $$ select eddie_farm.admin_set_wallet(p_token,p_student,p_balance) $$;
revoke all on function eddie_farm.admin_search_wallets(uuid,text),eddie_farm.admin_set_wallet(uuid,uuid,bigint),public.eddie_farm_admin_search_wallets(uuid,text),public.eddie_farm_admin_set_wallet(uuid,uuid,bigint) from public,anon,authenticated,service_role;
grant execute on function eddie_farm.admin_search_wallets(uuid,text),eddie_farm.admin_set_wallet(uuid,uuid,bigint) to authenticated;
grant execute on function public.eddie_farm_admin_search_wallets(uuid,text),public.eddie_farm_admin_set_wallet(uuid,uuid,bigint) to authenticated;
notify pgrst,'reload schema';
commit;
