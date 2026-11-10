-- Literary Devices account progress. Applied to the production Supabase project
-- on 2026-11-10 and retained here as the reproducible configuration record.
insert into flashcard_integrity.state_key_rules
  (state_key,expected_json_type,max_payload_bytes,write_strategy,v2_writable,enabled,description,updated_at)
values
  ('literaryDeviceProgressV1','object',1048576,'versioned_replace',true,true,
   'Per-account Literary Devices standard and correct-usage exercise progress',now())
on conflict (state_key) do update set
  expected_json_type=excluded.expected_json_type,
  max_payload_bytes=excluded.max_payload_bytes,
  write_strategy=excluded.write_strategy,
  v2_writable=excluded.v2_writable,
  enabled=excluded.enabled,
  description=excluded.description,
  updated_at=excluded.updated_at;
