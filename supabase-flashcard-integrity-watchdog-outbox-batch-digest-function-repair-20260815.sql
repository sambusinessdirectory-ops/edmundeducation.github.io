-- Minimal forward repair for exact-batch schema .3 special-expression qualification.
--
-- PostgreSQL LEAST/GREATEST are special SQL expressions, not pg_catalog routines.
-- The already-installed .3 function bodies therefore fail only when executed. This
-- migration validates the exact reviewed .3 implementations, removes those three
-- invalid qualifications, and preserves every table, credential, receipt, and row.

begin;
set local lock_timeout = '3s';
set local statement_timeout = '30s';

do $repair$
declare
  v_health_proc pg_catalog.regprocedure := pg_catalog.to_regprocedure(
    'public.flashcard_integrity_health()'
  );
  v_ack_proc pg_catalog.regprocedure := pg_catalog.to_regprocedure(
    'public.flashcard_integrity_acknowledge_outbox(text,timestamptz,text,text,text,text,text)'
  );
  v_health_definition text;
  v_ack_definition text;
  v_repaired_definition text;
begin
  if v_health_proc is null or v_ack_proc is null then
    raise exception using
      errcode = '55000',
      message = 'Exact-batch schema .3 functions are missing; qualification repair was not applied.';
  end if;

  v_health_definition := pg_catalog.lower(
    pg_catalog.pg_get_functiondef(v_health_proc)
  );
  if pg_catalog.strpos(v_health_definition, '2026-08-15.3') = 0
     or pg_catalog.strpos(v_health_definition, 'ackbatchdigest') = 0
     or pg_catalog.strpos(
       v_health_definition,
       'v_batch_count = least(v_reported_pending, 500::bigint)'
     ) = 0 and pg_catalog.strpos(
       v_health_definition,
       'v_batch_count = pg_catalog.least(v_reported_pending, 500::bigint)'
     ) = 0 then
    raise exception using
      errcode = '55000',
      message = 'Live health RPC is not the reviewed exact-batch schema .3 implementation.';
  end if;

  v_repaired_definition := replace(
    pg_catalog.pg_get_functiondef(v_health_proc),
    'pg_catalog.least(',
    'least('
  );
  if pg_catalog.strpos(
       pg_catalog.lower(v_repaired_definition),
       'pg_catalog.least('
     ) > 0
     or pg_catalog.strpos(
       pg_catalog.lower(v_repaired_definition),
       'v_batch_count = least(v_reported_pending, 500::bigint)'
     ) = 0 then
    raise exception using
      errcode = '55000',
      message = 'Health RPC qualification repair postcondition failed.';
  end if;
  execute v_repaired_definition;

  v_ack_definition := pg_catalog.lower(
    pg_catalog.pg_get_functiondef(v_ack_proc)
  );
  if pg_catalog.strpos(v_ack_definition, '''schemaversion'', ''2026-08-15.2''') = 0
     or pg_catalog.strpos(v_ack_definition, 'outbox.outbox_id = any(v_batch_ids)') = 0
     or (
       pg_catalog.strpos(v_ack_definition, 'attempts = least(') = 0
       and pg_catalog.strpos(v_ack_definition, 'attempts = pg_catalog.least(') = 0
     )
     or (
       pg_catalog.strpos(v_ack_definition, 'v_resulting_watermark := greatest(') = 0
       and pg_catalog.strpos(
         v_ack_definition,
         'v_resulting_watermark := pg_catalog.greatest('
       ) = 0
     ) then
    raise exception using
      errcode = '55000',
      message = 'Live acknowledgement RPC is not the reviewed exact-batch schema .3 implementation.';
  end if;

  v_repaired_definition := replace(
    replace(
      pg_catalog.pg_get_functiondef(v_ack_proc),
      'pg_catalog.least(',
      'least('
    ),
    'pg_catalog.greatest(',
    'greatest('
  );
  if pg_catalog.strpos(
       pg_catalog.lower(v_repaired_definition),
       'pg_catalog.least('
     ) > 0
     or pg_catalog.strpos(
       pg_catalog.lower(v_repaired_definition),
       'pg_catalog.greatest('
     ) > 0
     or pg_catalog.strpos(
       pg_catalog.lower(v_repaired_definition),
       'outbox.outbox_id = any(v_batch_ids)'
     ) = 0 then
    raise exception using
      errcode = '55000',
      message = 'Acknowledgement RPC qualification repair postcondition failed.';
  end if;
  execute v_repaired_definition;
end;
$repair$;

revoke all on function public.flashcard_integrity_health()
  from public, anon, authenticated, service_role;
grant execute on function public.flashcard_integrity_health() to anon;

revoke all on function public.flashcard_integrity_acknowledge_outbox(
  text, timestamptz, text, text, text, text, text
) from public, anon, authenticated, service_role;
grant execute on function public.flashcard_integrity_acknowledge_outbox(
  text, timestamptz, text, text, text, text, text
) to anon;

notify pgrst, 'reload schema';
commit;
