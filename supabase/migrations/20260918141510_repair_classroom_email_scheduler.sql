-- The Schedule Worker authenticates every RPC by adding p_service_secret.
-- The original classroom producer had no parameter and was also unavailable to
-- the anon PostgREST role, so its PGRST202 error aborted every scheduled run
-- before existing writing-submission jobs could be claimed.
begin;

create or replace function public.classroom_enqueue_notifications(p_service_secret text)
returns integer
language plpgsql
security definer
set search_path=''
as $$
begin
 if not public._schedule_worker_ok(p_service_secret) then return 0; end if;
 return public.classroom_enqueue_notifications();
end $$;

revoke all on function public.classroom_enqueue_notifications(text) from public,anon,authenticated,service_role;
grant execute on function public.classroom_enqueue_notifications(text) to anon,service_role;

notify pgrst,'reload schema';
commit;
